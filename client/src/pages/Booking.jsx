import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import SeatMap from '../components/SeatMap';

const POLL_MS = 5000; // refresh seat availability every 5 seconds
const MAX_SEATS = 8;

export default function Booking() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/showtimes/${showtimeId}`);
      setShowtime(data);
      // Drop any selected seat that someone else just took
      setSelected((sel) => {
        const still = sel.filter((s) => !data.bookedSeats.includes(s));
        if (still.length !== sel.length) setNotice('Some seats you picked were just taken and were removed.');
        return still;
      });
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [showtimeId]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const toggle = (id) => {
    setNotice('');
    setSelected((sel) => {
      if (sel.includes(id)) return sel.filter((s) => s !== id);
      if (sel.length >= MAX_SEATS) { setNotice(`You can book up to ${MAX_SEATS} seats.`); return sel; }
      return [...sel, id];
    });
  };

  const confirm = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/bookings', { showtimeId, seats: selected });
      navigate('/my-bookings', { state: { justBooked: true } });
    } catch (e) {
      setError(errorMessage(e));
      load();
    } finally {
      setSaving(false);
    }
  };

  if (!showtime) return <div className="container py-5">{error ? <div className="alert alert-danger">{error}</div> : <span className="im-muted">Loading…</span>}</div>;

  const total = selected.length * showtime.price;

  return (
    <div className="container py-5" style={{ maxWidth: 820 }}>
      <h1 className="im-title mb-1">{showtime.movie.title}</h1>
      <p className="im-muted mb-4">
        {new Date(showtime.startsAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })} · {showtime.screen}
      </p>

      <SeatMap
        rows={showtime.rows}
        seatsPerRow={showtime.seatsPerRow}
        booked={showtime.bookedSeats}
        selected={selected}
        onToggle={toggle}
      />

      {error && <div className="alert alert-danger mt-4">{error}</div>}
      {notice && <div className="alert alert-warning mt-4">{notice}</div>}

      <div className="checkout-bar mt-4">
        <div>
          {selected.length === 0 ? (
            <span className="im-muted">Select your seats</span>
          ) : (
            <>
              <strong>{[...selected].sort().join(', ')}</strong>
              <div className="im-muted">{selected.length} × ${showtime.price} = <strong>${total}</strong></div>
            </>
          )}
        </div>
        <button className="btn im-btn" disabled={selected.length === 0 || saving} onClick={confirm}>
          {saving ? 'Booking…' : 'Confirm booking'}
        </button>
      </div>
    </div>
  );
}
