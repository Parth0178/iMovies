const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    screen: { type: String, required: true },
    startsAt: { type: Date, required: true },
    price: { type: Number, required: true },
    rows: { type: Number, default: 8 },
    seatsPerRow: { type: Number, default: 10 },
    bookedSeats: { type: [String], default: [] }, // e.g. "A1", "C7"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', showtimeSchema);
