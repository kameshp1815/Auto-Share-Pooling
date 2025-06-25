const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  name: { type: String },
  profilePic: { type: String },
});

module.exports = mongoose.model('User', userSchema);