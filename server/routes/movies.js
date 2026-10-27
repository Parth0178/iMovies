const router = require('express').Router();
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const { protect, adminOnly } = require('../middleware/auth');

// List movies (optional ?search= & ?genre=)
router.get('/', async (req, res) => {
  const { search, genre } = req.query;
  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (genre) filter.genre = genre;
  res.json(await Movie.find(filter).sort({ releaseDate: -1 }));
});

// Movie details + upcoming showtimes
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    const showtimes = await Showtime.find({ movie: movie._id, startsAt: { $gte: new Date() } })
      .sort({ startsAt: 1 })
      .select('-bookedSeats');
    res.json({ movie, showtimes });
  } catch {
    res.status(400).json({ message: 'Invalid movie id' });
  }
});

// Admin: add movie
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Movie.create(req.body));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
