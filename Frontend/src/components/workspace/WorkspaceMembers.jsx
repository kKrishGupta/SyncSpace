import { useState, useEffect } from "react";
import {
  getWorkspaceMembers,
  inviteMember,
} from "../../services/workspaceService";

const WorkspaceMembers = ({ workspaceId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getWorkspaceMembers(workspaceId);
      setMembers(response.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadMembers();
    }
  }, [workspaceId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      setInviteError("");
      setInviteSuccess("");

      await inviteMember(workspaceId, inviteEmail);
      
      setInviteSuccess(`Successfully invited ${inviteEmail}!`);
      setInviteEmail("");
      
      // Reload members list to show new member
      await loadMembers();
      
    } catch (err) {
      setInviteError(
        err?.response?.data?.message || "Failed to invite member."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading members...</div>;
  }

  return (
    <div className="workspace-members">
      <div className="panel mb-4">
        <h3>Invite a Member</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          Invite anyone to collaborate with you on this workspace.
        </p>
        
        <form className="invite-form" onSubmit={handleInvite} style={{ display: "flex", gap: "1rem" }}>
          <input
            type="email"
            className="input-field"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button
            type="submit"
            className="primary-button"
            disabled={inviteLoading || !inviteEmail.trim()}
          >
            {inviteLoading ? "Inviting..." : "Invite"}
          </button>
        </form>

        {inviteError && <div className="error-message mt-2">{inviteError}</div>}
        {inviteSuccess && <div className="success-message mt-2" style={{ color: "var(--accent-color)" }}>{inviteSuccess}</div>}
      </div>

      <div className="panel">
        <h3>Current Members</h3>
        
        {error && <div className="error-state">{error}</div>}
        
        <div className="members-list mt-4" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {members.length === 0 && !error ? (
            <div className="empty-state">No members found.</div>
          ) : (
            members.map((member) => (
              <div 
                key={member._id} 
                className="member-row"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  backgroundColor: "var(--surface-color)",
                  borderRadius: "var(--border-radius)",
                  border: "1px solid var(--border-color)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div 
                    className="avatar" 
                    style={{ 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      backgroundColor: "var(--accent-color)", 
                      color: "white", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontWeight: "bold"
                    }}
                  >
                    {member.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      {member.userId?.name || "Unknown User"}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {member.userId?.email || "No email"}
                    </div>
                  </div>
                </div>
                
                <div className="status-badge active" style={{ fontSize: "0.75rem" }}>
                  {member.role}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceMembers;
