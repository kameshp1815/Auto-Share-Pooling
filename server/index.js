const express = require('express');
const path = require('path');
const Ride = require('./models/Ride');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const googleAuthRoute = require('./routes/googleAuth');
const driverRoutes = require('./routes/driver');

const app = express();
const PORT = process.env.PORT || 5000;
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: { origin: '*'}
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Razorpay with proper error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('Razorpay initialized successfully');
} catch (error) {
  console.error('Razorpay initialization failed:', error.message);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/auth', googleAuthRoute);
app.use('/api/driver', driverRoutes);

// Root route for server status
app.get('/', (req, res) => {
  res.send('AutoSharePolling Backend Server is running');
});

// Create Razorpay order
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
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);
    res.json(order);
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({
      message: 'Failed to create payment order',
      error: err.message
    });
  }
});

// Verify payment and update ride
app.post('/api/payment/verify', async (req, res) => {
  const { paymentId, orderId, signature, rideId } = req.body;

  try {
    if (!paymentId || !orderId || !signature || !rideId) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }

    // Handle cash payment
    if (paymentId === 'cash' && orderId === 'cash' && signature === 'cash') {
      const Ride = require('./models/Ride');
      const updatedRide = await Ride.findByIdAndUpdate(rideId, {
        paymentStatus: 'cash',
        paymentId: 'cash'
      }, { new: true });

      if (!updatedRide) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      console.log('Cash payment confirmed and ride updated:', rideId);
      return res.json({
        message: 'Cash payment confirmed and ride updated',
        ride: updatedRide
      });
    }

    // Verify signature for online payment
    const crypto = require('crypto');
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.error('Payment signature verification failed');
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const Ride = require('./models/Ride');
    const updatedRide = await Ride.findByIdAndUpdate(rideId, {
      paymentStatus: 'paid',
      paymentId: paymentId
    }, { new: true });

    if (!updatedRide) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    console.log('Payment verified and ride updated:', rideId);
    res.json({
      message: 'Payment verified and ride updated',
      ride: updatedRide
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({
      message: 'Failed to verify payment',
      error: err.message
    });
  }
});

// Get payment status for a ride
app.get('/api/payment/status/:rideId', async (req, res) => {
  try {
    const Ride = require('./models/Ride');
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json({
      paymentStatus: ride.paymentStatus,
      paymentId: ride.paymentId
    });
  } catch (err) {
    console.error('Payment status check error:', err);
    res.status(500).json({
      message: 'Failed to check payment status',
      error: err.message
    });
  }
});

// Socket.IO: track online drivers
const onlineDriverEmailToSocketId = new Map();

io.on('connection', (socket) => {
  socket.on('driver:online', ({ email }) => {
    if (!email) return;
    onlineDriverEmailToSocketId.set(email.toLowerCase(), socket.id);
  });

  socket.on('driver:offline', ({ email }) => {
    if (!email) return;
    onlineDriverEmailToSocketId.delete(email.toLowerCase());
  });

  socket.on('disconnect', () => {
    for (const [email, id] of onlineDriverEmailToSocketId.entries()) {
      if (id === socket.id) onlineDriverEmailToSocketId.delete(email);
    }
  });

  // Receive driver live location and persist + broadcast
  socket.on('driver:location', async ({ email, lat, lng }) => {
    try {
      const driver = (email || '').toLowerCase();
      if (!driver || typeof lat !== 'number' || typeof lng !== 'number') return;
      // Update the latest non-completed ride for this driver
      const ride = await Ride.findOneAndUpdate(
        { driver, status: { $in: ['Accepted','Arrived','Started','Ongoing'] } },
        { $set: { driverLocation: { lat, lng, updatedAt: new Date() } } },
        { sort: { updatedAt: -1 }, new: true }
      );
      if (ride) {
        io.emit('ride:driver-location', {
          userEmail: (ride.email || '').toLowerCase(),
          lat,
          lng,
          rideId: ride._id.toString(),
          updatedAt: Date.now()
        });
      }
    } catch (e) {
      // swallow
    }
  });
});

// Helper to emit a ride request to a specific driver by email
async function emitRideRequestToDriver(driverEmail, ride) {
  const sid = onlineDriverEmailToSocketId.get((driverEmail || '').toLowerCase());
  if (sid) {
    io.to(sid).emit('ride:request', {
      rideId: ride._id,
      pickup: ride.from,
      dropoff: ride.to,
      price: ride.fare,
      distance: ride.distance,
      vehicle: ride.vehicle,
      timeLimit: 15000
    });
  }
}

// Helper to emit ride status updates to users
function emitRideStatusUpdate(userEmail, data) {
  console.log('Broadcasting ride status update to all clients');
  console.log('User email:', userEmail);
  console.log('Data:', data);
  
  // For now, we'll broadcast to all connected clients
  // In a production app, you'd want to track user connections
  io.emit('ride:status-update', {
    userEmail: userEmail.toLowerCase(),
    ...data
  });
}

// Start the server on HTTP server
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
