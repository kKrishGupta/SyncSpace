import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProjectById } from "../services/projectService";
import KanbanBoard from "../components/kanban/KanbanBoard";
const ProjectDetail = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProjectById(id);

        setProject(response.data);

      } catch (error) {
        console.error(
          "Failed to load project:",
          error
        );

        setError(
          error.message ||
          "Failed to load project."
        );

      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);


  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="page">
        <div className="project-detail-loading">
          Loading project...
        </div>
      </div>
    );
  }


  // =====================================================
  // Error
  // =====================================================

  if (error) {
    return (
      <div className="page">

        <div className="project-detail-error">
          <h2>
            Unable to load project
          </h2>

          <p>
            {error}
          </p>

          <Link
            to="/projects"
            className="secondary-button"
          >
            ← Back to Projects
          </Link>
        </div>

      </div>
    );
  }


  // =====================================================
  // Project not found
  // =====================================================

  if (!project) {
    return (
      <div className="page">

        <div className="project-detail-error">

          <h2>
            Project not found
          </h2>

          <p>
            This project may have been deleted
            or you may not have access to it.
          </p>

          <Link
            to="/projects"
            className="secondary-button"
          >
            ← Back to Projects
          </Link>

        </div>

      </div>
    );
  }


  // =====================================================
  // Main UI
  // =====================================================

  return (
    <div className="page project-detail-page">

      {/* ================================================
          Breadcrumb
      ================================================= */}

      <div className="project-breadcrumb">

        <Link to="/projects">
          Projects
        </Link>

        <span>
          /
        </span>

        <span>
          {project.name}
        </span>

      </div>


      {/* ================================================
          Project Header
      ================================================= */}

      <section className="project-detail-header">

        <div className="project-detail-main">

          <div className="project-key-large">
            {project.key}
          </div>

          <h1>
            {project.name}
          </h1>

          <p>
            {project.description ||
              "No description provided."}
          </p>

        </div>


        <div className="project-detail-status">

          <span
            className={`status-badge ${
              project.status?.toLowerCase()
            }`}
          >
            {project.status}
          </span>

        </div>

      </section>


      {/* ================================================
          Project Navigation
      ================================================= */}

      <div className="project-tabs">

        <button
          className="project-tab active"
          type="button"
        >
          Overview
        </button>

        <button
          className="project-tab"
          type="button"
        >
          Members
        </button>

        <button
          className="project-tab"
          type="button"
        >
          Projects
        </button>

        <button
          className="project-tab"
          type="button"
        >
          Activity
        </button>

      </div>


      {/* ================================================
          Overview
      ================================================= */}

      <section className="project-overview-grid">

        {/* Project Information */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <div className="panel-eyebrow">
                PROJECT
              </div>

              <h2>
                Overview
              </h2>
            </div>

          </div>


          <div className="project-info-list">

            <div className="project-info-row">

              <span>
                Project key
              </span>

              <strong>
                {project.key}
              </strong>

            </div>


            <div className="project-info-row">

              <span>
                Status
              </span>

              <strong>
                {project.status}
              </strong>

            </div>


            <div className="project-info-row">

              <span>
                Created
              </span>

              <strong>
                {project.createdAt
                  ? new Date(
                      project.createdAt
                    ).toLocaleDateString()
                  : "—"}
              </strong>

            </div>


            <div className="project-info-row">

              <span>
                Last updated
              </span>

              <strong>
                {project.updatedAt
                  ? new Date(
                      project.updatedAt
                    ).toLocaleDateString()
                  : "—"}
              </strong>

            </div>

          </div>

        </div>


        {/* Members */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <div className="panel-eyebrow">
                TEAM
              </div>

              <h2>
                Members
              </h2>

            </div>

          </div>


          <div className="project-placeholder">

            <div className="placeholder-icon">
              ◉
            </div>

            <p>
              Project members will appear here.
            </p>

          </div>

        </div>


      </section>


      {/* ================================================
          Activity
      ================================================= */}

      <section className="panel project-activity-panel">

        <div className="panel-header">

          <div>

            <div className="panel-eyebrow">
              PROJECT
            </div>

            <h2>
              Activity
            </h2>

          </div>

        </div>


        <div className="project-placeholder">

          <div className="placeholder-icon">
            ◌
          </div>

          <p>
            Project activity will appear here.
          </p>

        </div>

      </section>



      <section className="project-kanban-section">

     <KanbanBoard
       projectId={id}

    onAddTask={(status) => {
      console.log(
        "Create task with status:",
        status
      );
    }}

    onTaskClick={(task) => {
      console.log(
        "Open task:",
        task
      );
    }}
  />

</section>

    </div>
  );
};

export default ProjectDetail;