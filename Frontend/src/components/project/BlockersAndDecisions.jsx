import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, FileText, Plus, ShieldAlert } from 'lucide-react';
import { fileService } from '../../services/fileService';

const BlockersAndDecisions = ({ projectId }) => {
  const [activeSubTab, setActiveSubTab] = useState('Blockers');
  const [blockers, setBlockers] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Blocker form state
  const [blockerTitle, setBlockerTitle] = useState('');
  const [blockerSeverity, setBlockerSeverity] = useState('HIGH');
  const [isCreatingBlocker, setIsCreatingBlocker] = useState(false);

  // Decision form state
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [isCreatingDecision, setIsCreatingDecision] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [bRes, dRes] = await Promise.all([
          fileService.getProjectBlockers(projectId),
          fileService.getProjectDecisions(projectId)
        ]);
        setBlockers(bRes.data || []);
        setDecisions(dRes.data || []);
      } catch (err) {
        console.error("Failed to load blockers & decisions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) loadData();
  }, [projectId]);

  const handleAddBlocker = async (e) => {
    e.preventDefault();
    if (!blockerTitle.trim()) return;

    try {
      const res = await fileService.createBlocker(projectId, {
        title: blockerTitle.trim(),
        severity: blockerSeverity
      });
      setBlockers(prev => [res.data, ...prev]);
      setBlockerTitle('');
      setIsCreatingBlocker(false);
    } catch (err) {
      console.error("Failed to create blocker:", err);
    }
  };

  const handleResolveBlocker = async (blockerId) => {
    try {
      const res = await fileService.resolveBlocker(blockerId);
      setBlockers(prev => prev.map(b => b._id === blockerId ? res.data : b));
    } catch (err) {
      console.error("Failed to resolve blocker:", err);
    }
  };

  const handleAddDecision = async (e) => {
    e.preventDefault();
    if (!decisionTitle.trim() || !decisionRationale.trim()) return;

    try {
      const res = await fileService.createDecision(projectId, {
        title: decisionTitle.trim(),
        rationale: decisionRationale.trim()
      });
      setDecisions(prev => [res.data, ...prev]);
      setDecisionTitle('');
      setDecisionRationale('');
      setIsCreatingDecision(false);
    } catch (err) {
      console.error("Failed to create decision record:", err);
    }
  };

  return (
    <div className="blockers-decisions-container" style={{ padding: '16px' }}>
      {/* Subtab Toggle */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #30363d', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveSubTab('Blockers')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'Blockers' ? '2px solid #f85149' : '2px solid transparent',
            color: activeSubTab === 'Blockers' ? '#f0f6fc' : '#8b949e',
            fontWeight: 600,
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertOctagon size={16} style={{ color: '#f85149' }} /> Technical Blockers ({blockers.filter(b => b.status === 'OPEN').length})
        </button>

        <button
          onClick={() => setActiveSubTab('Decisions')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'Decisions' ? '2px solid #58a6ff' : '2px solid transparent',
            color: activeSubTab === 'Decisions' ? '#f0f6fc' : '#8b949e',
            fontWeight: 600,
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={16} style={{ color: '#58a6ff' }} /> Architectural Decisions (ADR) ({decisions.length})
        </button>
      </div>

      {/* BLOCKERS VIEW */}
      {activeSubTab === 'Blockers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: '#8b949e' }}>Report urgent impediments stopping developer workflow.</span>
            <button onClick={() => setIsCreatingBlocker(!isCreatingBlocker)} className="secondary-button mini">
              <Plus size={14} /> Report Blocker
            </button>
          </div>

          {isCreatingBlocker && (
            <form onSubmit={handleAddBlocker} style={{ background: '#21262d', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Blocker Summary (e.g. Redis production connection failing)"
                value={blockerTitle}
                onChange={(e) => setBlockerTitle(e.target.value)}
                className="text-input"
                style={{ width: '100%', marginBottom: '8px' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select value={blockerSeverity} onChange={(e) => setBlockerSeverity(e.target.value)} className="branch-select">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
                <button type="submit" className="primary-button mini">Report</button>
              </div>
            </form>
          )}

          {blockers.map(b => (
            <div key={b._id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#f8514922', color: '#f85149', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{b.severity}</span>
                  <strong style={{ color: '#f0f6fc', fontSize: '14px' }}>{b.title}</strong>
                </div>
                <span style={{ fontSize: '11px', color: '#8b949e' }}>Reported by {b.ownerId?.name || 'Developer'} • Status: {b.status}</span>
              </div>
              {b.status !== 'RESOLVED' && (
                <button onClick={() => handleResolveBlocker(b._id)} className="secondary-button mini" style={{ color: '#3fb950' }}>
                  <CheckCircle2 size={14} /> Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DECISIONS VIEW */}
      {activeSubTab === 'Decisions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', color: '#8b949e' }}>Record architectural decisions and consensus (ADR Log).</span>
            <button onClick={() => setIsCreatingDecision(!isCreatingDecision)} className="secondary-button mini">
              <Plus size={14} /> Log Decision
            </button>
          </div>

          {isCreatingDecision && (
            <form onSubmit={handleAddDecision} style={{ background: '#21262d', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Decision Title (e.g. Use Redis Pub/Sub for WebSockets)"
                value={decisionTitle}
                onChange={(e) => setDecisionTitle(e.target.value)}
                className="text-input"
                style={{ width: '100%', marginBottom: '8px' }}
                required
              />
              <textarea
                placeholder="Rationale & reasoning behind this architecture choice..."
                value={decisionRationale}
                onChange={(e) => setDecisionRationale(e.target.value)}
                className="text-input"
                rows={2}
                style={{ width: '100%', marginBottom: '8px' }}
                required
              />
              <button type="submit" className="primary-button mini">Save Decision</button>
            </form>
          )}

          {decisions.map(d => (
            <div key={d._id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#f0f6fc', fontSize: '14px' }}>{d.title}</strong>
                <span style={{ background: '#23863622', color: '#3fb950', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{d.status}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#c9d1d9', margin: '6px 0' }}>{d.rationale}</p>
              <span style={{ fontSize: '11px', color: '#8b949e' }}>Log author: {d.authorId?.name || 'Architect'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockersAndDecisions;
