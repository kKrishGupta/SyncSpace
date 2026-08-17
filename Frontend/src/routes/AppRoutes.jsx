import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import ProjectDetail from "../pages/ProjectDetail";
import Dashboard from "../pages/Dashboard";
import MyTasks from "../pages/MyTasks";
import Projects from "../pages/Projects";
import Teams from "../pages/Teams";
import Members from "../pages/Members";
import Settings from "../pages/Settings";
import Workspace from "../pages/Workspace";
const AppRoutes = () => {
  return (
    <Routes>

      <Route element={<AppLayout />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/tasks"
          element={<MyTasks />}
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/teams"
          element={<Teams />}
        />

        <Route
          path="/members"
          element={<Members />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
        <Route
          path="/workspaces/:id"
          element={<Workspace />}
        />

        <Route
          path="/projects/:id"
          element={<ProjectDetail />}
        />

      </Route>


      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;