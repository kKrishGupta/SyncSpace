import {
  useState
} from "react";

import {
  Outlet
} from "react-router-dom";

import Sidebar
  from "../components/navigation/Sidebar";

import Topbar
  from "../components/navigation/Topbar";


const AppLayout = () => {

  const [
    sidebarOpen,
    setSidebarOpen
  ] = useState(false);


  return (
    <div className="app-layout">

      <Topbar
        onMenuClick={() =>
          setSidebarOpen(
            (previous) =>
              !previous
          )
        }
      />


      <div className="app-body">

        <Sidebar
          open={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />


        <main className="main-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
};


export default AppLayout;