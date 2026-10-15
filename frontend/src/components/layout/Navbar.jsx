import './Navbar.css';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import {
  Home, Users, LogOut, User, ChevronDown, Menu, X
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/connections', icon: Users, label: 'Network' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="LinkUp Home">
          <div className="navbar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </div>
          <span className="navbar-logo-text">LinkUp</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-nav">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-nav-item ${isActive(to) ? 'active' : ''}`}
              aria-current={isActive(to) ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive(to) ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* Profile dropdown */}
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="navbar-profile-btn"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              id="navbar-profile-btn"
            >
              <Avatar name={user?.name} userId={user?.id} size="xs" />
              <span className="navbar-profile-name">{user?.name?.split(' ')[0] || 'Me'}</span>
              <ChevronDown size={14} className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu navbar-dropdown animate-slide-down" role="menu">
                {/* Profile card at top */}
                <div className="navbar-dropdown-profile">
                  <Avatar name={user?.name} userId={user?.id} size="md" />
                  <div>
                    <p className="font-semibold" style={{ fontSize: '15px', color: 'var(--color-text)' }}>
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                  role="menuitem"
                >
                  <User size={16} />
                  View Profile
                </Link>
                <div className="dropdown-separator" />
                <button
                  className="dropdown-item danger"
                  onClick={handleLogout}
                  role="menuitem"
                  id="navbar-logout-btn"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="navbar-mobile-menu-btn btn btn-ghost btn-icon"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu animate-slide-down">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-mobile-item ${isActive(to) ? 'active' : ''}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
          <div className="dropdown-separator" style={{ margin: '8px 16px' }} />
          <Link to="/profile" className="navbar-mobile-item">
            <User size={20} />
            Profile
          </Link>
          <button className="navbar-mobile-item danger" onClick={handleLogout}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
