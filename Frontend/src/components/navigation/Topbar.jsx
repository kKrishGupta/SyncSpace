
const Topbar = ({ onMenuClick }) => {
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

          <div className="user-avatar">
            K
          </div>

          <div className="user-info">

            <span className="user-name">
              Krish Gupta
            </span>

            <span className="user-role">
              Developer
            </span>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Topbar;