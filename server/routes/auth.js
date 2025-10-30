const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/driver_docs'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage });

// Ensure uploads directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/driver_docs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Email transport for OTP (configure via env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

// Request OTP for registration
router.post('/request-otp', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email required' });

    // Basic cooldown: if an unexpired OTP exists within 60s, reject
    const now = new Date();
    const existing = await Otp.findOne({ email, purpose: 'register', verified: false, expiresAt: { $gt: now } }).sort({ createdAt: -1 });
    if (existing && (now - existing.createdAt) < 60000) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await Otp.create({ email, code, purpose: 'register', expiresAt });

    if (!process.env.SMTP_HOST) {
      console.warn('SMTP not configured. Logging OTP to server logs for dev only:', code);
    } else {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Your AutoSharePooling OTP',
        text: `Your OTP is ${code}. It expires in 10 minutes.`,
        html: `<p>Your OTP is <b>${code}</b>. It expires in 10 minutes.</p>`
      });
    }

    return res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('request-otp error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP for registration
router.post('/verify-otp', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const code = (req.body.code || '').trim();
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

    const otp = await Otp.findOne({ email, purpose: 'register', verified: false }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ message: 'No OTP requested' });
    if (otp.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });
    if (otp.attempts >= 5) return res.status(429).json({ message: 'Too many attempts' });

    if (otp.code !== code) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otp.verified = true;
    await otp.save();
    return res.json({ message: 'OTP verified' });
  } catch (err) {
    console.error('verify-otp error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number.' });
  }
  try {
    // Enforce verified OTP before registration
    const verifiedOtp = await Otp.findOne({ email: (email || '').toLowerCase(), purpose: 'register', verified: true }).sort({ createdAt: -1 });
    if (!verifiedOtp) {
      return res.status(400).json({ message: 'Please verify your email with OTP before registering.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, type: role || 'user' });
    await user.save();
    // Invalidate OTP after successful registration
    await Otp.deleteMany({ email: (email || '').toLowerCase(), purpose: 'register' });
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (role && user.type !== role) {
      return res.status(400).json({ message: `No ${role} account found with this email.` });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ email, type: user.type }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, type: user.type });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Driver Register
router.post('/driver-register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid phone number.' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, type: 'driver' });
    await user.save();
    res.status(201).json({ message: 'Driver registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Driver Login
router.post('/driver-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, type: 'driver' });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.banned) {
      return res.status(403).json({ message: 'Admin banned you' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ email, type: user.type }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, type: user.type });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get driver profile by email
router.get('/driver-profile/:email', async (req, res) => {
  try {
    const email = (req.params.email || '').toLowerCase();
    const user = await User.findOne({ email, type: 'driver' }, '-password');
    if (!user) return res.status(404).json({ message: 'Driver not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Driver profile completion endpoint
router.post('/driver-profile/complete', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'licenseFile', maxCount: 1 },
  { name: 'vehicleRCFile', maxCount: 1 },
  { name: 'vehicleInsuranceFile', maxCount: 1 },
  { name: 'vehiclePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email, type: 'driver' });
    if (!user) return res.status(404).json({ message: 'Driver not found' });
    // Update fields
    user.profilePic = req.files['profilePic']?.[0]?.path ? req.files['profilePic'][0].path.replace(/^.*uploads[\\/]/, 'uploads/') : user.profilePic;
    user.licenseNumber = req.body.licenseNumber;
    user.licenseExpiry = req.body.licenseExpiry;
    user.licenseFile = req.files['licenseFile']?.[0]?.path ? req.files['licenseFile'][0].path.replace(/^.*uploads[\\/]/, 'uploads/') : user.licenseFile;
    user.vehicleType = req.body.vehicleType;
    user.vehicleMakeModel = req.body.vehicleMakeModel;
    user.vehicleRegNumber = req.body.vehicleRegNumber;
    user.vehicleYear = req.body.vehicleYear;
    user.vehicleRCFile = req.files['vehicleRCFile']?.[0]?.path ? req.files['vehicleRCFile'][0].path.replace(/^.*uploads[\\/]/, 'uploads/') : user.vehicleRCFile;
    user.vehicleInsuranceFile = req.files['vehicleInsuranceFile']?.[0]?.path ? req.files['vehicleInsuranceFile'][0].path.replace(/^.*uploads[\\/]/, 'uploads/') : user.vehicleInsuranceFile;
    user.vehiclePhoto = req.files['vehiclePhoto']?.[0]?.path ? req.files['vehiclePhoto'][0].path.replace(/^.*uploads[\\/]/, 'uploads/') : user.vehiclePhoto;
    user.emergencyContact = {
      name: req.body.emergencyContactName,
      relationship: req.body.emergencyContactRelationship,
      phone: req.body.emergencyContactPhone
    };
    user.agreeToTerms = req.body.agreeToTerms === 'true' || req.body.agreeToTerms === true;
    user.consentBackgroundCheck = req.body.consentBackgroundCheck === 'true' || req.body.consentBackgroundCheck === true;
    user.driverProfileCompleted = true;
    await user.save();
    res.json({ message: 'Driver profile completed', user });
  } catch (err) {
    console.error('Driver profile completion error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all users (admin)
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({ type: 'user' }, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all drivers (admin)
router.get('/admin/drivers', async (req, res) => {
  try {
    const drivers = await User.find({ type: 'driver' }, '-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a driver (admin)
router.post('/admin/drivers/:id/approve', async (req, res) => {
  try {
    const driver = await User.findByIdAndUpdate(
      req.params.id,
      { driverApproved: true },
      { new: true, select: '-password' }
    );
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver approved', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban a driver (admin)
router.post('/admin/drivers/:id/ban', async (req, res) => {
  try {
    const driver = await User.findByIdAndUpdate(
      req.params.id,
      { banned: true },
      { new: true, select: '-password' }
    );
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver banned', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unban a driver (admin)
router.post('/admin/drivers/:id/unban', async (req, res) => {
  try {
    const driver = await User.findByIdAndUpdate(
      req.params.id,
      { banned: false },
      { new: true, select: '-password' }
    );
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver unbanned', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Alternative email-based admin actions (more resilient if id mismatch)
router.post('/admin/drivers/approve', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email required' });
    const driver = await User.findOneAndUpdate(
      { email, type: 'driver' },
      { driverApproved: true },
      { new: true, select: '-password' }
    );
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver approved', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/drivers/ban', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email required' });
    const driver = await User.findOneAndUpdate(
      { email, type: 'driver' },
      { banned: true },
      { new: true, select: '-password' }
    );
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver banned', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/drivers/unban', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email required' });
    const driver = await User.findOneAndUpdate(
      { email, type: 'driver' },
      { banned: false },
      { new: true, select: '-password' }
    );
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver unbanned', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;