const express = require('express');
const Ride = require('../models/Ride');
const router = express.Router();

// Book a new ride
router.post('/book', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const { from, to, vehicle, fare, distance } = req.body;
    console.log('POST /api/rides/book', { email, from, to, vehicle, fare, distance });
    if (!email || !from || !to) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const ride = new Ride({
      email,
      from,
      to,
      vehicle: vehicle || '',
      fare: fare || '',
      distance: distance || '',
      status: 'Ongoing',
      startedAt: new Date(),
      driver: '',
      completedAt: null
    });
    await ride.save();
    res.json({ message: 'Ride booked successfully!' });
  } catch (err) {
    console.error('Error in /book:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all rides for a user (booking history)
router.get('/history/:email', async (req, res) => {
  try {
    const email = (req.params.email || '').toLowerCase();
    const rides = await Ride.find({ email }).sort({ startedAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ongoing ride for a user
router.get('/ongoing/:email', async (req, res) => {
  try {
    const ride = await Ride.findOne({ email: req.params.email, status: 'Ongoing' });
    if (!ride) return res.status(404).json(null);
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DRIVER DASHBOARD ENDPOINTS

// Get all available rides (not assigned to any driver and not completed)
router.get('/available', async (req, res) => {
  try {
    const rides = await Ride.find({ driver: '', status: { $ne: 'Completed' } }).sort({ startedAt: 1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a ride (assign to driver)
router.post('/accept/:rideId', async (req, res) => {
  try {
    const driver = (req.body.driver || '').toLowerCase();
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.driver) return res.status(400).json({ message: 'Ride already accepted' });
    ride.driver = driver;
    ride.status = 'Ongoing';
    await ride.save();
    res.json({ message: 'Ride accepted', ride });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all rides for a driver
router.get('/driver/:email', async (req, res) => {
  try {
    const driver = (req.params.email || '').toLowerCase();
    const rides = await Ride.find({ driver }).sort({ startedAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a ride
router.post('/complete/:rideId', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    ride.status = 'Completed';
    ride.completedAt = new Date();
    await ride.save();
    res.json({ message: 'Ride marked as completed', ride });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;