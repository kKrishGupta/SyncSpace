
const Projects = () => {
  return (
    <div className="page">

      <div className="page-header">
        <div>
          <div className="eyebrow">
            WORKSPACE
          </div>

          <h1>Projects</h1>

          <p>
            Manage projects across your workspace.
          </p>
        </div>

        <button className="primary-button">
          + New Project
        </button>
      </div>

      <div className="panel">
        <div className="empty-state">
          Projects will appear here.
        </div>
      </div>

    </div>
  );
};

export default Projects;