import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api
        .get('/movies', { params: { search } })
        .then((r) => { setMovies(r.data); setError(''); })
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <h1 className="im-title mb-0">Now showing</h1>
        <input
          className="form-control im-input"
          style={{ maxWidth: 280 }}
          placeholder="Search by title"
          aria-label="Search movies by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && movies.length === 0 && (
        <p className="im-muted">No movies match “{search}”. Try a different title.</p>
      )}

      <div className="row g-4">
        {movies.map((m) => (
          <div className="col-6 col-md-4 col-lg-3" key={m._id}>
            <Link to={`/movies/${m._id}`} className="poster-card">
              <img src={m.posterUrl} alt={`${m.title} poster`} />
              <div className="poster-info">
                <strong>{m.title}</strong>
                <small className="im-muted">
                  {m.genre.join(', ')} · {m.durationMins} min
                </small>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
