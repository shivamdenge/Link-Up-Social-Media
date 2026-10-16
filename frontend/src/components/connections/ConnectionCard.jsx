import './ConnectionCard.css';
import { Avatar } from '../ui/Avatar';
import { connectionApi } from '../../api/connectionApi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { UserCheck, UserPlus, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ConnectionCard renders a single person from the connections API.
 * Person: { id, userId, name }
 *
 * Variant prop controls display mode:
 * - 'connected': shows as connected (existing first-degree connection)
 * - 'suggestion': shows with Connect button
 */
export function ConnectionCard({ person, variant = 'connected', onAction }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  async function handleSendRequest() {
    if (actionLoading || actionDone) return;
    setActionLoading(true);
    try {
      await connectionApi.sendRequest(person.userId);
      toast.success(`Request sent to ${person.name}`);
      setActionDone(true);
      onAction?.('sent', person);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAccept() {
    setActionLoading(true);
    try {
      await connectionApi.acceptRequest(person.userId);
      toast.success(`Connected with ${person.name}!`);
      setActionDone(true);
      onAction?.('accepted', person);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    setActionLoading(true);
    try {
      await connectionApi.rejectRequest(person.userId);
      toast(`Request from ${person.name} declined`, { icon: '✕' });
      setActionDone(true);
      onAction?.('rejected', person);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  const navigate = useNavigate();
  const targetId = person.userId || person.id;

  return (
    <div className="connection-card animate-fade-in" aria-label={`${person.name} connection card`}>
      <div
        onClick={() => targetId && navigate(`/profile/${targetId}`)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1, minWidth: 0 }}
      >
        <Avatar name={person.name} userId={targetId} size="md" />

        <div className="connection-card-info">
          <span className="connection-card-name">{person.name}</span>
          <span className="connection-card-sub">User #{targetId}</span>
        </div>
      </div>

      <div className="connection-card-actions">
        {variant === 'connected' && (
          <div className="connection-badge">
            <UserCheck size={14} />
            Connected
          </div>
        )}

        {variant === 'suggestion' && !actionDone && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleSendRequest}
            disabled={actionLoading}
            id={`connect-btn-${person.userId}`}
          >
            <UserPlus size={14} />
            {actionLoading ? 'Sending…' : 'Connect'}
          </button>
        )}

        {variant === 'suggestion' && actionDone && (
          <span className="text-xs text-muted font-medium">Pending</span>
        )}

        {variant === 'pending' && !actionDone && (
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAccept}
              disabled={actionLoading}
              id={`accept-btn-${person.userId}`}
            >
              <Check size={14} />
              Accept
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleReject}
              disabled={actionLoading}
              id={`reject-btn-${person.userId}`}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {variant === 'pending' && actionDone && (
          <span className="text-xs text-muted">Done</span>
        )}
      </div>
    </div>
  );
}
