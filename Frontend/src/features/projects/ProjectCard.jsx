import { useNavigate } from "react-router-dom";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <button
      className="project-card"
      onClick={handleClick}
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

      <div className="project-card-content">

        <h3>
          {project.name}
        </h3>

        <p>
          {project.description ||
            "No description provided."}
        </p>

      </div>

      <div className="project-card-footer">
        Open project
        <span>→</span>
      </div>

    </button>
  );
};

export default ProjectCard;