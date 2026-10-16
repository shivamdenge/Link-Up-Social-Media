import './ProfileCard.css';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { Users, Briefcase } from 'lucide-react';

/**
 * ProfileCard displayed in the left sidebar.
 * Shows current user's info extracted from JWT.
 *
 * Note: Backend has no GET /users/{id} endpoint.
 * User info comes from JWT (id, email) + localStorage name.
 */
export function ProfileCard({ connectionCount }) {
  const { user } = useAuth();

  return (
    <div className="profile-card card animate-fade-in">
      {/* Cover banner */}
      <div className="profile-card-banner">
        <div className="profile-card-banner-bg" />
      </div>

      {/* Avatar overlay */}
      <div className="profile-card-avatar-wrapper">
        <Link to="/profile" aria-label="View your profile">
          <Avatar name={user?.name} userId={user?.id} imageUrl={user?.profileImageUrl} size="lg" className="profile-card-avatar" />
        </Link>
      </div>


      {/* User info */}
      <div className="profile-card-body">
        <Link to="/profile" className="profile-card-name" id="sidebar-profile-link">
          {user?.name || 'Your Name'}
        </Link>
        <p className="profile-card-email">{user?.email}</p>

        <div className="divider" style={{ margin: '12px 0' }} />

        {/* Stats */}
        <div className="profile-card-stats">
          <Link to="/connections" className="profile-card-stat" id="sidebar-connections-link">
            <div className="flex items-center gap-2">
              <Users size={15} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm font-medium">Connections</span>
            </div>
            <span className="profile-card-stat-value">
              {connectionCount !== undefined ? connectionCount : '—'}
            </span>
          </Link>
        </div>

        <div className="divider" style={{ margin: '12px 0' }} />

        <Link to="/profile" className="profile-card-footer-link">
          <Briefcase size={14} />
          View your posts
        </Link>
      </div>
    </div>
  );
}
