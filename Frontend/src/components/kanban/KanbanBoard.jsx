import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import CreateTaskModal from "../tasks/CreateTaskModal";
import TaskDetailDrawer from "../drawers/TaskDetailDrawer";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

import {
  getTasksByProject,
  updateTaskStatus
} from "../../services/taskService";

import "./kanban.css";


const STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE"
];


const KanbanBoard = ({
  projectId,
  onAddTask,
  onTaskClick
}) => {

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTask, setActiveTask] =
    useState(null);

  const [savingTaskId, setSavingTaskId] =
    useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [createTaskStatus, setCreateTaskStatus] = useState("TODO");

  const[selectedTask, setSelectedTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );


  const loadTasks = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getTasksByProject(projectId);

      setTasks(
        response?.data || []
      );

    } catch (err) {

      console.error(
        "Failed to load tasks:",
        err
      );

      setError(
        err.message ||
        "Failed to load tasks."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    if (!projectId) {
      return;
    }

    loadTasks();

  }, [projectId]);


  const groupedTasks = useMemo(() => {

    return {
      TODO: tasks.filter(
        (task) =>
          task.status === "TODO"
      ),

      IN_PROGRESS: tasks.filter(
        (task) =>
          task.status === "IN_PROGRESS"
      ),

      IN_REVIEW: tasks.filter(
        (task) =>
          task.status === "IN_REVIEW"
      ),

      DONE: tasks.filter(
        (task) =>
          task.status === "DONE"
      )
    };

  }, [tasks]);


  const findTask = (taskId) => {

    return tasks.find(
      (task) =>
        task._id === taskId
    );
  };

  const handleAddTask = (
  status
) => {

  setCreateTaskStatus(
    status || "TODO"
  );

  setCreateModalOpen(true);
};

const handleTaskCreated = (createdTask) => {
  setTasks((currentTasks) => [
    ...currentTasks,
    createdTask
  ]);
};

