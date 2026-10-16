import './ProfilePage.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import { connectionApi } from '../../api/connectionApi';
import { Navbar } from '../../components/layout/Navbar';
import { Avatar } from '../../components/ui/Avatar';
import { PostCard } from '../../components/posts/PostCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonPostCard, SkeletonText } from '../../components/ui/Skeleton';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';
import { FileText, Users, Mail, Edit2, Check, X, Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Inline name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');

  useEffect(() => {
    if (!user?.id) return;

    // Load posts
    setLoadingPosts(true);
    postApi.getPostsByUser(user.id)
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(sorted);
      })
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoadingPosts(false));

    // Load connections
    setLoadingConnections(true);
    connectionApi.getConnections(user.id)
      .then(setConnections)
      .catch(() => {})
      .finally(() => setLoadingConnections(false));
  }, [user?.id]);

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
        toast.success('Profile photo updated via GCS! 📸');
      }
    } catch (err) {
      toast.error('Failed to upload photo: ' + getErrorMessage(err));
    } finally {
      setUploadingPhoto(false);
    }
  }

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

  function handleSaveName() {
    if (!nameInput.trim()) return;
    updateUser({ name: nameInput.trim() });
    setEditingName(false);
    toast.success('Profile name updated');
  }

  function handleCancelEdit() {
    setNameInput(user?.name || '');
    setEditingName(false);
  }


  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="profile-page">
            {/* Profile Header Card */}
            <div className="profile-header-card card animate-fade-in">
              {/* Cover */}
              <div className="profile-cover">
                <div className="profile-cover-gradient" />
              </div>

              {/* Avatar + Info */}
              <div className="profile-header-body">
                <div className="profile-avatar-wrap" style={{ position: 'relative' }}>
                  <Avatar name={user?.name} userId={user?.id} imageUrl={user?.profileImageUrl} size="xl" className="profile-main-avatar" />
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
                </div>


                <div className="profile-header-info">
                  {/* Name with edit */}
                  <div className="profile-name-row">
                    {editingName ? (
                      <div className="profile-name-edit">
                        <input
                          className="form-input"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
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
                      <>
                        <h1 className="profile-name">{user?.name || 'Your Name'}</h1>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => { setEditingName(true); setNameInput(user?.name || ''); }}
                          aria-label="Edit name"
                          id="edit-name-btn"
                          title="Edit name"
                        >
                          <Edit2 size={15} />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="profile-email">
                    <Mail size={14} />
                    {user?.email}
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
                      <span className="profile-stat-value">#{user?.id}</span>
                      <span className="profile-stat-label">Member ID</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-content-grid">
              {/* Left: About + Connections */}
              <aside className="profile-sidebar sticky-top">
                {/* About */}
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>About</h3>
                    <p className="text-sm text-secondary">
                      Welcome to your LinkUp profile. This is your professional hub for connecting with people and sharing updates.
                    </p>
                    <div style={{ marginTop: 12 }} className="text-sm text-muted">
                      <p>📧 {user?.email}</p>
                      <p style={{ marginTop: 6 }}>🆔 User ID: {user?.id}</p>
                    </div>
                  </div>
                </div>

                {/* Connections preview */}
                <div className="card" style={{ marginTop: 12 }}>
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                      <h3 style={{ fontSize: 16 }}>Connections</h3>
                      <span className="badge badge-primary">
                        {loadingConnections ? '…' : connections.length}
                      </span>
                    </div>
                    {loadingConnections ? (
                      <p className="text-sm text-muted">Loading…</p>
                    ) : connections.length === 0 ? (
                      <EmptyState
                        icon={<Users size={24} />}
                        title="No connections"
                        description="Start connecting with people."
                      />
                    ) : (
                      <>
                        <div className="profile-connection-avatars">
                          {connections.slice(0, 6).map((c) => (
                            <div key={c.id} className="profile-connection-avatar-wrap" title={c.name}>
                              <Avatar name={c.name} userId={c.userId} size="sm" />
                            </div>
                          ))}
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm btn-full"
                          style={{ marginTop: 12 }}
                          onClick={() => navigate('/connections')}
                        >
                          <Users size={14} /> View all connections
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </aside>

              {/* Right: Posts */}
              <main className="profile-posts">
                <div className="profile-posts-header">
                  <FileText size={16} />
                  <h3 style={{ fontSize: 16 }}>Activity</h3>
                  <span className="badge badge-primary">{posts.length} posts</span>
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
                      description="Share something with your network."
                    />
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      authorName={user?.name}
                      isOwnPost={true}
                      onDelete={handleDeletePost}
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
