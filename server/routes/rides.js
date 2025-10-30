const express = require('express');
const Ride = require('../models/Ride');
const User = require('../models/User');
const router = express.Router();
const { emitRideRequestToDriver, emitRideStatusUpdate } = require('..');

// Book a new ride
router.post('/book', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const { from, to, vehicle, fare, distance } = req.body;
    console.log('POST /api/rides/book', { email, from, to, vehicle, fare, distance });
    if (!email || !from || !to) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Fetch user phone
    const user = await User.findOne({ email });
    const userPhone = user ? user.phone : '';
    
    // Check if there are potential shared rides on similar routes
    // This is a simple implementation - in a real app, you'd use geospatial queries
    const potentialSharedRides = await Ride.find({
      status: 'Requested',
      driver: '',
      vehicle: vehicle,
      isShared: false,
      sharedRideOffered: false
    });
    
    const ride = new Ride({
      email,
      from,
      to,
      vehicle: vehicle || '',
      fare: fare || '',
      distance: distance || '',
      status: 'Requested',
      requestedAt: new Date(),
      driver: '',
      completedAt: null,
      userPhone,
      // If there are potential shared rides, mark this ride as having a shared ride offer
      sharedRideOffered: potentialSharedRides.length > 0,
      originalFare: fare || ''
    });
    
    await ride.save();
    res.json({ 
      message: 'Ride booked successfully!', 
      rideId: ride._id,
      sharedRideOffered: ride.sharedRideOffered
    });
  } catch (err) {
    console.error('Error in /book:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle shared ride acceptance or rejection
router.post('/shared-ride/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { accept } = req.body;
    
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (accept) {
      // Apply discount for shared ride (e.g., 20% off)
      const originalFare = parseFloat(ride.fare.replace('₹', ''));
      const discountedFare = Math.round(originalFare * 0.8);
      
      ride.isShared = true;
      ride.sharedRideAccepted = true;
      ride.sharedRideDeclined = false;
      ride.originalFare = ride.fare;
      ride.sharedRideDiscount = '20%';
      ride.fare = `₹${discountedFare}`;
    } else {
      ride.sharedRideOffered = false;
      ride.sharedRideDeclined = true;
      ride.sharedRideAccepted = false;
    }
    
    await ride.save();
    
    res.json({ 
      message: accept ? 'Shared ride accepted' : 'Shared ride declined',
      ride
    });
  } catch (err) {
    console.error('Error in /shared-ride:', err);
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
    const ride = await Ride.findOne({ email: req.params.email, status: { $in: ['Accepted', 'Arrived', 'Started', 'Ongoing'] } });
    if (!ride) return res.status(404).json(null);
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DRIVER DASHBOARD ENDPOINTS

// Get all available rides (not assigned to any driver and not completed)
router.get('/available', async (req, res) => {
  const rides = await Ride.find({ driver: '', status: { $in: ['Requested'] } });
  res.json(rides);
});

// Accept a ride (assign to driver)
router.post('/accept/:rideId', async (req, res) => {
  try {
    const driver = (req.body.driver || '').toLowerCase();
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.driver) return res.status(400).json({ message: 'Ride already accepted' });
    if (ride.status !== 'Requested') return res.status(400).json({ message: 'Ride not in requested state' });
    
    // Fetch driver details
    const User = require('../models/User');
    const driverUser = await User.findOne({ email: driver, type: 'driver' });
    
    if (!driverUser) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Update ride with driver details
    ride.driver = driver;
    ride.status = 'Accepted';
    ride.acceptedAt = new Date();
    ride.driverDetails = {
      name: driverUser.name || '',
      phone: driverUser.phone || '',
      vehicleNumber: driverUser.vehicleRegNumber || '',
      vehicleType: driverUser.vehicleType || '',
      vehicleModel: driverUser.vehicleMakeModel || ''
    };
    
    await ride.save();
    
    // Emit WebSocket event to notify user about ride acceptance
    if (emitRideStatusUpdate) {
      console.log('Emitting ride status update for user:', ride.email);
      console.log('Ride details:', {
        rideId: ride._id,
        status: ride.status,
        driverDetails: ride.driverDetails
      });
      emitRideStatusUpdate(ride.email, {
        rideId: ride._id,
        status: ride.status,
        driverDetails: ride.driverDetails
      });
    }
    
    res.json({ message: 'Ride accepted', ride });
  } catch (err) {
    console.error('Error accepting ride:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline a ride (keep it available)
router.post('/decline/:rideId', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.driver) return res.status(400).json({ message: 'Ride already accepted' });
    // keep as Requested
    res.json({ message: 'Ride declined' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark driver arrived
router.post('/arrived/:rideId', async (req, res) => {
  try {
    const { driver } = req.body;
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.driver !== (driver || '').toLowerCase()) return res.status(403).json({ message: 'Not your ride' });
    if (ride.status !== 'Accepted') return res.status(400).json({ message: 'Ride not in accepted state' });
    ride.status = 'Arrived';
    ride.arrivedAt = new Date();
    await ride.save();
    
    // Emit WebSocket event for status update
    if (emitRideStatusUpdate) {
      emitRideStatusUpdate(ride.email, {
        rideId: ride._id,
        status: ride.status,
        driverDetails: ride.driverDetails
      });
    }
    
    res.json({ message: 'Marked as arrived', ride });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start ride
router.post('/start/:rideId', async (req, res) => {
  try {
    const { driver } = req.body;
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.driver !== (driver || '').toLowerCase()) return res.status(403).json({ message: 'Not your ride' });
    if (!['Accepted', 'Arrived'].includes(ride.status)) return res.status(400).json({ message: 'Ride not in correct state to start' });
    ride.status = 'Started';
    ride.startedAt = new Date();
    await ride.save();
    
    // Emit WebSocket event for status update
    if (emitRideStatusUpdate) {
      emitRideStatusUpdate(ride.email, {
        rideId: ride._id,
        status: ride.status,
        driverDetails: ride.driverDetails
      });
    }
    
    res.json({ message: 'Ride started', ride });
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
    const { driver, paymentMethod } = req.body;
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.driver !== (driver || '').toLowerCase()) return res.status(403).json({ message: 'Not your ride' });
    if (!['Started', 'Ongoing'].includes(ride.status)) return res.status(400).json({ message: 'Ride not in progress' });
    ride.status = 'Completed';
    ride.completedAt = new Date();
    ride.paymentMethod = paymentMethod || '';
    await ride.save();
    
    // Emit WebSocket event for status update
    const { emitRideStatusUpdate } = require('..');
    if (emitRideStatusUpdate) {
      emitRideStatusUpdate(ride.email, {
        rideId: ride._id,
        status: ride.status,
        driverDetails: ride.driverDetails
      });
    }
    
    res.json({ message: 'Ride marked as completed', ride });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a ride (user-initiated)
router.post('/cancel/:rideId', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status === 'Completed') return res.status(400).json({ message: 'Ride already completed' });
    if (ride.status === 'Cancelled') return res.status(400).json({ message: 'Ride already cancelled' });

    ride.status = 'Cancelled';
    ride.cancelledAt = new Date();
    await ride.save();

    // Emit WebSocket event for status update
    const { emitRideStatusUpdate } = require('..');
    if (emitRideStatusUpdate) {
      emitRideStatusUpdate(ride.email, {
        rideId: ride._id,
        status: ride.status,
        driverDetails: ride.driverDetails
      });
    }

    res.json({ message: 'Ride cancelled', ride });
  } catch (err) {
    console.error('Error cancelling ride:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Earnings: daily and weekly by driver
router.get('/earnings/:driver', async (req, res) => {
  try {
    const driver = (req.params.driver || '').toLowerCase();
    const sinceDay = new Date();
    sinceDay.setHours(0,0,0,0);
    const sinceWeek = new Date();
    sinceWeek.setDate(sinceWeek.getDate() - 7);
    const [dayRides, weekRides] = await Promise.all([
      Ride.find({ driver, status: 'Completed', completedAt: { $gte: sinceDay } }),
      Ride.find({ driver, status: 'Completed', completedAt: { $gte: sinceWeek } })
    ]);

    function sum(rides) {
      return rides.reduce((acc, r) => acc + (parseFloat(r.fare || '0') || 0), 0);
    }
    function countByMethod(rides) {
      const cash = rides.filter(r => r.paymentMethod === 'cash').length;
      const online = rides.filter(r => r.paymentMethod === 'online').length;
      return { cash, online };
    }

    const day = {
      total: sum(dayRides),
      rides: dayRides.length,
      breakdown: countByMethod(dayRides)
    };
    const week = {
      total: sum(weekRides),
      rides: weekRides.length,
      breakdown: countByMethod(weekRides)
    };
    res.json({ day, week });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// [Removed] Performance metrics endpoint

module.exports = router;