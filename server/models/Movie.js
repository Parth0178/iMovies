const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    genre: [String],
    language: { type: String, default: 'English' },
    durationMins: { type: Number, required: true },
    rating: { type: String, default: 'PG-13' },
    posterUrl: { type: String, default: '' },
    releaseDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
