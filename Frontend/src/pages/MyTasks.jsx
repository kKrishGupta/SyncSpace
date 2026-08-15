
const MyTasks = () => {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">WORK</div>
          <h1>My Tasks</h1>
          <p>Tasks assigned to you.</p>
        </div>
      </div>

      <div className="panel">
        <div className="empty-state">
          Your tasks will appear here.
        </div>
      </div>
    </div>
  );
};

export default MyTasks;