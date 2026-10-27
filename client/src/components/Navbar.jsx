import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="im-nav">
      <div className="container d-flex align-items-center justify-content-between py-3">
        <Link to="/" className="im-logo">IMovies</Link>
        <div className="d-flex align-items-center gap-3">
          <NavLink to="/" end className="im-link">Movies</NavLink>
          {user ? (
            <>
              <NavLink to="/my-bookings" className="im-link">My tickets</NavLink>
              <span className="im-muted d-none d-sm-inline">{user.name}</span>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => { logout(); navigate('/'); }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="im-link">Log in</NavLink>
              <Link to="/register" className="btn btn-sm im-btn">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
