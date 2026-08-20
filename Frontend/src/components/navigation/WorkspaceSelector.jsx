import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getWorkspaces,
  createWorkspace
} from "../../services/workspaceService";
import useWebSocket from "../../hooks/useWebSocket";
import {
  getStoredWorkspaceId,
  setStoredWorkspaceId,
  removeStoredWorkspaceId
} from "../../utils/workspaceStorage";
import CreateWorkspaceModal from "./CreateWorkspaceModal";

const WorkspaceSelector = () => {
  const {
  joinWorkspace,
  leaveWorkspace
} = useWebSocket();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateWorkspace = async (workspaceData) => {
    try {
      setCreating(true);
      const response = await createWorkspace(workspaceData);
      const newWorkspace = response.data;
      if (!newWorkspace._id && newWorkspace.id) {
        newWorkspace._id = newWorkspace.id;
      }
      setWorkspaces([...workspaces, newWorkspace]);
      handleWorkspaceSelect(newWorkspace);
      setCreateModalOpen(false);
    } catch (error) {
      throw error;
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const response = await getWorkspaces();

        const workspaceList = response.data || [];

        setWorkspaces(workspaceList);

        if (workspaceList.length === 0) {
          removeStoredWorkspaceId();
          setSelectedWorkspace(null);
          return;
        }

        const storedWorkspaceId =
          getStoredWorkspaceId();

        let workspace = workspaceList.find(
          (item) =>
            item._id === storedWorkspaceId
        );

        if (!workspace) {
          workspace = workspaceList[0];

          setStoredWorkspaceId(
            workspace._id
          );
        }

        setSelectedWorkspace(workspace);

      } catch (error) {
        console.error(
          "Failed to load workspaces:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, []);

  const handleWorkspaceSelect = (workspace) => {
  if (!workspace?._id) {
    return;
  }

  const previousWorkspaceId =
    selectedWorkspace?._id;

  if (
    previousWorkspaceId &&
    previousWorkspaceId !== workspace._id
  ) {
    leaveWorkspace(
      previousWorkspaceId
    );
  }

  setSelectedWorkspace(workspace);

  setStoredWorkspaceId(
    workspace._id
  );

  setOpen(false);

  joinWorkspace(
    workspace._id
  );

  navigate(
    `/workspaces/${workspace._id}`
  );
};

  if (loading) {
    return (
      <div className="workspace-selector loading">
        Loading workspace...
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="workspace-selector-wrapper">
        <button
          className="workspace-selector empty"
          onClick={() => setCreateModalOpen(true)}
          style={{ cursor: "pointer", border: "1px dashed var(--border-color)", background: "transparent" }}
        >
          <span>+ Create Workspace</span>
        </button>

        <CreateWorkspaceModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateWorkspace}
          loading={creating}
        />
      </div>
    );
  }

  return (
    <div className="workspace-selector-wrapper">

      <button
        className="workspace-selector"
        onClick={() => setOpen(!open)}
      >

        <div className="workspace-selector-info">

          <div className="workspace-selector-icon">
            {selectedWorkspace?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div className="workspace-selector-text">

            <span className="workspace-selector-name">
              {selectedWorkspace?.name}
            </span>

            <span className="workspace-selector-description">
              {selectedWorkspace?.description ||
                "Workspace"}
            </span>

          </div>

        </div>

        <span className="workspace-selector-arrow">
          {open ? "⌃" : "⌄"}
        </span>

      </button>


      {open && (
        <div className="workspace-dropdown">

          <div className="workspace-dropdown-label">
            YOUR WORKSPACES
          </div>

          {workspaces.map((workspace) => (

            <button
              key={workspace._id}
              className={`workspace-option ${
                selectedWorkspace?._id === workspace._id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handleWorkspaceSelect(workspace)
              }
            >

              <div className="workspace-option-icon">
                {workspace.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div className="workspace-option-info">

                <span>
                  {workspace.name}
                </span>

                <small>
                  {workspace.description ||
                    "Workspace"}
                </small>

              </div>

            </button>

          ))}

          <div className="workspace-dropdown-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setOpen(false);
                setCreateModalOpen(true);
              }}
              style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}
            >
              + Create Workspace
            </button>
          </div>

        </div>
      )}

      <CreateWorkspaceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateWorkspace}
        loading={creating}
      />

    </div>
  );
};

export default WorkspaceSelector;