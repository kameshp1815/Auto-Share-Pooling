const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  purpose: { type: String, enum: ['register'], default: 'register', index: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
