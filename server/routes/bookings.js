const router = require('express').Router();
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { protect } = require('../middleware/auth');

const MAX_SEATS = 8;

// Create a booking. The seat claim is a single atomic update, so two people
// can never book the same seat even if they click at the same moment.
router.post('/', protect, async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;
    if (!Array.isArray(seats) || seats.length === 0)
      return res.status(400).json({ message: 'Select at least one seat' });
    if (seats.length > MAX_SEATS)
      return res.status(400).json({ message: `You can book up to ${MAX_SEATS} seats at once` });

    const unique = [...new Set(seats)];
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    if (showtime.startsAt < new Date())
      return res.status(400).json({ message: 'This showtime has already started' });

    const valid = unique.every((s) => {
      const row = String(s).charCodeAt(0) - 65;
      const num = parseInt(String(s).slice(1), 10);
      return row >= 0 && row < showtime.rows && num >= 1 && num <= showtime.seatsPerRow;
    });
    if (!valid) return res.status(400).json({ message: 'One or more seats do not exist' });

    const claimed = await Showtime.findOneAndUpdate(
      { _id: showtimeId, bookedSeats: { $not: { $elemMatch: { $in: unique } } } },
      { $push: { bookedSeats: { $each: unique } } },
      { new: true }
    );
    if (!claimed)
      return res.status(409).json({ message: 'Some of those seats were just taken. Please pick others' });

    const booking = await Booking.create({
      user: req.user._id,
      showtime: showtimeId,
      seats: unique,
      totalPrice: unique.length * showtime.price,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// My bookings
router.get('/mine', protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'showtime', populate: { path: 'movie', select: 'title posterUrl' } });
  res.json(bookings);
});

// Cancel a booking and release its seats
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Booking is already cancelled' });

    const showtime = await Showtime.findById(booking.showtime);
    if (showtime && showtime.startsAt < new Date())
      return res.status(400).json({ message: 'You cannot cancel after the showtime has started' });

    await Showtime.updateOne({ _id: booking.showtime }, { $pull: { bookedSeats: { $in: booking.seats } } });
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
