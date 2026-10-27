require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const User = require('./models/User');
const Booking = require('./models/Booking');

const poster = (t, c) =>
  `https://placehold.co/400x600/${c}/F6EDE8?text=${encodeURIComponent(t)}&font=playfair-display`;

const movies = [
  { title: 'Midnight Express Line', genre: ['Thriller'], durationMins: 118, rating: 'PG-13', color: '3B1D2E',
    description: 'A night-shift train conductor notices the same passenger boarding at every stop.' },
  { title: 'The Last Lighthouse', genre: ['Drama'], durationMins: 132, rating: 'PG', color: '1F3A44',
    description: 'Three generations of keepers face the winter that decides the fate of their island.' },
  { title: 'Paper Moon Heist', genre: ['Comedy', 'Crime'], durationMins: 104, rating: 'PG-13', color: '4A3A1D',
    description: 'A retired origami teacher and her book club plan the neatest robbery in town.' },
  { title: 'Orbit 9', genre: ['Sci-Fi'], durationMins: 141, rating: 'PG-13', color: '1D2B4A',
    description: 'The crew of a failing station has nine orbits to repair the signal home.' },
  { title: 'Saffron Streets', genre: ['Romance', 'Drama'], durationMins: 126, rating: 'PG', color: '5A2A1D',
    description: 'Two rival street-food cooks discover their grandmothers once shared a kitchen.' },
  { title: 'Hollow Pines', genre: ['Horror'], durationMins: 99, rating: 'R', color: '1D3A2A',
    description: 'A family cabin weekend turns when the forest starts repeating what they say.' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Movie.deleteMany(), Showtime.deleteMany(), Booking.deleteMany(), User.deleteMany()]);

  await User.create({ name: 'Admin', email: 'admin@imovies.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Demo User', email: 'user@imovies.com', password: 'user123' });

  const created = await Movie.insertMany(
    movies.map(({ color, ...m }, i) => ({
      ...m,
      posterUrl: poster(m.title, color),
      releaseDate: new Date(Date.now() - i * 86400000 * 9),
    }))
  );

  const slots = [[13, 30], [16, 45], [19, 30], [22, 0]];
  const shows = [];
  created.forEach((movie, mi) => {
    for (let day = 0; day < 5; day++) {
      slots.forEach(([h, m], si) => {
        if ((mi + day + si) % 2 === 0) {
          const d = new Date();
          d.setDate(d.getDate() + day);
          d.setHours(h, m, 0, 0);
          if (d > new Date())
            shows.push({ movie: movie._id, screen: `Screen ${(mi % 3) + 1}`, startsAt: d, price: 12 + (si > 1 ? 3 : 0) });
        }
      });
    }
  });
  await Showtime.insertMany(shows);

  console.log(`Seeded ${created.length} movies, ${shows.length} showtimes`);
  console.log('Admin: admin@imovies.com / admin123');
  console.log('User:  user@imovies.com / user123');
  await mongoose.disconnect();
})();
