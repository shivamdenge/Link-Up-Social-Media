import './ConnectionsPage.css';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { connectionApi } from '../../api/connectionApi';
import { Navbar } from '../../components/layout/Navbar';
import { ConnectionCard } from '../../components/connections/ConnectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonConnectionCard } from '../../components/ui/Skeleton';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Users, UserPlus, RefreshCw, Info } from 'lucide-react';

/**
 * Connections Page.
 *
 * Backend supports:
 * - GET /api/v1/connections/core/{userId}/first-degree
 * - POST /api/v1/connections/core/request/{userId}
 * - POST /api/v1/connections/core/accept/{userId}
 * - POST /api/v1/connections/core/reject/{userId}
 *
 * Not supported by backend:
 * - No API to get pending/received connection requests
 * - No API to search users to send requests to
 *
 * Workaround: Allow user to manually enter a userId to send a request.
 */
export function ConnectionsPage() {
  const { user } = useAuth();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manual connect panel
  const [targetUserId, setTargetUserId] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Accept/Reject panel (manual userId for pending requests)
  const [pendingId, setPendingId] = useState('');
  const [processingPending, setProcessingPending] = useState(false);
  const [pendingAction, setPendingAction] = useState('accept'); // 'accept' | 'reject'

  const loadConnections = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await connectionApi.getConnections(user.id);
      setConnections(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  async function handleSendRequest(e) {
    e.preventDefault();
    const uid = parseInt(targetUserId, 10);
    if (!uid || isNaN(uid)) { toast.error('Enter a valid User ID'); return; }
    if (uid === user?.id) { toast.error("You can't connect with yourself"); return; }

    setSendingRequest(true);
    try {
      await connectionApi.sendRequest(uid);
      toast.success(`Connection request sent to User #${uid}!`);
      setTargetUserId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingRequest(false);
    }
  }

  async function handlePendingAction(e) {
    e.preventDefault();
    const uid = parseInt(pendingId, 10);
    if (!uid || isNaN(uid)) { toast.error('Enter a valid User ID'); return; }

    setProcessingPending(true);
    try {
      if (pendingAction === 'accept') {
        await connectionApi.acceptRequest(uid);
        toast.success(`Connected with User #${uid}!`);
        await loadConnections();
      } else {
        await connectionApi.rejectRequest(uid);
        toast(`Request from User #${uid} rejected`);
      }
      setPendingId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingPending(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="connections-page animate-fade-in">
            {/* Header */}
            <div className="connections-page-header">
              <div>
                <h1 className="connections-title">My Network</h1>
                <p className="text-secondary" style={{ fontSize: 14 }}>
                  {connections.length} first-degree connection{connections.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={loadConnections}
                disabled={loading}
                id="refresh-connections-btn"
                aria-label="Refresh connections"
              >
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="connections-grid">
              {/* Left: Connections List */}
              <div className="connections-list-section">
                <div className="card">
                  <div className="connections-list-header">
                    <Users size={16} />
                    <span>Connections</span>
                    <span className="badge badge-primary">{connections.length}</span>
                  </div>

                  <div style={{ padding: '0 16px 8px' }}>
                    {error ? (
                      <div className="connections-error">
                        <p style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</p>
                        <button className="btn btn-outline-primary btn-sm" onClick={loadConnections}>
                          Try Again
                        </button>
                      </div>
                    ) : loading ? (
                      <>
                        <SkeletonConnectionCard />
                        <SkeletonConnectionCard />
                        <SkeletonConnectionCard />
                        <SkeletonConnectionCard />
                      </>
                    ) : connections.length === 0 ? (
                      <EmptyState
                        icon={<Users size={32} />}
                        title="No connections yet"
                        description="Use the panel on the right to send connection requests to other users."
                      />
                    ) : (
                      connections.map((person) => (
                        <ConnectionCard
                          key={person.id}
                          person={person}
                          variant="connected"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions Panel */}
              <div className="connections-actions-section">
                {/* Send Request Panel */}
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-4">
                      <UserPlus size={18} style={{ color: 'var(--color-primary)' }} />
                      <h3 style={{ fontSize: 15 }}>Send Connection Request</h3>
                    </div>

                    <form onSubmit={handleSendRequest} className="connections-form">
                      <div className="form-group">
                        <label className="form-label" htmlFor="target-user-id">
                          Target User ID
                        </label>
                        <input
                          id="target-user-id"
                          type="number"
                          className="form-input"
                          placeholder="e.g. 42"
                          value={targetUserId}
                          onChange={(e) => setTargetUserId(e.target.value)}
                          min="1"
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={sendingRequest || !targetUserId}
                        id="send-connection-request-btn"
                      >
                        <UserPlus size={16} />
                        {sendingRequest ? 'Sending…' : 'Send Request'}
                      </button>
                    </form>

                    <div className="connections-api-note">
                      <Info size={12} />
                      <span>Enter the Member ID of the professional you want to connect with.</span>
                    </div>
                  </div>
                </div>

                {/* Accept/Reject Panel */}
                <div className="card" style={{ marginTop: 12 }}>
                  <div className="card-body">
                    <h3 style={{ fontSize: 15, marginBottom: 4 }}>Manage Requests</h3>
                    <p className="text-xs text-muted" style={{ marginBottom: 16 }}>
                      Accept or reject a connection request using the sender's Member ID.
                    </p>

                    <form onSubmit={handlePendingAction} className="connections-form">
                      <div className="form-group">
                        <label className="form-label" htmlFor="pending-user-id">
                          Sender's Member ID
                        </label>
                        <input
                          id="pending-user-id"
                          type="number"
                          className="form-input"
                          placeholder="e.g. 7"
                          value={pendingId}
                          onChange={(e) => setPendingId(e.target.value)}
                          min="1"
                        />
                      </div>

                      <div className="connections-action-tabs">
                        <button
                          type="button"
                          className={`connections-tab ${pendingAction === 'accept' ? 'active' : ''}`}
                          onClick={() => setPendingAction('accept')}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className={`connections-tab ${pendingAction === 'reject' ? 'active danger' : ''}`}
                          onClick={() => setPendingAction('reject')}
                        >
                          Reject
                        </button>
                      </div>

                      <button
                        type="submit"
                        className={`btn btn-full ${pendingAction === 'accept' ? 'btn-primary' : 'btn-danger'}`}
                        disabled={processingPending || !pendingId}
                        id="manage-request-btn"
                      >
                        {processingPending ? 'Processing…' : pendingAction === 'accept' ? 'Accept Request' : 'Reject Request'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Networking tips card */}
                <div className="connections-limitation-card card">
                  <div className="card-body">
                    <p className="font-semibold text-sm" style={{ marginBottom: 8 }}>
                      💡 Networking Tips
                    </p>
                    <ul className="connections-limitation-list">
                      <li>Connect with colleagues using their Member ID</li>
                      <li>Engage with feed posts to increase your visibility</li>
                      <li>Grow your network by exchanging IDs with peers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
