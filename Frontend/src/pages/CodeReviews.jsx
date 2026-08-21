import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitPullRequest, Plus, CheckCircle, XCircle, MessageSquare, Shield, Clock } from 'lucide-react';
import { fileService } from '../services/fileService';
import { useAuth } from '../context/AuthContext';

const CodeReviews = () => {
  const { id: projectId } = useParams();
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [additions, setAdditions] = useState(42);
  const [deletions, setDeletions] = useState(12);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const res = await fileService.getProjectReviews(projectId);
        setReviews(res.data || []);
      } catch (err) {
        console.error("Failed to load project reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) loadReviews();
  }, [projectId]);

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fileService.createCodeReview(projectId, {
        title: title.trim(),
        description: description.trim(),
        additions: Number(additions),
        deletions: Number(deletions)
      });

      setReviews(prev => [res.data, ...prev]);
      setTitle('');
      setDescription('');
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create review PR:", err);
    }
  };

  const handleUpdateStatus = async (reviewId, status) => {
    try {
      const res = await fileService.updateReviewStatus(reviewId, status);
      setReviews(prev => prev.map(r => r._id === reviewId ? res.data : r));
    } catch (err) {
      console.error("Failed to update review status:", err);
    }
  };

  return (
    <div className="page project-reviews-page">
      <div className="panel-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f6fc', margin: 0 }}>Code Reviews (Pull Requests)</h1>
          <p style={{ fontSize: '13px', color: '#8b949e', margin: '4px 0 0 0' }}>Review line changes, request edits, approve code, and merge into production.</p>
        </div>
        <button onClick={() => setIsCreating(!isCreating)} className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Create Code Review
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreatePR} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', color: '#f0f6fc', marginTop: 0 }}>New Code Review PR</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="PR Title (e.g. JWT Authentication Module)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-input"
              required
            />
            <textarea
              placeholder="Describe your code changes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-input"
              rows={3}
            />
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#8b949e' }}>+ Additions:</label>
                <input type="number" value={additions} onChange={(e) => setAdditions(e.target.value)} className="text-input" style={{ width: '100px', marginLeft: '8px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8b949e' }}>- Deletions:</label>
                <input type="number" value={deletions} onChange={(e) => setDeletions(e.target.value)} className="text-input" style={{ width: '100px', marginLeft: '8px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="primary-button">Submit PR for Review</button>
              <button type="button" onClick={() => setIsCreating(false)} className="secondary-button">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: '#8b949e' }}>Loading code reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="panel" style={{ padding: '30px', textAlign: 'center', color: '#8b949e' }}>
          <GitPullRequest size={32} style={{ marginBottom: '10px', color: '#58a6ff' }} />
          <h3>No Open Code Reviews</h3>
          <p>Create a code review PR to submit your team changes for feedback and approval.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map(pr => {
            const author = pr.authorId || {};
            const reviewer = pr.reviewerId || {};

            return (
              <div key={pr._id} className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <GitPullRequest size={20} style={{ color: pr.status === 'APPROVED' ? '#3fb950' : pr.status === 'MERGED' ? '#a371f7' : '#58a6ff', marginTop: '2px' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '15px', color: '#f0f6fc' }}>PR #{pr.reviewNumber}: {pr.title}</strong>
                      <span className={`status-badge ${pr.status?.toLowerCase()}`} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        {pr.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
                      Opened by <strong>{author.name || 'User'}</strong> • <span style={{ color: '#3fb950' }}>+{pr.additions || 0}</span> <span style={{ color: '#f85149' }}>-{pr.deletions || 0}</span> • {new Date(pr.createdAt).toLocaleDateString()}
                    </div>
                    {pr.description && <p style={{ fontSize: '13px', color: '#c9d1d9', margin: '6px 0 0 0' }}>{pr.description}</p>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {pr.status !== 'APPROVED' && pr.status !== 'MERGED' && (
                    <>
                      <button onClick={() => handleUpdateStatus(pr._id, 'APPROVED')} className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3fb950', borderColor: '#238636' }}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => handleUpdateStatus(pr._id, 'CHANGES_REQUESTED')} className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e3b341' }}>
                        <XCircle size={14} /> Request Changes
                      </button>
                    </>
                  )}
                  {pr.status === 'APPROVED' && (
                    <button onClick={() => handleUpdateStatus(pr._id, 'MERGED')} className="primary-button" style={{ backgroundColor: '#8957e5' }}>
                      Merge PR
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CodeReviews;
