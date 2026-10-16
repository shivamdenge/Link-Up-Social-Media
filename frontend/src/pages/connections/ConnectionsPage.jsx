import './ConnectionsPage.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { connectionApi } from '../../api/connectionApi';
import { userApi } from '../../api/userApi';
import { Navbar } from '../../components/layout/Navbar';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonConnectionCard } from '../../components/ui/Skeleton';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  Users, UserPlus, RefreshCw, Check, X, Clock, Search, ShieldCheck, Sparkles
} from 'lucide-react';

export function ConnectionsPage() {
  const { user } = useAuth();

  // Data states
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search people state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Action loading state (per user ID)
  const [processingId, setProcessingId] = useState(null);

  // Connections filter query
  const [connectionsFilter, setConnectionsFilter] = useState('');

  const searchDebounceRef = useRef(null);

  // Load invitations, sent requests, connections, and eligible discovery users
  const loadNetworkData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [connectionsData, receivedData, sentData, eligibleData] = await Promise.allSettled([
        connectionApi.getConnections(user.id),
        connectionApi.getReceivedRequests(),
        connectionApi.getSentRequests(),
        userApi.getEligibleUsers(),
      ]);

      const loadedConns = connectionsData.status === 'fulfilled' ? (connectionsData.value || []) : [];
      const loadedInvs = receivedData.status === 'fulfilled' ? (receivedData.value || []) : [];
      const loadedSent = sentData.status === 'fulfilled' ? (sentData.value || []) : [];
      const loadedEligible = eligibleData.status === 'fulfilled' ? (eligibleData.value || []) : [];

      setConnections(loadedConns);
      setInvitations(loadedInvs);
      setSentRequests(loadedSent);
      setEligibleUsers(loadedEligible);

      // Collect user IDs to query batch connection status
      const allTargetIds = loadedEligible.map((u) => u.id).filter((id) => id && id !== user.id);
      if (allTargetIds.length > 0) {
        try {
          const statusMap = await connectionApi.getBatchStatus(allTargetIds);
          setUserStatuses((prev) => ({ ...prev, ...statusMap }));
        } catch {
          // Status query fallback
        }
      }
    } catch (err) {
      toast.error('Failed to load network data: ' + getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  function handleRefresh() {
    setRefreshing(true);
    loadNetworkData();
  }

  // Handle Search Input
  function handleSearchChange(e) {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const users = await userApi.searchUsers(query.trim());
        setSearchResults(users || []);

        if (users && users.length > 0 && user?.id) {
          const ids = users.map((u) => u.id).filter((id) => id && id !== user.id);
          if (ids.length > 0) {
            const statusMap = await connectionApi.getBatchStatus(ids);
            setUserStatuses((prev) => ({ ...prev, ...statusMap }));
          }
        }
      } catch (err) {
        toast.error('Search failed: ' + getErrorMessage(err));
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }

  // Accept Invitation
  async function handleAccept(sender) {
    const senderId = sender.userId || sender.id;
    setProcessingId(senderId);
    try {
      await connectionApi.acceptRequest(senderId);
      toast.success(`Connected with ${sender.name || 'User'}!`);

      // Optimistic update
      setInvitations((prev) => prev.filter((inv) => (inv.userId || inv.id) !== senderId));
      setConnections((prev) => [...prev, { userId: senderId, name: sender.name, profileImageUrl: sender.profileImageUrl }]);
      setUserStatuses((prev) => ({ ...prev, [senderId]: 'CONNECTED' }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  // Ignore / Reject Invitation
  async function handleIgnore(sender) {
    const senderId = sender.userId || sender.id;
    setProcessingId(senderId);
    try {
      await connectionApi.rejectRequest(senderId);
      toast(`Ignored invitation from ${sender.name || 'User'}`);

      // Optimistic update
      setInvitations((prev) => prev.filter((inv) => (inv.userId || inv.id) !== senderId));
      setUserStatuses((prev) => ({ ...prev, [senderId]: 'NOT_CONNECTED' }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  // Send Connection Request
  async function handleSendConnect(targetUser) {
    const targetId = targetUser.userId || targetUser.id;
    if (targetId === user?.id) {
      toast.error("You can't connect with yourself");
      return;
    }

    setProcessingId(targetId);
    try {
      await connectionApi.sendRequest(targetId);
      toast.success(`Connection request sent to ${targetUser.name}!`);

      // Optimistic update
      setUserStatuses((prev) => ({ ...prev, [targetId]: 'PENDING_SENT' }));
      setSentRequests((prev) => [...prev, { userId: targetId, name: targetUser.name, profileImageUrl: targetUser.profileImageUrl }]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  // Dismiss card from suggested network
  function handleDismiss(personId) {
    setDismissedIds((prev) => new Set([...prev, personId]));
  }

  // Filter existing connections
  const filteredConnections = connections.filter((c) =>
    (c.name || '').toLowerCase().includes(connectionsFilter.toLowerCase())
  );

  // Discoverable people (excluding dismissed and self)
  const visibleEligibleUsers = eligibleUsers.filter(
    (u) => u.id !== user?.id && !dismissedIds.has(u.id)
  );

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content connections-page">
        <div className="connections-page-header">
          <div>
            <h1 className="connections-title">My Network</h1>
            <p className="text-sm text-muted">
              {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
            </p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            id="refresh-network-btn"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="connections-layout">
          {/* Main Left Column */}
          <div className="connections-main-col">
            {/* 1. INVITATIONS CARD (Received requests) */}
            {invitations.length > 0 && (
              <div className="card invitations-card animate-fade-in">
                <div className="card-header invitations-header">
                  <div className="invitations-header-title">
                    <UserPlus size={18} className="text-primary" />
                    <span className="font-bold">Invitations</span>
                    <span className="invitations-badge">{invitations.length}</span>
                  </div>
                </div>

                <div className="invitations-list">
                  {invitations.map((inv) => {
                    const invId = inv.userId || inv.id;
                    const isProcessing = processingId === invId;
                    return (
                      <div key={invId} className="invitation-item">
                        <div className="invitation-user">
                          <Avatar name={inv.name} userId={invId} imageUrl={inv.profileImageUrl} size="md" />
                          <div className="invitation-info">
                            <h3 className="invitation-name">{inv.name || `User #${invId}`}</h3>
                            <p className="invitation-subtitle">wants to connect with you</p>
                          </div>
                        </div>

                        <div className="invitation-actions">
                          <button
                            className="btn btn-ghost btn-sm text-muted"
                            onClick={() => handleIgnore(inv)}
                            disabled={isProcessing}
                            title="Ignore request"
                          >
                            <X size={16} />
                            Ignore
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAccept(inv)}
                            disabled={isProcessing}
                            title="Accept request"
                          >
                            <Check size={16} />
                            Accept
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. PEOPLE YOU MAY KNOW (LinkedIn-Style Card Grid) */}
            <div className="card people-you-may-know-card animate-fade-in">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <span className="font-bold">People You May Know</span>
                </div>
                <span className="text-xs text-muted">
                  {visibleEligibleUsers.length} suggested
                </span>
              </div>

              <div className="card-body">
                {loading ? (
                  <div className="people-results-grid">
                    <SkeletonConnectionCard />
                    <SkeletonConnectionCard />
                    <SkeletonConnectionCard />
                    <SkeletonConnectionCard />
                  </div>
                ) : visibleEligibleUsers.length === 0 ? (
                  <EmptyState
                    icon={<Users size={32} />}
                    title="No suggestions right now"
                    description="Check back later or search for professionals by name below."
                  />
                ) : (
                  <div className="people-results-grid">
                    {visibleEligibleUsers.map((person) => {
                      const isMe = person.id === user?.id;
                      const status = userStatuses[person.id] || (isMe ? 'SELF' : 'NOT_CONNECTED');
                      const isProcessing = processingId === person.id;

                      return (
                        <div key={person.id} className="person-result-card">
                          {/* Dismiss button */}
                          <button
                            className="person-card-dismiss-btn"
                            onClick={() => handleDismiss(person.id)}
                            title="Dismiss suggestion"
                            aria-label={`Dismiss ${person.name}`}
                          >
                            <X size={14} />
                          </button>

                          <div className="person-result-top">
                            <Avatar
                              name={person.name}
                              userId={person.id}
                              imageUrl={person.profileImageUrl}
                              size="lg"
                            />
                            <h4 className="person-result-name">{person.name}</h4>
                            <p className="person-result-email">{person.email}</p>
                            <span className="person-result-tagline">LinkUp Member</span>
                          </div>

                          <div className="person-result-action">
                            {isMe ? (
                              <span className="badge-pill badge-neutral">You</span>
                            ) : status === 'CONNECTED' ? (
                              <span className="badge-pill badge-success">
                                <Check size={13} /> Connected
                              </span>
                            ) : status === 'PENDING_SENT' ? (
                              <span className="badge-pill badge-warning">
                                <Clock size={13} /> Request Sent
                              </span>
                            ) : status === 'PENDING_RECEIVED' ? (
                              <div className="person-result-btn-group">
                                <button
                                  className="btn btn-primary btn-xs"
                                  onClick={() => handleAccept(person)}
                                  disabled={isProcessing}
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => handleIgnore(person)}
                                  disabled={isProcessing}
                                >
                                  Ignore
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-outline-primary btn-sm w-full connect-action-btn"
                                onClick={() => handleSendConnect(person)}
                                disabled={isProcessing}
                              >
                                <UserPlus size={14} />
                                {isProcessing ? 'Sending...' : 'Connect'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. FIND PEOPLE BY NAME (Search Section) */}
            <div className="card search-people-card">
              <div className="card-header">
                <div className="search-people-header">
                  <Search size={18} className="text-primary" />
                  <span className="font-bold">Search Professionals</span>
                </div>
              </div>

              <div className="card-body">
                <div className="people-search-bar">
                  <Search size={16} className="people-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by full name or keyword..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="people-search-input"
                    id="search-people-input"
                  />
                  {searchQuery && (
                    <button
                      className="people-search-clear"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {searchLoading ? (
                  <div className="search-people-loading">
                    <RefreshCw size={18} className="animate-spin text-primary" />
                    <span>Searching professionals...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="people-results-grid" style={{ marginTop: '16px' }}>
                    {searchResults.map((person) => {
                      const isMe = person.id === user?.id;
                      const status = userStatuses[person.id] || (isMe ? 'SELF' : 'NOT_CONNECTED');
                      const isProcessing = processingId === person.id;

                      return (
                        <div key={person.id} className="person-result-card">
                          <div className="person-result-top">
                            <Avatar
                              name={person.name}
                              userId={person.id}
                              imageUrl={person.profileImageUrl}
                              size="lg"
                            />
                            <h4 className="person-result-name">{person.name}</h4>
                            <p className="person-result-email">{person.email}</p>
                          </div>

                          <div className="person-result-action">
                            {isMe ? (
                              <span className="badge-pill badge-neutral">You</span>
                            ) : status === 'CONNECTED' ? (
                              <span className="badge-pill badge-success">
                                <Check size={13} /> Connected
                              </span>
                            ) : status === 'PENDING_SENT' ? (
                              <span className="badge-pill badge-warning">
                                <Clock size={13} /> Request Sent
                              </span>
                            ) : status === 'PENDING_RECEIVED' ? (
                              <div className="person-result-btn-group">
                                <button
                                  className="btn btn-primary btn-xs"
                                  onClick={() => handleAccept(person)}
                                  disabled={isProcessing}
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => handleIgnore(person)}
                                  disabled={isProcessing}
                                >
                                  Ignore
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-primary btn-sm w-full"
                                onClick={() => handleSendConnect(person)}
                                disabled={isProcessing}
                              >
                                <UserPlus size={14} />
                                {isProcessing ? 'Sending...' : 'Connect'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : searchQuery ? (
                  <div className="search-people-none">
                    No users found matching "<strong>{searchQuery}</strong>".
                  </div>
                ) : (
                  <p className="text-xs text-muted mt-2">
                    Tip: Type a name above to search for people and send instant connection requests.
                  </p>
                )}
              </div>
            </div>

            {/* 4. MY CONNECTIONS (Existing Connections) */}
            <div className="card connections-list-card">
              <div className="card-header connections-list-header">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  <span className="font-bold">Connections</span>
                  <span className="badge-pill badge-neutral">{connections.length}</span>
                </div>

                {connections.length > 5 && (
                  <input
                    type="text"
                    placeholder="Filter connections..."
                    value={connectionsFilter}
                    onChange={(e) => setConnectionsFilter(e.target.value)}
                    className="connections-filter-input"
                  />
                )}
              </div>

              <div className="card-body">
                {loading ? (
                  <div>
                    <SkeletonConnectionCard />
                    <SkeletonConnectionCard />
                  </div>
                ) : connections.length === 0 ? (
                  <EmptyState
                    icon={<Users size={32} />}
                    title="No connections yet"
                    description="Connect with professionals from the suggestions above to start growing your network."
                  />
                ) : (
                  <div className="connections-grid-list">
                    {filteredConnections.map((conn) => {
                      const connId = conn.userId || conn.id;
                      return (
                        <div key={connId} className="connected-person-card">
                          <Avatar name={conn.name} userId={connId} imageUrl={conn.profileImageUrl} size="md" />
                          <div className="connected-person-info">
                            <span className="connected-person-name">{conn.name || `User #${connId}`}</span>
                            <span className="connected-person-status">1st degree connection</span>
                          </div>
                          <span className="badge-pill badge-success">
                            <Check size={12} /> Connected
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Right Column */}
          <div className="connections-sidebar-col">
            {/* Sent Pending Requests Summary */}
            <div className="card sent-requests-card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted" />
                  <span className="font-semibold text-sm">Sent Requests ({sentRequests.length})</span>
                </div>
              </div>
              <div className="card-body">
                {sentRequests.length === 0 ? (
                  <p className="text-xs text-muted">No pending outgoing requests.</p>
                ) : (
                  <div className="sent-requests-list">
                    {sentRequests.map((req) => {
                      const reqId = req.userId || req.id;
                      return (
                        <div key={reqId} className="sent-request-item">
                          <Avatar name={req.name} userId={reqId} imageUrl={req.profileImageUrl} size="xs" />
                          <div className="sent-request-info">
                            <span className="sent-request-name">{req.name || `User #${reqId}`}</span>
                            <span className="sent-request-status">Pending response</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Network stats card */}
            <div className="card network-info-card">
              <div className="card-header">
                <span className="font-semibold text-sm">Manage Network</span>
              </div>
              <div className="card-body network-info-body">
                <div className="network-stat-row">
                  <span className="text-sm text-muted">Connections</span>
                  <span className="font-bold text-sm">{connections.length}</span>
                </div>
                <div className="network-stat-row">
                  <span className="text-sm text-muted">Received Invitations</span>
                  <span className="font-bold text-sm text-primary">{invitations.length}</span>
                </div>
                <div className="network-stat-row">
                  <span className="text-sm text-muted">Pending Sent</span>
                  <span className="font-bold text-sm">{sentRequests.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
