# IMovies

Online cinema booking platform: browse movies, pick a showtime, and reserve seats with live availability.
Built with **React (Vite) + Bootstrap**, **Node.js + Express**, **MongoDB (Mongoose)** and **JWT** auth.

## Prerequisites
- Node.js v16+ and npm v8+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

## Setup
```bash
# 1. Install everything (root, server, client)
npm run install:all

# 2. Configure the server (server/.env is already created; edit MONGO_URI / JWT_SECRET if needed)

# 3. Load sample movies, showtimes and users
npm run seed

# 4. Start API (port 5000) and client (port 5173) together
npm run dev
```
Open http://localhost:5173

## Demo accounts (created by the seed script)
| Role  | Email               | Password |
|-------|---------------------|----------|
| User  | user@imovies.com    | user123  |
| Admin | admin@imovies.com   | admin123 |

## Project structure
```
imovies/
├── server/
│   ├── config/db.js            MongoDB connection
│   ├── models/                 User, Movie, Showtime, Booking
│   ├── middleware/auth.js      JWT protect + adminOnly
│   ├── routes/                 auth, movies, showtimes, bookings
│   ├── seed.js                 Sample data
│   └── server.js
└── client/
    └── src/
        ├── context/AuthContext.jsx
        ├── components/         Navbar, ProtectedRoute, SeatMap
        ├── pages/              Home, MovieDetails, Booking, MyBookings, AuthForm
        └── api.js              Axios instance with JWT header
```

## API
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | – | Create account |
| POST | /api/auth/login | – | Log in, returns JWT |
| GET | /api/auth/me | user | Current user |
| GET | /api/movies?search=&genre= | – | List movies |
| GET | /api/movies/:id | – | Movie + upcoming showtimes |
| POST | /api/movies | admin | Add movie |
| GET | /api/showtimes/:id | – | Showtime with booked seats |
| POST | /api/showtimes | admin | Add showtime |
| POST | /api/bookings | user | Book seats `{ showtimeId, seats: ["A1","A2"] }` |
| GET | /api/bookings/mine | user | My bookings |
| DELETE | /api/bookings/:id | user | Cancel booking, releases seats |

## How it works
- **Real-time availability:** the booking page polls the showtime every 5 seconds and removes any seat someone else has taken from your selection.
- **No double booking:** seats are claimed with one atomic MongoDB update (`findOneAndUpdate` with a `$not/$elemMatch` guard). If any seat is already taken, the request returns 409.
- **Security:** passwords hashed with bcrypt; JWT (7 days) sent as a Bearer token; admin-only routes for adding movies and showtimes.
