const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  email: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  vehicle: { type: String, default: '' },
  fare: { type: String, default: '' },
  distance: { type: String, default: '' },
  status: { type: String, default: 'Ongoing' },
  startedAt: { type: Date, default: Date.now },
  driver: { type: String, default: '' },
  completedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Ride', rideSchema);