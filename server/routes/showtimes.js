const router = require('express').Router();
const Showtime = require('../models/Showtime');
const { protect, adminOnly } = require('../middleware/auth');

// Single showtime with booked seats (clients poll this for live availability)
router.get('/:id', async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie', 'title posterUrl durationMins');
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.json(showtime);
  } catch {
    res.status(400).json({ message: 'Invalid showtime id' });
  }
});

// Admin: add showtime
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Showtime.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
