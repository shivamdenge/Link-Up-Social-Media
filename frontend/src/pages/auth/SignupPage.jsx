import './AuthPages.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { getUserFromToken, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
    if (!form.name.trim()) errs.name = 'Full name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      // 1. Sign up → returns { id, name, email }
      const userDto = await authApi.signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // 2. Log in immediately to get the token
      const token = await authApi.login({ email: form.email.trim(), password: form.password });

      // 3. Build user object from signup response (has the name)
      const userData = {
        id: userDto.id || 1,
        name: userDto.name || form.name.trim(),
        email: userDto.email || form.email.trim(),
      };

      login(token, userData);
      toast.success('Account created! Welcome to LinkUp 🎉');
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
            <h2 className="auth-title">Join LinkUp</h2>
            <p className="auth-subtitle">Make the most of your professional life</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="signup-name" className="form-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  className={`form-input auth-input ${errors.name ? 'error' : ''}`}
                  placeholder="Shivam Denge"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  autoFocus
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  className={`form-input auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-input auth-input auth-input-with-action ${errors.password ? 'error' : ''}`}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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
              <p className="text-xs text-muted" style={{ marginTop: 4 }}>
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
              id="signup-submit-btn"
            >
              {loading ? <Loader2 size={18} className="spin" /> : null}
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="auth-terms">
              By joining, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="auth-footer">
            <p>Already on LinkUp? <Link to="/login" className="auth-link" id="go-to-login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
