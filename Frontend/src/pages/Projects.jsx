import { useEffect, useMemo, useState } from "react";

import ProjectCard from "../features/projects/ProjectCard";
import CreateProjectModal from "../features/projects/CreateProjectModal";

import {
  getProjectsByWorkspace,
  createProject
} from "../services/projectService";

import {
  getStoredWorkspaceId
} from "../utils/workspaceStorage";

const Projects = () => {

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] =
    useState(false);


  const workspaceId =
    getStoredWorkspaceId();


  useEffect(() => {

    const loadProjects = async () => {

      if (!workspaceId) {
        setError(
          "No workspace selected."
        );

        setLoading(false);
        return;
      }

      try {

        setLoading(true);
        setError("");

        const response =
          await getProjectsByWorkspace(
            workspaceId
          );

        setProjects(
          response.data || []
        );

      } catch (error) {

        setError(
          error.message ||
          "Failed to load projects."
        );

      } finally {

        setLoading(false);

      }
    };

    loadProjects();

  }, [workspaceId]);


  const filteredProjects = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) => {

      return (
        project.name
          ?.toLowerCase()
          .includes(query) ||

        project.key
          ?.toLowerCase()
          .includes(query) ||

        project.description
          ?.toLowerCase()
          .includes(query)
      );

    });

  }, [projects, search]);


  const handleCreateProject = async (
    projectData
  ) => {

    if (!workspaceId) {
      throw new Error(
        "No workspace selected."
      );
    }

    try {

      setCreating(true);

      const response =
        await createProject(
          workspaceId,
          projectData
        );

      const newProject =
        response.data;

      setProjects((previous) => [
        newProject,
        ...previous
      ]);

      setModalOpen(false);

    } finally {

      setCreating(false);

    }
  };


  return (
    <div className="page">

      {/* Header */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            WORKSPACE
          </div>

          <h1>
            Projects
          </h1>

          <p>
            Manage projects across your
            current workspace.
          </p>

        </div>


        <button
          className="primary-button"
          onClick={() =>
            setModalOpen(true)
          }
        >
          + New Project
        </button>

      </div>


      {/* Search */}

      <div className="projects-toolbar">

        <div className="project-search">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              className="search-clear"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>


        <div className="project-count">
          {filteredProjects.length}{" "}
          {filteredProjects.length === 1
            ? "project"
            : "projects"}
        </div>

      </div>


      {/* Error */}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}


      {/* Loading */}

      {loading && (
        <div className="panel">
          <div className="loading-state">
            Loading projects...
          </div>
        </div>
      )}


      {/* Empty */}

      {!loading &&
        !error &&
        filteredProjects.length === 0 && (

          <div className="panel">

            <div className="empty-state">

              {search
                ? "No projects match your search."
                : "No projects in this workspace yet."}

            </div>

          </div>

        )}


      {/* Projects */}

      {!loading &&
        filteredProjects.length > 0 && (

          <div className="project-grid">

            {filteredProjects.map(
              (project) => (

                <ProjectCard
                  key={project._id}
                  project={project}
                />

              )
            )}

          </div>

        )}


      {/* Create Modal */}

      <CreateProjectModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onCreate={
          handleCreateProject
        }
        loading={creating}
      />

    </div>
  );
};

export default Projects;