import './AuthPages.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { getUserFromToken, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const token = await authApi.login({ email: form.email, password: form.password });
      const tokenUser = getUserFromToken(token);

      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('authUser')); } catch { return null; }
      })();

      const userData = {
        id: tokenUser?.id || 1,
        email: tokenUser?.email || form.email,
        name: storedUser?.email === form.email ? storedUser?.name : (tokenUser?.name || form.email.split('@')[0]),
      };

      login(token, userData);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-pattern" />
      </div>

      <div className="auth-container">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </div>
          <h1 className="auth-brand-name">LinkUp</h1>
        </div>

        <div className="auth-card animate-slide-up">
          <div className="auth-card-header">
            <h2 className="auth-title">Sign in</h2>
            <p className="auth-subtitle">Stay updated on your professional world</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className={`form-input auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input auth-input auth-input-with-action ${errors.password ? 'error' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-input-action"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? <Loader2 size={18} className="spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-footer">
            <p>New to LinkUp? <Link to="/signup" className="auth-link" id="go-to-signup">Join now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
