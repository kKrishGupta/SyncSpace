import { NavLink } from "react-router-dom";
import WorkspaceSelector from "./WorkspaceSelector";
import logo from "../../assests/logo.png";
const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          open ? "sidebar-open" : ""
        }`}
      >

        {/* Header */}
        <div className="sidebar-header">

          <div className="brand">
          <div className="brand-logo">
            <img
              src={logo}
              alt="SyncSpace Logo"
            />
          </div>

          <div className="brand-copy">
            <div className="brand-name">SyncSpace</div>
            <div className="brand-subtitle">Collaboration</div>
          </div>
        </div>

          <button
            className="sidebar-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>

{/* WorkSpace Selector */}
        <WorkspaceSelector />

        {/* Navigation */}
        <nav className="sidebar-nav">

          <NavLink
            to="/dashboard"
            className="sidebar-link"
            onClick={onClose}
          >
            <span>⌂</span>
            <span>Dashboard</span>
          </NavLink>


          <NavLink
            to="/tasks"
            className="sidebar-link"
            onClick={onClose}
          >
            <span>✓</span>
            <span>My Tasks</span>
          </NavLink>


          <div className="sidebar-section">
            WORKSPACE
          </div>


          <NavLink
            to="/projects"
            className="sidebar-link"
            onClick={onClose}
          >
            <span>▦</span>
            <span>Projects</span>
          </NavLink>


          <NavLink
            to="/teams"
            className="sidebar-link"
            onClick={onClose}
          >
            <span>◉</span>
            <span>Teams</span>
          </NavLink>


          <NavLink
            to="/members"
            className="sidebar-link"
            onClick={onClose}
          >
            <span>◎</span>
            <span>Members</span>
          </NavLink>


          <div className="sidebar-spacer" />


          <NavLink
            to="/settings"
            className="sidebar-link"
            onClick={onClose}
          >
            <span>⚙</span>
            <span>Settings</span>
          </NavLink>

        </nav>

      </aside>
    </>
  );
};

export default Sidebar;