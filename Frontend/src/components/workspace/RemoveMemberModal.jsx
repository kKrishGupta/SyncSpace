const RemoveMemberModal = ({
  open,
  onClose,
  onConfirm,
  member,
  loading
}) => {
  if (!open || !member) return null;

  const memberName = member.userId?.name || "this user";

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: "420px" }}
      >
        <div className="modal-header">
          <div>
            <h2>Remove Member</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ padding: "0 24px" }}>
          <p style={{ color: "#8b93a1", fontSize: "14px", lineHeight: "1.5" }}>
            Are you sure you want to remove <strong>{memberName}</strong> from the workspace?
            They will lose access to all projects and tasks.
          </p>
        </div>

        <div className="modal-actions" style={{ marginTop: "24px" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => onConfirm(member.userId?._id)}
            disabled={loading}
            style={{ backgroundColor: "#e02424" }} // destructive red color
          >
            {loading ? "Removing..." : "Remove member"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveMemberModal;
