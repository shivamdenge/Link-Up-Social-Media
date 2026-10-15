import './PostCard.css';
import { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import { postApi } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

/**
 * PostCard renders a single post from the backend.
 * PostDto: { id, content, userId, createdAt }
 *
 * Note: imageUrl is NOT in PostDto (backend limitation).
 * Note: author name requires cross-referencing userId — we use connectionName if available,
 *       or fall back to "User #id". The authorName and authorConnections are passed as props from parent.
 */
export function PostCard({ post, authorName, isOwnPost = false, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const contentLimit = 220;
  const isLong = post.content?.length > contentLimit;
  const displayContent = isLong && !expanded
    ? post.content.slice(0, contentLimit) + '…'
    : post.content;

  async function handleLikeToggle() {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await postApi.unlikePost(post.id);
        setLiked(false);
        toast.success('Removed like');
      } else {
        await postApi.likePost(post.id);
        setLiked(true);
        toast.success('Post liked! 👍');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLikeLoading(false);
    }
  }

  const displayName = authorName || `User #${post.userId}`;

  return (
    <article className="post-card card animate-fade-in" aria-label={`Post by ${displayName}`}>
      {/* Header */}
      <div className="post-header">
        <div className="post-author-info">
          <Avatar name={displayName} userId={post.userId} size="md" />
          <div className="post-author-text">
            <span className="post-author-name">{displayName}</span>
            <span className="post-meta">
              {formatDateTime(post.createdAt)}
              {isOwnPost && <span className="post-own-badge">Your post</span>}
            </span>
          </div>
        </div>
        {isOwnPost && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setShowOptions((v) => !v)}
              aria-label="Post options"
              id={`post-options-${post.id}`}
            >
              <MoreHorizontal size={18} />
            </button>
            {showOptions && (
              <div className="dropdown-menu animate-slide-down" style={{ right: 0, left: 'auto' }}>
                <button className="dropdown-item danger" onClick={() => { setShowOptions(false); onDelete?.(post.id); }}>
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="post-content">
        <p className="post-text">
          {displayContent}
          {isLong && (
            <button
              className="post-see-more"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? ' See less' : ' See more'}
            </button>
          )}
        </p>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="post-media-container">
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="post-image"
            loading="lazy"
          />
        </div>
      )}

      {/* Divider */}
      <div className="divider" />

      {/* Action buttons */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLikeToggle}
          disabled={likeLoading}
          id={`like-post-${post.id}`}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike post' : 'Like post'}
        >
          <ThumbsUp size={18} strokeWidth={liked ? 0 : 2} fill={liked ? 'currentColor' : 'none'} />
          <span>{liked ? 'Liked' : 'Like'}</span>
        </button>

        {/* Comment — not backed by API, shows hint */}
        <button
          className="post-action-btn"
          id={`comment-post-${post.id}`}
          onClick={() => toast('Comments are not available yet.', { icon: '💬' })}
          aria-label="Comment on post"
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>

        <button
          className="post-action-btn"
          id={`share-post-${post.id}`}
          onClick={() => {
            navigator.clipboard?.writeText(`Post ID: ${post.id}`);
            toast.success('Post link copied!');
          }}
          aria-label="Share post"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}
