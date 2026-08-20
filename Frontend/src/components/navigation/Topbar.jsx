import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  
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


      <div className="topbar-right">

        {/* Search */}
        <button className="search-button">
          <span>⌕</span>
          <span>Search</span>
          <kbd>Ctrl K</kbd>
        </button>


        {/* Notifications */}
        <button className="icon-button">
          ♢
        </button>


        {/* User */}
        <div className="user-menu">

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

        </div>

      </div>

    </header>
  );
};

export default Topbar;