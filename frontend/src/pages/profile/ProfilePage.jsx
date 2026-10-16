import './ProfilePage.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import { connectionApi } from '../../api/connectionApi';
import { userApi } from '../../api/userApi';
import { Navbar } from '../../components/layout/Navbar';
import { Avatar } from '../../components/ui/Avatar';
import { PostCard } from '../../components/posts/PostCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonPostCard } from '../../components/ui/Skeleton';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  FileText, Users, Mail, Edit2, Check, X, Camera, Loader2, UserPlus, Clock, ArrowLeft, ShieldCheck
} from 'lucide-react';

export function ProfilePage() {
  const { userId: paramUserId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !paramUserId || String(paramUserId) === String(currentUser?.id);
  const targetUserId = isOwnProfile ? currentUser?.id : Number(paramUserId);

  const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(!isOwnProfile);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [processingConnect, setProcessingConnect] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Inline name editing (own profile only)
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // 1. Load user profile details
  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(currentUser);
      setNameInput(currentUser?.name || '');
      setLoadingProfile(false);
    } else if (targetUserId) {
      setLoadingProfile(true);
      userApi.getUserById(targetUserId)
        .then((data) => {
          setProfileUser(data);
          setNameInput(data?.name || '');
        })
        .catch((err) => {
          toast.error('Failed to load user profile: ' + getErrorMessage(err));
        })
        .finally(() => setLoadingProfile(false));

      // Check connection status with target user
      connectionApi.getStatus(targetUserId)
        .then((res) => {
          setConnectionStatus(res?.status || 'NOT_CONNECTED');
        })
        .catch(() => {
          setConnectionStatus('NOT_CONNECTED');
        });
    }
  }, [paramUserId, currentUser, isOwnProfile, targetUserId]);

  // 2. Load user's posts and connections
  useEffect(() => {
    if (!targetUserId) return;

    setLoadingPosts(true);
    postApi.getPostsByUser(targetUserId)
      .then((data) => {
        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        setPosts(sorted);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoadingPosts(false));

    setLoadingConnections(true);
    connectionApi.getConnections(targetUserId)
      .then((data) => {
        setConnections(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setConnections([]);
      })
      .finally(() => setLoadingConnections(false));
  }, [targetUserId]);

  // Upload photo handler (own profile only)
  async function handlePhotoSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const updatedUser = await userApi.uploadProfilePhoto(file);
      if (updatedUser?.profileImageUrl) {
        updateUser({ profileImageUrl: updatedUser.profileImageUrl });
        setProfileUser((prev) => ({ ...prev, profileImageUrl: updatedUser.profileImageUrl }));
        toast.success('Profile photo updated via GCS! 📸');
      }
    } catch (err) {
      toast.error('Failed to upload photo: ' + getErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
    }
  }

  // Delete post handler
  async function handleDeletePost(postId) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postApi.deletePost(postId);
      toast.success('Post deleted');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  // Inline edit name handlers (own profile only)
  function handleSaveName() {
    if (!nameInput.trim()) return;
    updateUser({ name: nameInput.trim() });
    setProfileUser((prev) => ({ ...prev, name: nameInput.trim() }));
    setEditingName(false);
    toast.success('Profile name updated');
  }

  function handleCancelEdit() {
    setNameInput(profileUser?.name || '');
    setEditingName(false);
  }

  // Connect action with other user
  async function handleConnect() {
    if (!targetUserId) return;
    setProcessingConnect(true);
    try {
      await connectionApi.sendRequest(targetUserId);
      setConnectionStatus('PENDING_SENT');
      toast.success(`Connection request sent to ${profileUser?.name}!`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingConnect(false);
    }
  }

  // Accept connection action
  async function handleAccept() {
    if (!targetUserId) return;
    setProcessingConnect(true);
    try {
      await connectionApi.acceptRequest(targetUserId);
      setConnectionStatus('CONNECTED');
      toast.success(`Connected with ${profileUser?.name}!`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingConnect(false);
    }
  }

  const displayName = profileUser?.name || (isOwnProfile ? currentUser?.name : `User #${targetUserId}`);
  const displayEmail = profileUser?.email || (isOwnProfile ? currentUser?.email : '');
  const displayImage = profileUser?.profileImageUrl || (isOwnProfile ? currentUser?.profileImageUrl : null);

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="profile-page">
            {/* Back button when viewing other user */}
            {!isOwnProfile && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}

            {/* Profile Header Card */}
            <div className="profile-header-card card animate-fade-in">
              {/* Cover Banner */}
              <div className="profile-cover">
                <div className="profile-cover-gradient" />
              </div>

              {/* Avatar + Info */}
              <div className="profile-header-body">
                <div className="profile-avatar-wrap" style={{ position: 'relative' }}>
                  <Avatar
                    name={displayName}
                    userId={targetUserId}
                    imageUrl={displayImage}
                    size="xl"
                    className="profile-main-avatar"
                  />

                  {/* Camera overlay only on own profile */}
                  {isOwnProfile && (
                    <>
                      <label
                        htmlFor="profile-photo-input"
                        className="profile-photo-upload-btn"
                        title="Change profile photo (stored in GCS)"
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          background: '#0a66c2',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: '3px solid #1a2234',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {uploadingPhoto ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                      </label>
                      <input
                        id="profile-photo-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoSelected}
                        disabled={uploadingPhoto}
                      />
                    </>
                  )}
                </div>

                <div className="profile-header-info">
                  {/* Name + Actions Row */}
                  <div className="profile-name-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      {isOwnProfile && editingName ? (
                        <div className="profile-name-edit">
                          <input
                            className="form-input"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                            style={{ fontSize: 22, fontWeight: 700, maxWidth: 280 }}
                            id="profile-name-input"
                            aria-label="Edit name"
                          />
                          <button className="btn btn-primary btn-sm" onClick={handleSaveName} id="save-name-btn">
                            <Check size={14} /> Save
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={handleCancelEdit}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h1 className="profile-name">{displayName}</h1>
                          {isOwnProfile && (
                            <button
                              className="btn btn-ghost btn-icon"
                              onClick={() => {
                                setEditingName(true);
                                setNameInput(currentUser?.name || '');
                              }}
                              aria-label="Edit name"
                              id="edit-name-btn"
                              title="Edit name"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}
                        </div>
                      )}

                      {displayEmail && (
                        <div className="profile-email">
                          <Mail size={14} />
                          {displayEmail}
                        </div>
                      )}
                    </div>

                    {/* Connect / Status Button for Other Users */}
                    {!isOwnProfile && (
                      <div className="profile-action-btn-wrap">
                        {connectionStatus === 'CONNECTED' ? (
                          <span className="badge-pill badge-success" style={{ padding: '8px 16px', fontSize: 13 }}>
                            <Check size={14} /> 1st Degree Connected
                          </span>
                        ) : connectionStatus === 'PENDING_SENT' ? (
                          <span className="badge-pill badge-warning" style={{ padding: '8px 16px', fontSize: 13 }}>
                            <Clock size={14} /> Invitation Sent
                          </span>
                        ) : connectionStatus === 'PENDING_RECEIVED' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleAccept}
                            disabled={processingConnect}
                          >
                            <Check size={14} /> Accept Invitation
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleConnect}
                            disabled={processingConnect}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 20, padding: '8px 20px' }}
                          >
                            <UserPlus size={15} />
                            {processingConnect ? 'Sending...' : 'Connect'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="profile-stats">
                    <div className="profile-stat">
                      <span className="profile-stat-value">{posts.length}</span>
                      <span className="profile-stat-label">Posts</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                      <span className="profile-stat-value">
                        {loadingConnections ? '—' : connections.length}
                      </span>
                      <span className="profile-stat-label">Connections</span>
                    </div>
                    <div className="profile-stat-divider" />
                    <div className="profile-stat">
                      <span className="profile-stat-value">#{targetUserId}</span>
                      <span className="profile-stat-label">Member ID</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-content-grid">
              {/* Left Sidebar */}
              <aside className="profile-sidebar sticky-top">
                {/* About Card */}
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>About</h3>
                    <p className="text-sm text-secondary">
                      {isOwnProfile
                        ? 'Welcome to your LinkUp profile. Share updates, connect with peers, and expand your network.'
                        : `Professional profile for ${displayName} on LinkUp.`}
                    </p>
                    <div style={{ marginTop: 12 }} className="text-sm text-muted">
                      {displayEmail && <p>📧 {displayEmail}</p>}
                      <p style={{ marginTop: 6 }}>🆔 Member ID: #{targetUserId}</p>
                    </div>
                  </div>
                </div>

                {/* Connections Preview Card */}
                <div className="card" style={{ marginTop: 12 }}>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={16} />
                      <span className="font-semibold text-sm">Connections</span>
                    </div>
                    <span className="badge-pill badge-neutral">{connections.length}</span>
                  </div>
                  <div className="card-body">
                    {loadingConnections ? (
                      <p className="text-sm text-muted">Loading...</p>
                    ) : connections.length === 0 ? (
                      <p className="text-xs text-muted">No connections yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {connections.slice(0, 5).map((conn) => {
                          const cId = conn.userId || conn.id;
                          return (
                            <Link
                              key={cId}
                              to={`/profile/${cId}`}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', textDecoration: 'none' }}
                            >
                              <Avatar name={conn.name} userId={cId} imageUrl={conn.profileImageUrl} size="xs" />
                              <span className="text-xs font-semibold text-primary">{conn.name || `User #${cId}`}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* Main Content: Posts */}
              <main className="profile-posts-col">
                <div className="card-header" style={{ marginBottom: 12, background: 'var(--color-surface)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} className="text-primary" />
                    <span className="font-bold">{isOwnProfile ? 'Your Posts' : `Posts by ${displayName}`}</span>
                  </div>
                  <span className="text-xs text-muted">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
                </div>

                {loadingPosts ? (
                  <>
                    <SkeletonPostCard />
                    <SkeletonPostCard />
                  </>
                ) : posts.length === 0 ? (
                  <div className="card">
                    <EmptyState
                      icon={<FileText size={32} />}
                      title="No posts yet"
                      description={isOwnProfile ? 'Share your thoughts, articles, or project milestones with your network.' : `${displayName} hasn't shared any posts yet.`}
                    />
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      authorName={displayName}
                      isOwnPost={post.userId === currentUser?.id}
                      onDelete={post.userId === currentUser?.id ? handleDeletePost : undefined}
                    />
                  ))
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
