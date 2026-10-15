import './CreatePost.css';
import { useState, useRef } from 'react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Image, X, Send, Loader2 } from 'lucide-react';

/**
 * CreatePost component.
 * Uses multipart/form-data — backend requires both "post" (JSON) and "file" parts.
 *
 * Backend: POST /api/v1/posts/core
 * Part "post": { content: string }
 * Part "file": image file (required by backend)
 */
export function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  function handleExpand() {
    setExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File must be smaller than 10MB');
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target.result);
    reader.readAsDataURL(selected);
  }

  function removeFile() {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDiscard() {
    setExpanded(false);
    setContent('');
    removeFile();
  }

  async function handleSubmit() {
    if (!content.trim()) {
      toast.error('Please write something to post');
      return;
    }
    if (!file) {
      toast.error('Please attach an image (required by the server)');
      return;
    }

    setLoading(true);
    try {
      const newPost = await postApi.createPost(content.trim(), file);
      toast.success('Post published! 🎉');
      onPostCreated?.(newPost);
      handleDiscard();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = content.trim().length > 0 && !!file && !loading;

  return (
    <div className="create-post card animate-fade-in">
      {!expanded ? (
        /* Collapsed state */
        <div className="create-post-collapsed">
          <Avatar name={user?.name} userId={user?.id} size="md" />
          <button
            className="create-post-trigger"
            onClick={handleExpand}
            id="create-post-trigger"
            aria-label="Create a post"
          >
            Start a post...
          </button>
        </div>
      ) : (
        /* Expanded state */
        <div className="create-post-expanded animate-slide-up">
          <div className="create-post-header">
            <Avatar name={user?.name} userId={user?.id} size="md" />
            <div>
              <p className="font-semibold" style={{ fontSize: '15px' }}>{user?.name}</p>
              <p className="text-xs text-muted">Share with your network</p>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className="create-post-textarea"
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={3000}
            aria-label="Post content"
          />

          {/* Character count */}
          <div className="create-post-char-count">
            <span style={{ color: content.length > 2800 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
              {content.length}/3000
            </span>
          </div>

          {/* Image preview */}
          {filePreview && (
            <div className="create-post-image-preview">
              <img src={filePreview} alt="Preview" className="create-post-preview-img" />
              <button
                className="create-post-remove-img"
                onClick={removeFile}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Image required notice */}
          {!file && (
            <div className="create-post-notice">
              <Image size={14} />
              <span>Image is required by the server</span>
            </div>
          )}

          <div className="divider" style={{ margin: '12px 0' }} />

          <div className="create-post-footer">
            {/* File upload button */}
            <button
              className="btn btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              aria-label="Add image"
              id="add-image-btn"
            >
              <Image size={18} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                {file ? 'Change image' : 'Add photo'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              id="post-file-input"
            />

            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDiscard}
                disabled={loading}
                id="discard-post-btn"
              >
                Discard
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={!canSubmit}
                id="publish-post-btn"
                aria-label="Publish post"
              >
                {loading ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Send size={14} />
                )}
                {loading ? 'Publishing...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
