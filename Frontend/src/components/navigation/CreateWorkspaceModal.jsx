import { useState } from "react";

const CreateWorkspaceModal = ({
  open,
  onClose,
  onCreate,
  loading
}) => {

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [error, setError] = useState("");


  if (!open) {
    return null;
  }


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");


    // Client-side validation
    if (!formData.name.trim()) {
      setError("Workspace name is required.");
      return;
    }


    try {
      await onCreate({
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      // Reset form after successful creation
      setFormData({
        name: "",
        description: ""
      });

    } catch (error) {
      setError(
        error.message ||
        "Failed to create workspace."
      );
    }
  };


  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >

      <div
        className="modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="eyebrow">
              WORKSPACE
            </div>
            <h2>
              Create Workspace
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>


        {/* Form */}
        <form
          className="project-form"
          onSubmit={handleSubmit}
        >

          {/* Workspace Name */}
          <div className="form-field">
            <label htmlFor="workspace-name">
              Workspace name
            </label>
            <input
              id="workspace-name"
              name="name"
              type="text"
              placeholder="Engineering Team"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              autoFocus
            />
          </div>


          {/* Description */}
          <div className="form-field">
            <label htmlFor="workspace-description">
              Description
            </label>
            <textarea
              id="workspace-description"
              name="description"
              placeholder="Main workspace for the engineering team"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              rows={4}
            />
          </div>


          {/* Error */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}


          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Workspace"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
