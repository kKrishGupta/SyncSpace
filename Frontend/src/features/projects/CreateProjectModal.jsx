import { useState } from "react";

const CreateProjectModal = ({
  open,
  onClose,
  onCreate,
  loading
}) => {

  const [formData, setFormData] = useState({
    name: "",
    key: "",
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
      setError("Project name is required.");
      return;
    }


    if (!formData.key.trim()) {
      setError("Project key is required.");
      return;
    }


    try {

      await onCreate({
        name: formData.name.trim(),

        // Always send uppercase
        key: formData.key
          .trim()
          .toUpperCase(),

        description:
          formData.description.trim()
      });


      // Reset form after successful creation
      setFormData({
        name: "",
        key: "",
        description: ""
      });

    } catch (error) {

      setError(
        error.message ||
        "Failed to create project."
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
              PROJECT
            </div>

            <h2>
              Create Project
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

          {/* Project Name */}

          <div className="form-field">

            <label htmlFor="project-name">
              Project name
            </label>

            <input
              id="project-name"
              name="name"
              type="text"
              placeholder="Backend Platform"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              autoFocus
            />

          </div>


          {/* Project Key */}

          <div className="form-field">

            <label htmlFor="project-key">
              Project key
            </label>

            <input
              id="project-key"
              name="key"
              type="text"
              placeholder="BACK"
              value={formData.key}
              onChange={handleChange}
              maxLength={10}
            />

            <small>
              Example: BACK, FRONT, INFRA
            </small>

          </div>


          {/* Description */}

          <div className="form-field">

            <label htmlFor="project-description">
              Description
            </label>

            <textarea
              id="project-description"
              name="description"
              placeholder="Core backend services"
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
                : "Create Project"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateProjectModal;