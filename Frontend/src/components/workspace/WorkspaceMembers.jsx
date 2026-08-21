import { useState, useEffect, useMemo } from "react";
import {
  getWorkspaceMembers,
  updateMemberRole,
  removeWorkspaceMember
} from "../../services/workspaceService";
import useWebSocket from "../../hooks/useWebSocket";
import { useAuth } from "../../context/AuthContext";
import InviteMemberModal from "./InviteMemberModal";
import RemoveMemberModal from "./RemoveMemberModal";

const WorkspaceMembers = ({ workspaceId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  const { user } = useAuth();
  const { subscribe, joinWorkspace } = useWebSocket();

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getWorkspaceMembers(workspaceId);
      setMembers(response.data || []);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadMembers();
    }
    
    if (workspaceId && subscribe) {
      // Ensure we've joined the workspace room if not already
      if (joinWorkspace) joinWorkspace(workspaceId);

      const unsubAdded = subscribe("WORKSPACE_MEMBER_ADDED", (msg) => {
        if (msg.workspaceId === workspaceId) loadMembers();
      });
      const unsubUpdated = subscribe("WORKSPACE_MEMBER_UPDATED", (msg) => {
        if (msg.workspaceId === workspaceId) {
          setMembers(prev => prev.map(m => m.userId?._id === msg.payload.userId ? { ...m, role: msg.payload.role } : m));
        }
      });
      const unsubRemoved = subscribe("WORKSPACE_MEMBER_REMOVED", (msg) => {
        if (msg.workspaceId === workspaceId) {
          setMembers(prev => prev.filter(m => m.userId?._id !== msg.payload.userId));
        }
      });
      const unsubSnapshot = subscribe("PRESENCE_SNAPSHOT", (msg) => {
        if (msg.workspaceId === workspaceId) {
          setOnlineUserIds(new Set(msg.payload.users));
        }
      });
      const unsubOnline = subscribe("USER_ONLINE", (msg) => {
        if (msg.workspaceId === workspaceId) {
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            next.add(msg.payload.userId);
            return next;
          });
        }
      });
      const unsubOffline = subscribe("USER_OFFLINE", (msg) => {
        if (msg.workspaceId === workspaceId) {
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            next.delete(msg.payload.userId);
            return next;
          });
        }
      });
      return () => {
        unsubAdded?.();
        unsubUpdated?.();
        unsubRemoved?.();
        unsubSnapshot?.();
        unsubOnline?.();
        unsubOffline?.();
      };
    }
  }, [workspaceId, subscribe, joinWorkspace]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId);
      setError("");
      await updateMemberRole(workspaceId, userId, newRole);
      setMembers(prev => prev.map(m => m.userId?._id === userId ? { ...m, role: newRole } : m));
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to update role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveConfirm = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");
      await removeWorkspaceMember(workspaceId, userId);
      setMembers(prev => prev.filter(m => m.userId?._id !== userId));
      setMemberToRemove(null);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to remove member.");
    } finally {
      setActionLoading(null);
    }
  };
  
  const currentUserRole = members.find(m => m.userId?._id === user?._id || m.userId?._id === user?.id || String(m.userId) === user?.id)?.role;
  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  // Derived state
  const filteredMembers = useMemo(() => {
    let result = members;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.userId?.name?.toLowerCase().includes(q) || 
        m.userId?.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "ALL") {
      result = result.filter(m => m.role === roleFilter);
    }
    return result;
  }, [members, searchQuery, roleFilter]);

  const onlineCount = members.filter(m => {
    const uId = user?._id || user?.id;
    const isSelf = m.userId?._id === uId || String(m.userId) === uId;
    return isSelf || onlineUserIds.has(m.userId?._id) || onlineUserIds.has(String(m.userId));
  }).length || 1; // At least the current user is online
  
  const adminsCount = members.filter(m => m.role === 'ADMIN' || m.role === 'OWNER').length;

  if (loading) {
    return (
      <div className="workspace-members">
        <div className="members-header" style={{ marginBottom: "24px" }}>
          <div>
            <h2>Members</h2>
            <p style={{ color: "#8b93a1", fontSize: "13px", marginTop: "4px" }}>Manage workspace access and permissions.</p>
          </div>
        </div>
        <div className="member-skeleton-list">
          {[1,2,3].map(i => (
            <div key={i} className="member-row" style={{ opacity: 0.5, pointerEvents: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#242a33" }}></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ width: "120px", height: "14px", background: "#242a33", borderRadius: "4px" }}></div>
                  <div style={{ width: "160px", height: "12px", background: "#171c23", borderRadius: "4px" }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-members">
      
      {/* Header */}
      <div className="members-header-row">
        <div>
          <h2 style={{ fontSize: "18px", margin: "0 0 4px 0", fontWeight: "600" }}>Members</h2>
          <p style={{ color: "#8b93a1", fontSize: "13px", margin: 0 }}>
             Manage workspace access and permissions.
          </p>
        </div>
        <button 
          className="primary-button"
          onClick={() => setIsInviteModalOpen(true)}
          style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span>+</span> Invite member
        </button>
      </div>

      {/* Summary */}
      <div className="members-summary" style={{ fontSize: "12px", color: "#8b93a1", marginBottom: "24px", display: "flex", gap: "16px" }}>
        <span><strong>{members.length}</strong> total</span>
        <span>•</span>
        <span><strong>{onlineCount}</strong> online</span>
        <span>•</span>
        <span><strong>{adminsCount}</strong> admins</span>
      </div>

      {/* Toolbar */}
      <div className="members-toolbar-row">
        <div className="search-input" style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#626b78" }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", background: "#12161c", border: "1px solid #242a33", borderRadius: "6px", padding: "8px 12px 8px 36px", color: "#f3f4f6", fontSize: "13px" }}
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ background: "#12161c", border: "1px solid #242a33", borderRadius: "6px", padding: "8px 12px", color: "#f3f4f6", fontSize: "13px", width: "140px" }}
        >
          <option value="ALL">All roles</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>
      </div>

      {error && <div className="error-banner mb-4">{error}</div>}

      {/* Member List */}
      <div className="members-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filteredMembers.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px", background: "#12161c", borderRadius: "8px", border: "1px dashed #242a33", textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px", color: "#626b78" }}>👥</div>
            <h3 style={{ fontSize: "14px", margin: "0 0 4px 0", color: "#f3f4f6" }}>No teammates found</h3>
            <p style={{ fontSize: "13px", color: "#8b93a1", margin: 0 }}>
              {searchQuery || roleFilter !== 'ALL' ? "Try adjusting your filters." : "Invite your team members to start collaborating."}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div 
              key={member._id} 
              className="member-row member-row-layout"
            >
              <div className="member-row-info">
                <div 
                  className="avatar" 
                  style={{ 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "50%", 
                    backgroundColor: "#1e232d", 
                    color: "#a992ff", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "1px solid #2b323d",
                    flexShrink: 0
                  }}
                >
                  {member.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                  <div style={{ fontWeight: "500", color: "#f3f4f6", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.userId?.name || "Unknown User"}</span>
                    {member.role === 'OWNER' && (
                      <span style={{ fontSize: "10px", background: "#19152d", color: "#a992ff", padding: "2px 6px", borderRadius: "4px", border: "1px solid #30275c", fontWeight: "600" }}>
                        OWNER
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "13px", color: "#8b93a1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {member.userId?.email || "No email"}
                  </div>
                </div>
              </div>
              
              <div className="member-row-actions">
                
                {/* Presence */}
                <div className="member-presence">
                   {(() => {
                     const uId = user?._id || user?.id;
                     const isSelf = member.userId?._id === uId || String(member.userId) === uId;
                     const isOnline = isSelf || onlineUserIds.has(member.userId?._id) || onlineUserIds.has(String(member.userId));
                     return (
                       <>
                         <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isOnline ? "#10b981" : "#4b5563" }}></span>
                         <span style={{ fontSize: "12px", color: isOnline ? "#f3f4f6" : "#8b93a1" }}>
                           {isOnline ? "Online" : "Offline"}
                         </span>
                       </>
                     );
                   })()}
                </div>

                {/* Role Select */}
                {canManageMembers ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.userId?._id, e.target.value)}
                    disabled={actionLoading === member.userId?._id || (member.role === 'OWNER' && member.userId?._id === user?.id)}
                    style={{ 
                      padding: "6px 10px", 
                      borderRadius: "6px", 
                      border: "1px solid transparent", 
                      background: "transparent", 
                      color: "#c5cad3",
                      fontSize: "13px",
                      cursor: "pointer",
                      width: "110px",
                      transition: "background 150ms ease"
                    }}
                    className="role-select"
                  >
                    <option value="OWNER" style={{ background: "#12161c", color: "#f3f4f6" }}>Owner</option>
                    <option value="ADMIN" style={{ background: "#12161c", color: "#f3f4f6" }}>Admin</option>
                    <option value="MANAGER" style={{ background: "#12161c", color: "#f3f4f6" }}>Manager</option>
                    <option value="MEMBER" style={{ background: "#12161c", color: "#f3f4f6" }}>Member</option>
                    <option value="VIEWER" style={{ background: "#12161c", color: "#f3f4f6" }}>Viewer</option>
                  </select>
                ) : (
                  <span style={{ fontSize: "13px", color: "#8b93a1", width: "110px", display: "inline-block" }}>
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                )}
                
                {/* Actions */}
                <div className="member-action-wrap">
                  {canManageMembers && member.userId?._id !== user?.id && (
                    <button
                      onClick={() => setMemberToRemove(member)}
                      disabled={actionLoading === member.userId?._id}
                      style={{ 
                        background: "transparent", 
                        color: "#626b78", 
                        border: "none", 
                        cursor: "pointer", 
                        padding: "4px",
                        fontSize: "16px",
                        borderRadius: "4px"
                      }}
                      className="member-action-btn"
                      title="Remove Member"
                    >
                      {actionLoading === member.userId?._id ? "…" : "⋯"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <InviteMemberModal 
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
      />

      <RemoveMemberModal 
        open={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        onConfirm={handleRemoveConfirm}
        loading={!!actionLoading}
      />
      
    </div>
  );
};

export default WorkspaceMembers;
