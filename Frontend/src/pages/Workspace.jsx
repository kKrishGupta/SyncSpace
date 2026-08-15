import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getWorkspaceById
} from "../services/workspaceService";

import {
  getProjectsByWorkspace
} from "../services/projectService";

const Workspace = () => {
  const { id } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          workspaceResponse,
          projectsResponse
        ] = await Promise.all([
          getWorkspaceById(id),
          getProjectsByWorkspace(id)
        ]);

        setWorkspace(
          workspaceResponse.data
        );

        setProjects(
          projectsResponse.data || []
        );
      } catch (err) {
        setError(
          err.message ||
          "Failed to load workspace"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadWorkspace();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-state">
          {error}
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="page">
        <div className="empty-state">
          Workspace not found.
        </div>
      </div>
    );
  }

  return (
    <div className="page">

      {/* Workspace header */}

      <div className="workspace-page-header">

        <div>
          <div className="eyebrow">
            WORKSPACE
          </div>

          <h1>{workspace.name}</h1>

          <p>
            {workspace.description ||
              "Your SyncSpace workspace"}
          </p>
        </div>

      </div>


      {/* Workspace navigation */}

      <div className="workspace-tabs">

        <button className="workspace-tab active">
          Projects
        </button>

        <button className="workspace-tab">
          Members
        </button>

        <button className="workspace-tab">
          Activity
        </button>

      </div>


      {/* Projects */}

      <section className="workspace-section">

        <div className="section-header">

          <div>
            <h2>Projects</h2>

            <p>
              Projects inside this workspace.
            </p>
          </div>

          <button className="primary-button">
            + New Project
          </button>

        </div>


        {projects.length === 0 ? (

          <div className="panel">
            <div className="empty-state">
              No projects in this workspace yet.
            </div>
          </div>

        ) : (

          <div className="project-grid">

            {projects.map((project) => (

              <div
                className="project-card"
                key={project._id}
              >

                <div className="project-card-top">

                  <div className="project-key">
                    {project.key}
                  </div>

                  <span
                    className={`status-badge ${
                      project.status?.toLowerCase()
                    }`}
                  >
                    {project.status}
                  </span>

                </div>


                <h3>
                  {project.name}
                </h3>


                <p>
                  {project.description ||
                    "No description provided."}
                </p>


                <div className="project-card-footer">
                  View project →
                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
};

export default Workspace;