const handleTaskClick = (
  task
) => {

  setSelectedTask(
    task
  );

};

  const handleDragStart = ({
    active
  }) => {

    const task =
      findTask(active.id);

    setActiveTask(
      task || null
    );
  };


  const handleDragCancel = () => {

    setActiveTask(null);

  };


  const handleDragEnd = async ({
  active,
  over
}) => {

  /*
   * Drag operation is finished.
   */

  setActiveTask(null);


  /*
   * No valid drop target.
   */

  if (!over) {
    return;
  }


  /*
   * Find the task being dragged.
   */

  const task =
    findTask(active.id);


  if (!task) {
    return;
  }


  /*
   * Determine the new status.
   *
   * The task can be dropped:
   *
   * 1. Directly on a column
   * 2. On another task
   */

  let newStatus = null;


  if (
    STATUSES.includes(over.id)
  ) {

    newStatus = over.id;

  } else {

    const overTask =
      findTask(over.id);

    if (overTask) {
      newStatus =
        overTask.status;
    }

  }


  /*
   * Invalid destination.
   */

  if (!newStatus) {
    return;
  }


  /*
   * Dropped inside the same column.
   *
   * Nothing needs to be saved.
   */

  if (
    task.status === newStatus
  ) {
    return;
  }


  /*
   * IMPORTANT:
   *
   * Save the complete previous state.
   *
   * If the API fails, we restore this.
   */

  const previousTasks =
    [...tasks];


  /*
   * =====================================================
   * OPTIMISTIC UI
   * =====================================================
   *
   * Immediately move the card.
   *
   * User doesn't have to wait for MongoDB.
   */

  setTasks(
    (currentTasks) =>
      currentTasks.map(
        (item) =>
          item._id === task._id
            ? {
                ...item,
                status: newStatus
              }
            : item
      )
  );


  /*
   * Show "Saving..." indicator.
   */

  setSavingTaskId(
    task._id
  );


  try {

    /*
     * ===================================================
     * SERVER UPDATE
     * ===================================================
     *
     * Send the CURRENT version.
     *
     * Example:
     *
     * status  = IN_PROGRESS
     * version = 4
     *
     * Backend will only update if
     * database version is also 4.
     */

    const response =
      await updateTaskStatus(
        task._id,
        newStatus,
        task.version
      );


    /*
     * Backend must return
     * the updated task.
     */

    const updatedTask =
      response?.data;


    if (!updatedTask) {

      throw new Error(
        "Server did not return the updated task."
      );

    }


    /*
     * ===================================================
     * AUTHORITATIVE SERVER STATE
     * ===================================================
     *
     * IMPORTANT:
     *
     * Do NOT manually do:
     *
     * version: task.version + 1
     *
     * Instead use the task returned
     * by the backend.
     *
     * Backend owns the version.
     */

    setTasks(
      (currentTasks) =>
        currentTasks.map(
          (item) =>
            item._id ===
            updatedTask._id
              ? updatedTask
              : item
        )
    );


  } catch (err) {

    console.error(
      "Task status update failed:",
      err
    );


    /*
     * ===================================================
     * ROLLBACK
     * ===================================================
     *
     * API failed.
     *
     * Restore the board to the state
     * before the drag.
     */

    setTasks(
      previousTasks
    );


    /*
     * ===================================================
     * VERSION CONFLICT
     * ===================================================
     *
     * Another user changed the task
     * before we could save our change.
     */

    if (
      err.status === 409
    ) {

      setError(
        "This task was updated by another user. Refreshing..."
      );


      /*
       * Get authoritative state
       * from MongoDB.
       */

      await loadTasks();

    } else {

      setError(
        err.message ||
        "Failed to update task status."
      );

    }

  } finally {

    setSavingTaskId(null);

  }

};


  /*
   * Loading UI
   */

  if (loading) {

    return (
      <div className="kanban-loading">

        {STATUSES.map(
          (status) => (
            <div
              key={status}
              className="kanban-loading-column"
            />
          )
        )}

      </div>
    );

  }


  return (
    <div className="kanban-wrapper">

      {/* HEADER */}

      <div className="kanban-header">

        <div className="kanban-header-content">

          <h2 className="kanban-title">
            Kanban Board
          </h2>

          <p className="kanban-description">
            Manage and track your project tasks.
          </p>

        </div>


        <div className="kanban-actions">

          {savingTaskId && (
            <span className="kanban-saving">
              Saving...
            </span>
          )}


          <button
            type="button"
            className="kanban-refresh"
            onClick={loadTasks}
          >
            Refresh
          </button>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div className="kanban-error">

          <p className="kanban-error-message">
            {error}
          </p>

          <button
            type="button"
            className="kanban-error-dismiss"
            onClick={() =>
              setError("")
            }
          >
            Dismiss
          </button>

        </div>

      )}


      {/* BOARD */}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >

        <div className="kanban-board">

          {STATUSES.map(
            (status) => (

              <KanbanColumn
                key={status}
                status={status}
                tasks={
                  groupedTasks[status]
                }
                onAddTask={
                  handleAddTask
                }
                onTaskClick={
                  handleTaskClick
                }
              />

            )
          )}

        </div>


        <DragOverlay>

          {activeTask ? (

            <div className="kanban-drag-overlay">

              <TaskCard
                task={activeTask}
              />

            </div>

          ) : null}

        </DragOverlay>

      </DndContext>

      <CreateTaskModal
        isOpen={
          createModalOpen
        }

        projectId={
          projectId
        }

        initialStatus={
          createTaskStatus
        }

        onClose={() =>
          setCreateModalOpen(false)
        }

        onCreated={
          handleTaskCreated
        }
      />
      <TaskDetailDrawer
        task={
          selectedTask
        }

        isOpen={
          Boolean(selectedTask)
        }

        onClose={() =>
          setSelectedTask(null)
        }
      />

    </div>
  );
};


export default KanbanBoard;