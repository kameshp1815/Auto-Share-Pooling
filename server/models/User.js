const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  name: { type: String },
  profilePic: { type: String },
  type: { type: String, enum: ["user", "driver"], default: "user" },
  // Driver profile completion fields
  driverProfileCompleted: { type: Boolean, default: false },
  driverApproved: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  // Driver realtime fields
  driverStatus: {
    type: String,
    enum: [
      'offline',
      'online_idle',
      'request_pending',
      'enroute_to_pickup',
      'on_trip'
    ],
    default: 'offline'
  },
  currentRideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', default: null },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    heading: { type: Number },
    speed: { type: Number },
    updatedAt: { type: Date }
  },
  licenseNumber: { type: String },
  licenseExpiry: { type: Date },
  licenseFile: { type: String },
  vehicleType: { type: String },
  vehicleMakeModel: { type: String },
  vehicleRegNumber: { type: String },
  vehicleYear: { type: String },
  vehicleRCFile: { type: String },
  vehicleInsuranceFile: { type: String },
  vehiclePhoto: { type: String },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String }
  },
  agreeToTerms: { type: Boolean },
  consentBackgroundCheck: { type: Boolean }
});

module.exports = mongoose.model('User', userSchema);