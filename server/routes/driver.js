const express = require('express');
const User = require('../models/User');
const Ride = require('../models/Ride');
const router = express.Router();

// Helper: ensure driver exists and is approved
async function findApprovedDriver(email) {
  if (!email) return null;
  const driver = await User.findOne({ email: (email || '').toLowerCase(), type: 'driver' });
  if (!driver || driver.banned || !driver.driverApproved) return null;
  return driver;
}

// Set driver online
router.post('/online', async (req, res) => {
  try {
    const { email } = req.body;
    const driver = await findApprovedDriver(email);
    if (!driver) return res.status(400).json({ message: 'Driver not found or not approved' });
    if (driver.currentRideId) {
      driver.driverStatus = 'on_trip';
    } else {
      driver.driverStatus = 'online_idle';
    }
    await driver.save();
    res.json({ message: 'Driver set online', driverStatus: driver.driverStatus });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Set driver offline
router.post('/offline', async (req, res) => {
  try {
    const { email } = req.body;
    const driver = await findApprovedDriver(email);
    if (!driver) return res.status(400).json({ message: 'Driver not found or not approved' });
    if (driver.currentRideId) {
      // Do not drop active ride; just mark status consistent
      driver.driverStatus = 'on_trip';
    } else {
      driver.driverStatus = 'offline';
    }
    await driver.save();
    res.json({ message: 'Driver set offline', driverStatus: driver.driverStatus });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update driver location
router.post('/location', async (req, res) => {
  try {
    const { email, lat, lng, heading, speed } = req.body;
    const driver = await findApprovedDriver(email);
    if (!driver) return res.status(400).json({ message: 'Driver not found or not approved' });
    driver.location = {
      lat,
      lng,
      heading,
      speed,
      updatedAt: new Date()
    };
    await driver.save();
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active state
router.get('/active/:email', async (req, res) => {
  try {
    const driver = await User.findOne({ email: (req.params.email || '').toLowerCase(), type: 'driver' }).lean();
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    let activeRide = null;
    if (driver.currentRideId) {
      activeRide = await Ride.findById(driver.currentRideId).lean();
    }
    res.json({
      driverStatus: driver.driverStatus || 'offline',
      currentRideId: driver.currentRideId || null,
      activeRide
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


