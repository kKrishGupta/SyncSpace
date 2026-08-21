import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getWorkspaceById
} from "../services/workspaceService";

import {
  getProjectsByWorkspace,
  createProject
} from "../services/projectService";

import ActivityFeed from "../components/ActivityFeed";
import WorkspaceMembers from "../components/workspace/WorkspaceMembers";
import CreateProjectModal from "../features/projects/CreateProjectModal";
import ProjectCard from "../features/projects/ProjectCard";

const Workspace = () => {
  const { id } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("projects");
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateProject = async (projectData) => {
    try {
      setCreating(true);
      const response = await createProject(id, projectData);
      const newProject = response.data;
      if (!newProject._id && newProject.id) {
        newProject._id = newProject.id;
      }
      setProjects((previous) => [newProject, ...previous]);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err?.data?.message || err?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

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

        <button 
          className={`workspace-tab ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>

        <button 
          className={`workspace-tab ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>

        <button 
          className={`workspace-tab ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Activity
        </button>

      </div>


      {/* Projects */}

      {activeTab === "projects" && (
        <section className="workspace-section">
          <div className="section-header">
            <div>
              <h2>Projects</h2>
              <p>Projects inside this workspace.</p>
            </div>
            <button className="primary-button" onClick={() => setModalOpen(true)}>+ New Project</button>
          </div>

          {projects.length === 0 ? (
            <div className="panel">
              <div className="empty-state">No projects in this workspace yet.</div>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "members" && (
        <section className="workspace-section">
          <div className="section-header">
            <div>
              <h2>Members</h2>
              <p>People in this workspace.</p>
            </div>
          </div>
          <WorkspaceMembers workspaceId={workspace._id} />
        </section>
      )}

      {activeTab === "activity" && (
        <section className="workspace-section">
          <div className="section-header">
            <div>
              <h2>Workspace Activity</h2>
              <p>Recent events across all projects.</p>
            </div>
          </div>
          <ActivityFeed workspaceId={workspace._id} />
        </section>
      )}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateProject}
        loading={creating}
      />

    </div>
  );
};

export default Workspace;