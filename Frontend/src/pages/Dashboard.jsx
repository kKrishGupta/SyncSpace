import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getWorkspaces
} from "../services/workspaceService";

import {
  getProjectsByWorkspace
} from "../services/projectService";

import {
  getStoredWorkspaceId,
  setStoredWorkspaceId
} from "../utils/workspaceStorage";

const Dashboard = () => {

  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);

  const [selectedWorkspace, setSelectedWorkspace] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await getWorkspaces();

        const workspaceList =
          response.data || [];

        setWorkspaces(workspaceList);

        if (workspaceList.length === 0) {
          return;
        }

        const storedId =
          getStoredWorkspaceId();

        let workspace =
          workspaceList.find(
            (item) =>
              item._id === storedId
          );

        if (!workspace) {
          workspace = workspaceList[0];

          setStoredWorkspaceId(
            workspace._id
          );
        }

        setSelectedWorkspace(workspace);

        const projectsResponse =
          await getProjectsByWorkspace(
            workspace._id
          );

        setProjects(
          projectsResponse.data || []
        );

      } catch (err) {

        setError(
          err.message ||
          "Failed to load dashboard"
        );

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);


  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          Loading dashboard...
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


  return (

    <div className="page">

      {/* Greeting */}

      <div className="dashboard-welcome">

        <div>

          <div className="eyebrow">
            OVERVIEW
          </div>

          <h1>
            Good morning, Krish 👋
          </h1>

          <p>
            Here's what's happening
            across your workspace.
          </p>

        </div>

      </div>


      {/* Workspace */}

      {selectedWorkspace && (

        <section className="workspace-summary">

          <div className="workspace-summary-header">

            <div>

              <span className="eyebrow">
                CURRENT WORKSPACE
              </span>

              <h2>
                {selectedWorkspace.name}
              </h2>

              <p>
                {selectedWorkspace.description}
              </p>

            </div>


            <Link
              to={`/workspaces/${selectedWorkspace._id}`}
              className="secondary-button"
            >
              Open Workspace
            </Link>

          </div>

        </section>

      )}


      {/* Stats */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Active Projects</span>
          <strong>{projects.length}</strong>
        </div>

        <div className="stat-card">
          <span>Open Tasks</span>
          <strong>0</strong>
        </div>

        <div className="stat-card">
          <span>Team Members</span>
          <strong>0</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>0</strong>
        </div>

      </div>


      {/* Projects */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>Projects</h2>

            <p>
              Projects in your current workspace.
            </p>
          </div>

          {selectedWorkspace && (
            <Link
              to={`/workspaces/${selectedWorkspace._id}`}
              className="secondary-button"
            >
              View all
            </Link>
          )}

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

                  <span className="status-badge">
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

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
};

export default Dashboard;