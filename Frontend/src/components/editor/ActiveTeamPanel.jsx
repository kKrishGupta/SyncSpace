import React from 'react';
import { Users, Eye, Edit3, Circle, Radio, Shield } from 'lucide-react';

const ActiveTeamPanel = ({ members = [], activeUserStates = {}, isOnline, currentUser }) => {
  return (
    <div className="active-team-panel">
      {/* Header */}
      <div className="team-panel-header">
        <div className="panel-title">
          <Users size={16} />
          <span>TEAM COLLABORATORS</span>
        </div>
        <div className="online-badge">
          <Radio size={12} className="pulse-green" />
          <span>{members.filter(m => isOnline(m.userId?._id || m.userId)).length} Online</span>
        </div>
      </div>

      {/* Team Member List */}
      <div className="team-member-list">
        {members.map((member) => {
          const u = member.userId || member;
          const uId = String(u._id || u.id || u);
          const online = isOnline(uId);
          const userState = activeUserStates[uId] || {};
          const isSelf = currentUser?._id === uId;

          return (
            <div key={uId} className={`team-member-card ${online ? 'online' : 'offline'}`}>
              <div className="member-avatar-wrapper">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="member-avatar" />
                ) : (
                  <div className="member-avatar-fallback">
                    {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className={`presence-dot ${online ? 'online' : 'offline'}`} />
              </div>

              <div className="member-details">
                <div className="member-name-row">
                  <span className="member-name">{u.name} {isSelf && '(You)'}</span>
                  <span className="member-role">{member.role || 'DEVELOPER'}</span>
                </div>

                <div className="member-activity">
                  {online ? (
                    userState.activeFile ? (
                      <span className="activity-status editing">
                        <Edit3 size={11} /> Editing: <strong>{userState.activeFile}</strong>
                        {userState.cursor && (
                          <span className="line-indicator"> (L{userState.cursor.lineNumber})</span>
                        )}
                      </span>
                    ) : (
                      <span className="activity-status viewing">
                        <Eye size={11} /> Viewing workspace
                      </span>
                    )
                  ) : (
                    <span className="activity-status offline">Offline</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Session Control Card */}
      <div className="live-session-card">
        <div className="session-card-header">
          <Radio size={14} className="recording-icon" />
          <span>LIVE CODING SESSION</span>
        </div>
        <p className="session-desc">
          Multiple developers connected in real-time. Changes and cursors are broadcasted live.
        </p>
      </div>
    </div>
  );
};

export default ActiveTeamPanel;
