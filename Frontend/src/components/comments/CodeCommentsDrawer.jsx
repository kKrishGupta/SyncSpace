import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Send } from 'lucide-react';
import { fileService } from '../../services/fileService';

const CodeCommentsDrawer = ({ activeFile, projectId, selectedLine, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [targetLine, setTargetLine] = useState(selectedLine || 1);

  useEffect(() => {
    if (selectedLine) setTargetLine(selectedLine);
  }, [selectedLine]);

  useEffect(() => {
    const loadComments = async () => {
      if (!activeFile?._id) return;
      try {
        setLoading(true);
        const res = await fileService.getCodeComments(activeFile._id);
        setComments(res.data || []);
      } catch (err) {
        console.error("Failed to load code comments:", err);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [activeFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeFile?._id) return;

    try {
      const res = await fileService.createCodeComment({
        projectId,
        fileId: activeFile._id,
        line: Number(targetLine),
        content: newCommentText.trim()
      });

      setComments(prev => [...prev, res.data]);
      setNewCommentText('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("Failed to post code comment:", err);
    }
  };

  const toggleResolve = async (commentId) => {
    try {
      const res = await fileService.toggleCommentStatus(commentId);
      setComments(prev => prev.map(c => c._id === commentId ? res.data : c));
    } catch (err) {
      console.error("Failed to toggle comment status:", err);
    }
  };

  return (
    <div className="code-comments-drawer">
      {/* Comment Form */}
      {activeFile ? (
        <form onSubmit={handleSubmit} className="add-comment-form">
          <div className="comment-form-header">
            <span>Add Comment on <strong>{activeFile.name}</strong></span>
            <div className="line-selector">
              <label>Line:</label>
              <input
                type="number"
                min="1"
                value={targetLine}
                onChange={(e) => setTargetLine(e.target.value)}
                className="line-number-input"
              />
            </div>
          </div>
          <div className="comment-input-row">
            <textarea
              placeholder="Ask a question or suggest a change on this line..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="code-comment-textarea"
              rows={2}
            />
            <button type="submit" className="primary-button post-comment-btn">
              <Send size={14} /> Post
            </button>
          </div>
        </form>
      ) : (
        <div className="no-file-comment-msg">Open a file to add line comments</div>
      )}

      {/* Existing Comments List */}
      <div className="code-comments-list">
        {loading ? (
          <div className="comments-loading">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="empty-comments">No inline code comments on this file yet.</div>
        ) : (
          comments.map(c => {
            const author = c.authorId || {};
            const isResolved = c.status === 'RESOLVED';

            return (
              <div key={c._id} className={`code-comment-card ${isResolved ? 'resolved' : ''}`}>
                <div className="comment-card-header">
                  <div className="comment-author-info">
                    <span className="line-badge">L{c.line}</span>
                    <strong className="author-name">{author.name || 'User'}</strong>
                    <span className="comment-time">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => toggleResolve(c._id)}
                    className={`resolve-btn ${isResolved ? 'is-resolved' : ''}`}
                    title={isResolved ? "Reopen comment" : "Resolve comment"}
                  >
                    <CheckCircle size={14} /> {isResolved ? 'Resolved' : 'Resolve'}
                  </button>
                </div>
                <div className="comment-card-body">{c.content}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CodeCommentsDrawer;
