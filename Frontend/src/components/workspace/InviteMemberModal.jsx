import { useState } from "react";
import { inviteMember } from "../../services/workspaceService";

const InviteMemberModal = ({
  open,
  onClose,
  workspaceId,
  onInviteSuccess
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await inviteMember(workspaceId, email.trim());
      setSuccess(`Successfully invited ${email.trim()}!`);
      setEmail("");
      
      if (onInviteSuccess) {
        onInviteSuccess();
      }

      // Automatically close after a short delay on success
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1500);

    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to invite member.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    setEmail("");
    onClose();
  };

  return (
    <div className="modal-overlay" onMouseDown={handleClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: "420px" }}
      >
        <div className="modal-header">
          <div>
            <h2>Invite people</h2>
            <p style={{ marginTop: "4px", fontSize: "13px", color: "#8b93a1" }}>
              Add teammates to collaborate in this workspace.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="invite-email">Email address</label>
            <input
              id="invite-email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}
          {success && <div className="success-message" style={{ color: "#a992ff", fontSize: "13px", marginBottom: "16px" }}>{success}</div>}

          <div className="modal-actions" style={{ marginTop: "10px" }}>
            <button
              type="button"
              className="secondary-button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
