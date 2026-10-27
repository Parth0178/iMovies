import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';

const dayKey = (d) => new Date(d).toDateString();
const dayLabel = (d) =>
  new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const timeLabel = (d) =>
  new Date(d).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function MovieDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/movies/${id}`).then((r) => setData(r.data)).catch((e) => setError(errorMessage(e)));
  }, [id]);

  const grouped = useMemo(() => {
    const map = new Map();
    data?.showtimes.forEach((s) => {
      const k = dayKey(s.startsAt);
      map.set(k, [...(map.get(k) || []), s]);
    });
    return [...map.values()];
  }, [data]);

  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!data) return <div className="container py-5 im-muted">Loading…</div>;
  const { movie } = data;

  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-md-4">
          <img src={movie.posterUrl} alt={`${movie.title} poster`} className="img-fluid rounded" />
        </div>
        <div className="col-md-8">
          <h1 className="im-title">{movie.title}</h1>
          <p className="im-muted">
            {movie.rating} · {movie.durationMins} min · {movie.genre.join(', ')} · {movie.language}
          </p>
          <p className="lead" style={{ maxWidth: '60ch' }}>{movie.description}</p>

          <h2 className="h5 mt-5 mb-3">Pick a showtime</h2>
          {grouped.length === 0 && <p className="im-muted">No upcoming showtimes for this movie yet.</p>}
          {grouped.map((shows) => (
            <div key={shows[0]._id} className="mb-4">
              <div className="mb-2 fw-bold">{dayLabel(shows[0].startsAt)}</div>
              <div className="d-flex flex-wrap gap-2">
                {shows.map((s) => (
                  <Link key={s._id} to={`/book/${s._id}`} className="showtime-pill">
                    <span>{timeLabel(s.startsAt)}</span>
                    <small>{s.screen} · ${s.price}</small>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
