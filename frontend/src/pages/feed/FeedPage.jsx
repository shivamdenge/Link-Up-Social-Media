import './FeedPage.css';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import { connectionApi } from '../../api/connectionApi';
import { Navbar } from '../../components/layout/Navbar';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { CreatePost } from '../../components/posts/CreatePost';
import { PostCard } from '../../components/posts/PostCard';
import { ConnectionCard } from '../../components/connections/ConnectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonPostCard } from '../../components/ui/Skeleton';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FileText, Users, RefreshCw, TrendingUp } from 'lucide-react';

/**
 * Home / Feed Page.
 *
 * Feed Strategy (given backend limitations):
 * 1. Load current user's own posts.
 * 2. Load user's first-degree connections.
 * 3. Load posts for each connection (up to 5 connections to avoid too many requests).
 * 4. Merge and sort by createdAt desc.
 *
 * Note: Backend has NO global feed endpoint. This is the best approximation.
 */
export function FeedPage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [error, setError] = useState(null);

  // Build a map of userId → name from connections for post attribution
  const nameMap = connections.reduce((acc, person) => {
    acc[person.userId] = person.name;
    return acc;
  }, {});
  if (user) nameMap[user.id] = user.name;

  const loadFeed = useCallback(async () => {
    if (!user?.id) return;
    setLoadingPosts(true);
    setError(null);

    try {
      // Fetch own posts
      const ownPosts = await postApi.getPostsByUser(user.id);

      // Fetch connections
      let conns = [];
      try {
        conns = await connectionApi.getConnections(user.id);
        setConnections(conns);
      } catch {
        // Connections may fail without crashing feed
      }

      // Fetch posts from connections (limit to 5 to avoid request flood)
      const connectionPosts = await Promise.allSettled(
        conns.slice(0, 5).map((p) => postApi.getPostsByUser(p.userId))
      );

      const allPosts = [
        ...ownPosts,
        ...connectionPosts
          .filter((r) => r.status === 'fulfilled')
          .flatMap((r) => r.value),
      ];

      // Deduplicate by post id and sort by createdAt desc
      const seen = new Set();
      const unique = allPosts.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(unique);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingPosts(false);
    }
  }, [user?.id]);

  const loadConnections = useCallback(async () => {
    if (!user?.id) return;
    setLoadingConnections(true);
    try {
      const conns = await connectionApi.getConnections(user.id);
      setConnections(conns);
    } catch {
      // Fail silently
    } finally {
      setLoadingConnections(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFeed();
    loadConnections();
  }, [loadFeed, loadConnections]);

  function handlePostCreated(newPost) {
    setPosts((prev) => [newPost, ...prev]);
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="main-grid">
            {/* Left Sidebar */}
            <aside className="left-sidebar sticky-top">
              <ProfileCard connectionCount={connections.length} />
            </aside>

            {/* Main Feed */}
            <main className="feed-main">
              {/* Create Post */}
              <CreatePost onPostCreated={handlePostCreated} />

              {/* Feed Sort / Refresh Bar */}
              <div className="feed-sort-bar">
                <div className="feed-sort-line" />
                <div className="feed-sort-content">
                  <span className="feed-sort-label">Sort by: <strong>Recent</strong></span>
                  <button
                    className="btn btn-ghost btn-icon btn-sm feed-refresh-btn"
                    onClick={loadFeed}
                    aria-label="Refresh feed"
                    id="refresh-feed-btn"
                    title="Refresh feed"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {/* Posts list */}
              {error ? (
                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</p>
                  <button className="btn btn-outline-primary" onClick={loadFeed}>
                    Try Again
                  </button>
                </div>
              ) : loadingPosts ? (
                <>
                  <SkeletonPostCard />
                  <SkeletonPostCard />
                  <SkeletonPostCard />
                </>
              ) : posts.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={<FileText size={32} />}
                    title="No posts yet"
                    description="Create your first post or connect with people to see their updates here."
                  />
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    authorName={nameMap[post.userId]}
                    isOwnPost={post.userId === user?.id}
                  />
                ))
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="right-sidebar sticky-top">
              <div className="card">
                <div className="right-sidebar-header">
                  <Users size={16} />
                  <span>Your Network</span>
                </div>
                <div style={{ padding: '0 16px 8px' }}>
                  {loadingConnections ? (
                    <p className="text-sm text-muted" style={{ padding: '12px 0' }}>Loading…</p>
                  ) : connections.length === 0 ? (
                    <EmptyState
                      title="No connections yet"
                      description="Go to Network to send connection requests."
                    />
                  ) : (
                    connections.slice(0, 5).map((person) => (
                      <ConnectionCard key={person.id} person={person} variant="connected" />
                    ))
                  )}
                  {connections.length > 5 && (
                    <a href="/connections" className="right-sidebar-see-all">
                      See all {connections.length} connections →
                    </a>
                  )}
                </div>
              </div>

              {/* Professional News widget */}
              <div className="news-widget card">
                <div className="news-widget-header">
                  <span>LinkUp News</span>
                  <TrendingUp size={15} color="var(--color-text-muted)" />
                </div>
                <ul className="news-list">
                  <li className="news-item">
                    <span className="news-bullet">•</span>
                    <div className="news-content">
                      <span className="news-title">Tech hiring in 2026: AI & Cloud lead</span>
                      <span className="news-meta">4h ago • 12,410 readers</span>
                    </div>
                  </li>
                  <li className="news-item">
                    <span className="news-bullet">•</span>
                    <div className="news-content">
                      <span className="news-title">Building resilient microservices</span>
                      <span className="news-meta">1d ago • 8,924 readers</span>
                    </div>
                  </li>
                  <li className="news-item">
                    <span className="news-bullet">•</span>
                    <div className="news-content">
                      <span className="news-title">Java & Spring Cloud on Kubernetes</span>
                      <span className="news-meta">2d ago • 5,102 readers</span>
                    </div>
                  </li>
                  <li className="news-item">
                    <span className="news-bullet">•</span>
                    <div className="news-content">
                      <span className="news-title">Remote engineering culture tips</span>
                      <span className="news-meta">3d ago • 3,490 readers</span>
                    </div>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
