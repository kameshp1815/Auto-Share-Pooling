const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const googleAuthRoute = require('./routes/googleAuth');
const driverRoutes = require('./routes/driver');

const app = express();

// ✅ Proper CORS Configuration for Vercel Deployment
app.use(cors({
  origin: [
    'http://localhost:5173',                // local dev frontend
    'https://auto-share-pooling.vercel.app' // deployed frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Preflight requests are handled by the main CORS middleware above.

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Razorpay Initialization
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
}

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/auth', googleAuthRoute);
app.use('/api/driver', driverRoutes);

// ✅ Root Endpoint
app.get('/', (req, res) => {
  res.send('🚗 AutoSharePooling Backend is Running on Vercel');
});

// ✅ Create Razorpay Order
app.post('/api/payment/order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!razorpay) {
      return res.status(500).json({ message: 'Payment service not available' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);
    res.json(order);
  } catch (err) {
    console.error('❌ Razorpay order creation error:', err);
    res.status(500).json({
      message: 'Failed to create payment order',
      error: err.message,
    });
  }
});

// ✅ Verify Razorpay Payment
app.post('/api/payment/verify', async (req, res) => {
  const { paymentId, orderId, signature, rideId } = req.body;
  const Ride = require('./models/Ride');

  try {
    if (!paymentId || !orderId || !signature || !rideId) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // Handle Cash Payment
    if (paymentId === 'cash' && orderId === 'cash' && signature === 'cash') {
      const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        { paymentStatus: 'cash', paymentId: 'cash' },
        { new: true }
      );
      if (!updatedRide) return res.status(404).json({ message: 'Ride not found' });

      console.log('💵 Cash payment confirmed for ride:', rideId);
      return res.json({ message: 'Cash payment confirmed', ride: updatedRide });
    }

    // Online Payment Verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.error('❌ Payment verification failed');
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      rideId,
      { paymentStatus: 'paid', paymentId },
      { new: true }
    );
    if (!updatedRide) return res.status(404).json({ message: 'Ride not found' });

    console.log('✅ Payment verified for ride:', rideId);
    res.json({ message: 'Payment verified', ride: updatedRide });
  } catch (err) {
    console.error('❌ Payment verification error:', err);
    res.status(500).json({ message: 'Payment verification failed', error: err.message });
  }
});

// ✅ Get Payment Status
app.get('/api/payment/status/:rideId', async (req, res) => {
  try {
    const Ride = require('./models/Ride');
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });

    res.json({ paymentStatus: ride.paymentStatus, paymentId: ride.paymentId });
  } catch (err) {
    console.error('❌ Payment status fetch error:', err);
    res.status(500).json({ message: 'Failed to check payment status', error: err.message });
  }
});

// ✅ Export for Vercel Serverless
module.exports = app;
