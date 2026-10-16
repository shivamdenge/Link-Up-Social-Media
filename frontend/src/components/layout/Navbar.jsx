import './Navbar.css';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { userApi } from '../../api/userApi';
import { notificationApi } from '../../api/notificationApi';
import { connectionApi } from '../../api/connectionApi';
import {
  Home, Users, LogOut, User, ChevronDown, Menu, X, Search, Bell, UserPlus, Check, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdowns
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [statuses, setStatuses] = useState({}); // { [userId]: status }

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch notifications and unread count
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [listResult, countResult] = await Promise.allSettled([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      if (listResult.status === 'fulfilled') {
        setNotifications(listResult.value || []);
      }
      if (countResult.status === 'fulfilled') {
        setUnreadCount(countResult.value || 0);
      }
    } catch {
      // ignore
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [loadNotifications]);

  async function handleNotificationClick(notif) {
    try {
      if (!notif.isRead) {
        await notificationApi.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // ignore
    }
    setNotificationsOpen(false);
    if (notif.type === 'CONNECTION_REQUEST' || notif.message?.toLowerCase().includes('connect')) {
      navigate('/connections');
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Marked all as read');
    } catch {
      // ignore
    }
  }


  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // Handle Search Input Debounce
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchLoading(true);
    setSearchOpen(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const users = await userApi.searchUsers(val.trim());
        setSearchResults(users);

        // Fetch connection status for results
        if (users.length > 0 && user?.id) {
          const ids = users.map((u) => u.id);
          const statusMap = await connectionApi.getBatchStatus(ids);
          setStatuses((prev) => ({ ...prev, ...statusMap }));
        }
      } catch {
        // search error fallback
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }

  async function handleConnectFromSearch(targetUser) {
    try {
      await connectionApi.sendRequest(targetUser.id);
      toast.success(`Connection request sent to ${targetUser.name}!`);
      setStatuses((prev) => ({ ...prev, [targetUser.id]: 'PENDING_SENT' }));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send request');
    }
  }

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
        {/* Left: Logo & Search */}
        <div className="navbar-left">
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

          {/* Search Box */}
          <div className="navbar-search" ref={searchRef}>
            <Search size={16} className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search professionals by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0) setSearchOpen(true);
              }}
              className="navbar-search-input"
            />
            {searchQuery && (
              <button
                className="navbar-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setSearchOpen(false);
                }}
              >
                <X size={14} />
              </button>
            )}

            {/* Search Dropdown Results */}
            {searchOpen && (
              <div className="navbar-search-dropdown animate-slide-down">
                {searchLoading ? (
                  <div className="navbar-search-loading">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="navbar-search-empty">No professionals found for "{searchQuery}"</div>
                ) : (
                  <div className="navbar-search-list">
                    {searchResults.map((person) => {
                      const isMe = person.id === user?.id;
                      const status = statuses[person.id] || (isMe ? 'SELF' : 'NOT_CONNECTED');
                      return (
                        <div key={person.id} className="navbar-search-item">
                          <div
                            onClick={() => {
                              setSearchOpen(false);
                              navigate(`/profile/${person.id}`);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}
                          >
                            <Avatar name={person.name} userId={person.id} imageUrl={person.profileImageUrl} size="sm" />
                            <div className="navbar-search-info">
                              <span className="navbar-search-name">{person.name}</span>
                              <span className="navbar-search-email">{person.email}</span>
                            </div>
                          </div>

                          <div className="navbar-search-action">
                            {isMe ? (
                              <span className="badge-pill badge-neutral">You</span>
                            ) : status === 'CONNECTED' ? (
                              <span className="badge-pill badge-success">
                                <Check size={12} /> Connected
                              </span>
                            ) : status === 'PENDING_SENT' ? (
                              <span className="badge-pill badge-warning">
                                <Clock size={12} /> Pending
                              </span>
                            ) : status === 'PENDING_RECEIVED' ? (
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={() => navigate('/connections')}
                              >
                                View Invite
                              </button>
                            ) : (
                              <button
                                className="btn btn-xs btn-outline"
                                onClick={() => handleConnectFromSearch(person)}
                              >
                                <UserPlus size={13} /> Connect
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Desktop Nav */}
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

        {/* Right: Notifications & Profile */}
        <div className="navbar-actions">
          {/* Notifications Dropdown */}
          <div className="dropdown" ref={notifRef}>
            <button
              className="navbar-icon-btn"
              onClick={() => {
                setNotificationsOpen((v) => !v);
                if (!notificationsOpen) loadNotifications();
              }}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="navbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {notificationsOpen && (
              <div className="dropdown-menu navbar-notif-dropdown animate-slide-down">
                <div className="navbar-notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-ghost btn-xs text-primary"
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '11px', padding: '2px 6px' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="navbar-notif-body">
                  {notifications.length === 0 ? (
                    <div className="navbar-notif-empty">No notifications yet</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`navbar-notif-item ${!notif.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notif)}
                        style={{ cursor: 'pointer', background: !notif.isRead ? 'rgba(10, 102, 194, 0.08)' : 'transparent' }}
                      >
                        <div className="navbar-notif-icon">
                          <Bell size={14} color={!notif.isRead ? 'var(--color-primary)' : 'currentColor'} />
                        </div>
                        <div className="navbar-notif-content">
                          <p className="navbar-notif-msg" style={{ fontWeight: !notif.isRead ? 600 : 400 }}>{notif.message}</p>
                          {notif.createdAt && (
                            <span className="navbar-notif-time">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="navbar-profile-btn"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              id="navbar-profile-btn"
            >
              <Avatar name={user?.name} userId={user?.id} imageUrl={user?.profileImageUrl} size="xs" />
              <span className="navbar-profile-name">{user?.name?.split(' ')[0] || 'Me'}</span>
              <ChevronDown size={14} className={`navbar-chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu navbar-dropdown animate-slide-down" role="menu">
                <div className="navbar-dropdown-profile">
                  <Avatar name={user?.name} userId={user?.id} imageUrl={user?.profileImageUrl} size="md" />

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
