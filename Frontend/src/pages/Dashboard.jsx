const Dashboard = () => {
  return (
    <div className="page">

      <div className="page-header">

        <div>
          <div className="eyebrow">
            OVERVIEW
          </div>

          <h1>Dashboard</h1>

          <p>
            Welcome back. Here's what's happening
            across your workspace.
          </p>
        </div>

      </div>


      <div className="stats-grid">

        <div className="stat-card">
          <span>Active Projects</span>
          <strong>3</strong>
        </div>

        <div className="stat-card">
          <span>Open Tasks</span>
          <strong>12</strong>
        </div>

        <div className="stat-card">
          <span>Team Members</span>
          <strong>8</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>24</strong>
        </div>

      </div>


      <div className="dashboard-grid">

        <div className="panel">
          <div className="panel-header">
            <h2>Recent Projects</h2>
          </div>

          <div className="empty-state">
            No recent projects.
          </div>
        </div>


        <div className="panel">
          <div className="panel-header">
            <h2>My Tasks</h2>
          </div>

          <div className="empty-state">
            No tasks assigned yet.
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;