import { getInitials, getAvatarColor } from '../../utils/helpers';

/**
 * Avatar component.
 * If imageUrl is provided, displays the image.
 * Otherwise shows colored initials.
 */
export function Avatar({ name, userId, imageUrl, size = 'md', className = '' }) {
  const sizeClass = `avatar-${size}`;
  const initials = getInitials(name);
  const gradient = getAvatarColor(userId);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'User'}
        className={`avatar ${sizeClass} ${className}`}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  const sizes = { xs: 28, sm: 36, md: 48, lg: 72, xl: 120 };
  const px = sizes[size] || 48;

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: gradient, width: px, height: px }}
      aria-label={name || 'User avatar'}
    >
      {initials}
    </div>
  );
}
