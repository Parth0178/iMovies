import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { errorMessage } from '../api';

export default function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/bookings/mine').then((r) => setBookings(r.data)).catch((e) => setError(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking? Your seats will be released.')) return;
    try {
      await api.delete(`/bookings/${id}`);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 820 }}>
      <h1 className="im-title mb-4">My tickets</h1>
      {location.state?.justBooked && <div className="alert alert-success">Booking confirmed. Enjoy the show!</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {bookings && bookings.length === 0 && <p className="im-muted">You have no bookings yet. Pick a movie to get started.</p>}

      {bookings?.map((b) => (
        <div key={b._id} className={`ticket ${b.status === 'cancelled' ? 'cancelled' : ''}`}>
          <img src={b.showtime?.movie?.posterUrl} alt="" />
          <div className="flex-grow-1">
            <h2 className="h5 mb-1">{b.showtime?.movie?.title}</h2>
            <div className="im-muted">
              {b.showtime && new Date(b.showtime.startsAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} · {b.showtime?.screen}
            </div>
            <div className="mt-2">Seats: <strong>{[...b.seats].sort().join(', ')}</strong> · ${b.totalPrice}</div>
          </div>
          <div className="text-end">
            {b.status === 'cancelled' ? (
              <span className="badge text-bg-secondary">Cancelled</span>
            ) : (
              <button className="btn btn-sm btn-outline-light" onClick={() => cancel(b._id)}>Cancel</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
