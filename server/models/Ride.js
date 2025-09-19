const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  email: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  vehicle: { type: String, default: '' },
  fare: { type: String, default: '' },
  distance: { type: String, default: '' },
  status: { type: String, default: 'Ongoing' },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date, default: null },
  arrivedAt: { type: Date, default: null },
  startedAt: { type: Date, default: null },
  driver: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  paymentStatus: { type: String, default: 'pending' },
  paymentId: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['cash', 'online', ''], default: '' },
  userPhone: { type: String, default: '' }
});

module.exports = mongoose.model('Ride', rideSchema);