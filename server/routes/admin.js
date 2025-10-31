const express = require('express');
const User = require('../models/User');
const Ride = require('../models/Ride');
let RideGroup;
try { RideGroup = require('../models/RideGroup'); } catch { RideGroup = null; }
let DriverStatus;
try { DriverStatus = require('../models/DriverStatus'); } catch { DriverStatus = null; }

const router = express.Router();

// KPIs and simple timeseries
router.get('/metrics', async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersCount = await User.countDocuments({});
    const driversCount = await User.countDocuments({ role: 'driver' });
    const onlineDrivers = DriverStatus ? await DriverStatus.countDocuments({ availability: 'online' }) : 0;
    const ridesToday = await Ride.countDocuments({ createdAt: { $gte: today } });
    const groupsToday = RideGroup ? await RideGroup.countDocuments({ createdAt: { $gte: today } }) : 0;

    const days = 7;
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const dStart = new Date();
      dStart.setHours(0, 0, 0, 0);
      dStart.setDate(dStart.getDate() - i);
      const dEnd = new Date(dStart);
      dEnd.setDate(dEnd.getDate() + 1);
      // eslint-disable-next-line no-await-in-loop
      const count = await Ride.countDocuments({ createdAt: { $gte: dStart, $lt: dEnd } });
      series.push({ date: dStart.toISOString().slice(0, 10), rides: count });
    }

    res.json({ usersCount, driversCount, onlineDrivers, ridesToday, groupsToday, series });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load metrics', error: err.message });
  }
});

// Rides with filters
router.get('/rides', async (req, res) => {
  try {
    const { status, dateFrom, dateTo, userId, driver, limit = 100 } = req.query || {};
    const q = {};
    if (status) q.status = new RegExp(`^${String(status).trim()}$`, 'i');
    if (userId) q.email = String(userId).trim(); // legacy Ride uses email for user
    if (driver) q.driver = new RegExp(String(driver).trim(), 'i');
    if (dateFrom || dateTo) {
      q.createdAt = {};
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      if (from && !isNaN(from)) q.createdAt.$gte = from;
      if (to && !isNaN(to)) q.createdAt.$lte = to;
      if (Object.keys(q.createdAt).length === 0) delete q.createdAt;
    }
    const rides = await Ride.find(q).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list rides', error: err.message });
  }
});

// Groups (if pooling is enabled in this repo)
router.get('/groups', async (req, res) => {
  if (!RideGroup) return res.json([]);
  try {
    const { status, driverId, limit = 100 } = req.query || {};
    const q = {};
    if (status) q.status = new RegExp(`^${String(status).trim()}$`, 'i');
    if (driverId) q.driverId = driverId;
    const groups = await RideGroup.find(q).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list groups', error: err.message });
  }
});

module.exports = router;
