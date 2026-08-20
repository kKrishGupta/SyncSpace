import React, {
  useEffect,
  useState
} from "react";
import CommentSection from "../comments/CommentSection";
import {
  getTaskById
} from "../../services/taskService";

import "./TaskDetailDrawer.css";
import { usePresence} from "../../context/PresenceContext";
import { useAuth } from "../../context/AuthContext";
import FileUpload from "../files/FileUpload";
import FileList from "../files/FileList";

const PRIORITY_CONFIG = {
  LOW: {
    label: "LOW",
    className: "low"
  },

  MEDIUM: {
    label: "MEDIUM",
    className: "medium"
  },

  HIGH: {
    label: "HIGH",
    className: "high"
  },

  URGENT: {
    label: "URGENT",
    className: "urgent"
  }
};


const STATUS_LABELS = {
  TODO: "TODO",

  IN_PROGRESS:
    "IN PROGRESS",

  IN_REVIEW:
    "IN REVIEW",

  DONE: "DONE"
};


const getInitials = (name) => {

  if (!name) {
    return "?";
  }

  const parts =
    name.trim().split(/\s+/);

  if (parts.length === 1) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();

  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};


const formatDate = (date) => {

  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
};


const TaskDetailDrawer = ({
  task,
  isOpen,
  onClose
}) => {

  const {isOnline} = usePresence();
  const { user: currentUser } = useAuth();

  const [
    taskDetails,
    setTaskDetails
  ] = useState(task);


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");

  const [refreshFiles, setRefreshFiles] = useState(0);


  /*
   * =====================================================
   * Load authoritative task
   * =====================================================
   *
   * The task clicked from Kanban is enough
   * to open the drawer immediately.
   *
   * Then we fetch the latest version from
   * the backend.
   */

  useEffect(() => {

    if (!isOpen || !task?._id) {
      return;
    }


    setTaskDetails(task);
    setError("");


    const loadTask = async () => {

      try {

        setLoading(true);


        const response =
          await getTaskById(
            task._id
          );


        if (response?.data) {

          setTaskDetails(
            response.data
          );

        }

      } catch (err) {

        console.error(
          "Failed to load task details:",
          err
        );


        /*
         * Keep displaying the task
         * we already had.
         */

        setError(
          "Unable to refresh task details."
        );

      } finally {

        setLoading(false);

      }

    };


    loadTask();

  }, [
    isOpen,
    task
  ]);


  /*
   * =====================================================
   * Escape key
   * =====================================================
   */

  useEffect(() => {

    if (!isOpen) {
      return;
    }


    const handleKeyDown = (
      event
    ) => {

      if (
        event.key === "Escape"
      ) {
        onClose();
      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    isOpen,
    onClose
  ]);


  if (!isOpen || !taskDetails) {
    return null;
  }


  const priority =
    PRIORITY_CONFIG[
      taskDetails.priority
    ] ||
    PRIORITY_CONFIG.MEDIUM;


  const status =
    STATUS_LABELS[
      taskDetails.status
    ] ||
    taskDetails.status ||
    "—";


  /*
   * Support both:
   *
   * task.assignee.name
   * task.assigneeName
   * task.assigneeId
   */

  const assigneeName =
    taskDetails.assignee?.name ||
    taskDetails.assigneeName ||
    (
      taskDetails.assigneeId
        ? "Assigned"
        : "Unassigned"
    );


  const reporterName =
    taskDetails.reporter?.name ||
    taskDetails.reporterName ||
    (
      taskDetails.reporterId
        ? "Reporter"
        : "—"
    );


  return (
    <>

      {/* =================================================
          BACKDROP
      ================================================= */}

      <div
        className="task-drawer-backdrop"
        onMouseDown={(event) => {

          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }

        }}
      />


      {/* =================================================
          DRAWER
      ================================================= */}

      <aside
        className="task-detail-drawer"
        aria-label="Task details"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="task-drawer-header">

          <div className="task-drawer-header-left">

            <span className="task-drawer-key">
              {taskDetails.key ||
                taskDetails.taskKey ||
                taskDetails.code ||
                "TASK"}
            </span>

            {loading && (
              <span className="task-drawer-loading">
                Updating...
              </span>
            )}

          </div>


          <button
            type="button"
            className="task-drawer-close"
            onClick={onClose}
            aria-label="Close task details"
          >
            ×
          </button>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="task-drawer-content">

          {/* TITLE */}

          <h1 className="task-drawer-title">
            {taskDetails.title}
          </h1>


          {/* META */}

          <div className="task-drawer-meta">

            <div className="task-drawer-meta-row">

              <span className="task-drawer-meta-label">
                Status
              </span>

              <span
                className={`task-drawer-status ${taskDetails.status
                  ?.toLowerCase()
                  .replace(
                    "_",
                    "-"
                  )}`}
              >
                {status}
              </span>

            </div>


            <div className="task-drawer-meta-row">

              <span className="task-drawer-meta-label">
                Priority
              </span>

              <span
                className={`task-drawer-priority ${priority.className}`}
              >
                {priority.label}
              </span>

            </div>


            <div className="task-drawer-meta-row">

              <span className="task-drawer-meta-label">
                Assignee
              </span>

              <div className="task-drawer-person">

  <span
    className={`presence-dot ${
      isOnline(
        taskDetails.assigneeId
      )
        ? "online"
        : "offline"
    }`}
  />

  {taskDetails.assigneeId && (
    <span className="task-drawer-avatar">
      {getInitials(
        assigneeName
      )}
    </span>
  )}

  <span>
    {assigneeName}
  </span>

              </div>

            </div>


            <div className="task-drawer-meta-row">

              <span className="task-drawer-meta-label">
                Reporter
              </span>

              <div className="task-drawer-person">

                {taskDetails.reporterId && (
                  <span className="task-drawer-avatar">
                    {getInitials(
                      reporterName
                    )}
                  </span>
                )}

                <span>
                  {reporterName}
                </span>

              </div>

            </div>


            <div className="task-drawer-meta-row">

              <span className="task-drawer-meta-label">
                Due date
              </span>

              <span className="task-drawer-value">
                {formatDate(
                  taskDetails.dueDate
                )}
              </span>

            </div>

          </div>


          {/* DESCRIPTION */}

          <section className="task-drawer-section">

            <h2 className="task-drawer-section-title">
              Description
            </h2>


            <div className="task-drawer-description">

              {taskDetails.description ? (
                <p>
                  {taskDetails.description}
                </p>
              ) : (
                <p className="task-drawer-empty">
                  No description added.
                </p>
              )}

            </div>

          </section>


{/* COMMENTS */}
  <CommentSection taskId={taskDetails._id} projectId={taskDetails.projectId} 
  workspaceId={taskDetails.workspaceId} currentUser={currentUser} />
  
          {/* LABELS */}

          <section className="task-drawer-section">

            <h2 className="task-drawer-section-title">
              Labels
            </h2>


            {taskDetails.labels?.length ? (

              <div className="task-drawer-labels">

                {taskDetails.labels.map(
                  (label) => (

                    <span
                      key={label}
                      className="task-drawer-label"
                    >
                      {label}
                    </span>

                  )
                )}

              </div>

            ) : (

              <span className="task-drawer-empty">
                No labels
              </span>

            )}

          </section>


        
          {/* ATTACHMENTS */}
          <section className="task-drawer-section">
            <h2 className="task-drawer-section-title">
              Attachments
            </h2>
            <FileUpload 
              workspaceId={taskDetails.workspaceId} 
              projectId={taskDetails.projectId} 
              taskId={taskDetails._id} 
              onUploadComplete={() => setRefreshFiles(prev => prev + 1)}
            />
            <FileList 
              taskId={taskDetails._id}
              refreshTrigger={refreshFiles}
            />
          </section>

        </div>

      </aside>

    </>
  );
};


export default TaskDetailDrawer;