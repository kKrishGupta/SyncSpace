import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GlobalSearch from "./GlobalSearch";
import NotificationDropdown from "./NotificationDropdown";

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { workspaceId } = useParams();
  
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const displayName = user?.name || "User";
  const role = "Member"; // You can make this dynamic based on workspace later

  return (
    <header className="topbar">

      <div className="topbar-left">

        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
        >
          ☰
        </button>

        <div className="mobile-brand">
          SyncSpace
        </div>

      </div>


      <div className="topbar-right flex items-center gap-2 sm:gap-4">

        {/* Search */}
        <GlobalSearch workspaceId={workspaceId} />

        {/* Notifications */}
        <NotificationDropdown />


        {/* User */}
        <div className="user-menu" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>

          <div className="user-avatar" style={user?.avatar ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover' } : {}}>
            {!user?.avatar && initial}
          </div>

          <div className="user-info">
            <span className="user-name">
              {displayName}
            </span>
            <span className="user-role">
              {role}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="user-dropdown">
              <Link to="/settings" className="dropdown-item">
                <span>⚙</span> Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={logout} className="dropdown-item text-red">
                <span>⎋</span> Logout
              </button>
            </div>
          )}

        </div>

      </div>

    </header>
  );
};

export default Topbar;