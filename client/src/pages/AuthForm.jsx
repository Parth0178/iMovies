import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api';

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="im-title mb-4">{isLogin ? 'Log in' : 'Create your account'}</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={submit} className="d-grid gap-3">
        {!isLogin && (
          <div>
            <label className="form-label" htmlFor="name">Name</label>
            <input id="name" className="form-control im-input" required value={form.name} onChange={set('name')} />
          </div>
        )}
        <div>
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="form-control im-input" required value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" type="password" minLength={6} className="form-control im-input" required value={form.password} onChange={set('password')} />
        </div>
        <button className="btn im-btn" disabled={busy}>{isLogin ? 'Log in' : 'Sign up'}</button>
      </form>
      <p className="im-muted mt-3">
        {isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Log in</Link></>}
      </p>
    </div>
  );
}
