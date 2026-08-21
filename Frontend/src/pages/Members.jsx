import { getStoredWorkspaceId } from "../utils/workspaceStorage";
import WorkspaceMembers from "../components/workspace/WorkspaceMembers";
import { Link } from "react-router-dom";

const Members = () => {
  const workspaceId = getStoredWorkspaceId();

  if (!workspaceId) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <div className="eyebrow">WORKSPACE</div>
            <h1>Members</h1>
          </div>
        </div>
        <div className="panel">
          <div className="empty-state">
            No workspace selected. Please select or create a workspace first.
            <br/><br/>
            <Link to="/dashboard" className="primary-button">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">WORKSPACE</div>
          <h1>Members</h1>
          <p>Manage workspace members, roles, and access.</p>
        </div>
      </div>

      <WorkspaceMembers workspaceId={workspaceId} />
    </div>
  );
};

export default Members;