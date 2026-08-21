import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Code2, GitPullRequest, AlertOctagon, CheckCircle2, Users, Activity as ActivityIcon } from "lucide-react";

import { getProjectById } from "../services/projectService";
import KanbanBoard from "../components/kanban/KanbanBoard";
import WorkspaceMembers from "../components/workspace/WorkspaceMembers";
import ActivityFeed from "../components/ActivityFeed";
import CodeReviews from "./CodeReviews";
import BlockersAndDecisions from "../components/project/BlockersAndDecisions";

const ProjectDetail = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getProjectById(id);
        setProject(response.data);
      } catch (err) {
        console.error("Failed to load project:", err);
        setError(err.message || "Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  if (loading) return <div className="page"><div className="project-detail-loading">Loading project...</div></div>;
  if (error || !project) return <div className="page"><div className="project-detail-error"><h2>Unable to load project</h2><p>{error}</p><Link to="/projects" className="secondary-button">← Back to Projects</Link></div></div>;

  return (
    <div className="page project-detail-page">
      {/* Breadcrumb */}
      <div className="project-breadcrumb">
        <Link to="/projects">Projects</Link>
        <span>/</span>
        <span>{project.name}</span>
      </div>

      {/* Project Header with Code Room CTA */}
      <section className="project-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="project-detail-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="project-key-large">{project.key}</span>
            <span className={`status-badge ${project.status?.toLowerCase()}`}>{project.status}</span>
          </div>
          <h1 style={{ marginTop: '6px' }}>{project.name}</h1>
          <p>{project.description || "No description provided."}</p>
        </div>

        <div className="project-header-actions">
          <Link
            to={`/projects/${id}/coderoom`}
            className="primary-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#238636',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 0 12px rgba(35, 134, 54, 0.4)'
            }}
          >
            <Code2 size={18} /> Open Code Room 🟢
          </Link>
        </div>
      </section>

      {/* Project Navigation Tabs */}
      <div className="project-tabs">
        {["Overview", "Kanban Board", "Code Reviews", "Blockers & Decisions", "Members", "Activity"].map((tab) => (
          <button
            key={tab}
            className={`project-tab ${activeTab === tab ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <section className="project-overview-grid">
          {/* Health Stats */}
          <div className="panel" style={{ padding: '16px' }}>
            <div className="panel-header" style={{ marginBottom: '14px' }}>
              <div>
                <div className="panel-eyebrow">DASHBOARD</div>
                <h2>Project Health</h2>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#3fb950' }}>75%</div>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>Task Progress</div>
              </div>
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#58a6ff' }}>1</div>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>Open Review</div>
              </div>
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f85149' }}>0</div>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>Active Blockers</div>
              </div>
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#a371f7' }}>🟢 Live</div>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>Code Room</div>
              </div>
            </div>
          </div>

          {/* Members Overview */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-eyebrow">TEAM</div>
                <h2>Members</h2>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <WorkspaceMembers workspaceId={project.workspaceId._id || project.workspaceId} />
            </div>
          </div>
        </section>
      )}

      {/* Kanban Board Tab */}
      {activeTab === "Kanban Board" && (
        <section className="project-kanban-section">
          <KanbanBoard projectId={id} />
        </section>
      )}

      {/* Code Reviews Tab */}
      {activeTab === "Code Reviews" && (
        <CodeReviews />
      )}

      {/* Blockers & Decisions Tab */}
      {activeTab === "Blockers & Decisions" && (
        <section className="panel">
          <BlockersAndDecisions projectId={id} />
        </section>
      )}

      {/* Members Tab */}
      {activeTab === "Members" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-eyebrow">TEAM</div>
              <h2>Members</h2>
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <WorkspaceMembers workspaceId={project.workspaceId._id || project.workspaceId} />
          </div>
        </section>
      )}

      {/* Activity Tab */}
      {activeTab === "Activity" && (
        <section className="panel project-activity-panel">
          <div className="panel-header">
            <div>
              <div className="panel-eyebrow">PROJECT</div>
              <h2>Activity</h2>
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <ActivityFeed projectId={project._id} />
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectDetail;