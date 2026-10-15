/**
 * Decode a JWT token payload without verifying signature.
 * Used client-side to extract user info from stored token.
 */
export function decodeJwt(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const decoded = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract user info from the stored JWT token.
 * JWT claims: sub (userId), email
 */
export function getUserFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return null;
  return {
    id: parseInt(payload.sub, 10),
    email: payload.email,
  };
}

/**
 * Check if a JWT token is expired.
 */
export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Format a LocalDateTime string from the backend to a readable format.
 */
export function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  try {
    const date = new Date(dateTimeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateTimeStr;
  }
}

/**
 * Generate initials from a name string.
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent background color from a userId for avatars.
 */
export function getAvatarColor(userId) {
  const colors = [
    'linear-gradient(135deg, #0a66c2 0%, #0891b2 100%)',
    'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
    'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
    'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #0f766e 0%, #0a66c2 100%)',
  ];
  return colors[(userId || 0) % colors.length];
}

/**
 * Extract a clean error message from an axios error response.
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') return error.response.data;
  }
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
}
