const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const googleAuthRoute = require('./routes/googleAuth');
const app = express();
app.use(cors());
app.use(express.json());

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

// Root route for server status
app.get('/', (req, res) => {
  res.send('AutoSharePolling Backend Server is running');
});

// Create Razorpay order
app.post('/api/payment/order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  
  try {
    // Validate input
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
    // Validate input
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

    // Update ride as paid
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

app.listen(5000,'0.0.0.0', () => console.log('Server running on port 5000'));