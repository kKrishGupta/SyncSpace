import React from "react";

import {
  useSortable
} from "@dnd-kit/sortable";

import {
  CSS
} from "@dnd-kit/utilities";


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


const TaskCard = ({
  task,
  onClick
}) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task._id,

    data: {
      type: "task",
      task
    }
  });


  const style = {
    transform:
      CSS.Transform.toString(transform),

    transition
  };


  const priority =
    PRIORITY_CONFIG[
      task.priority
    ] ||
    PRIORITY_CONFIG.MEDIUM;


  /*
   * Task key
   *
   * Preferred:
   * task.key
   *
   * Example:
   * BACK-12
   */

  const taskKey =
    task.key ||
    task.taskKey ||
    task.code ||
    "TASK";


  /*
   * Assignee
   *
   * Later this should come from
   * populated user information.
   */

  const assigneeName =
    task.assignee?.name ||
    task.assigneeName ||
    (
      task.assigneeId
        ? "Assigned"
        : null
    );


  /*
   * Assignee initials
   */

  const getInitials = (name) => {

    if (!name) {
      return "?";
    }

    const parts =
      name
        .trim()
        .split(/\s+/);

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


  return (
    <article
      ref={setNodeRef}
      style={style}

      {...attributes}
      {...listeners}

      onClick={() =>
        onClick?.(task)
      }

      className={`kanban-task-card ${
        isDragging
          ? "is-dragging"
          : ""
      }`}
    >

      {/* =================================================
          TOP
      ================================================= */}

      <div className="kanban-task-top">

        <span className="kanban-task-key">
          {taskKey}
        </span>


        <span className="kanban-task-drag-handle">
          ⋮⋮
        </span>

      </div>


      {/* =================================================
          TITLE
      ================================================= */}

      <h3 className="kanban-task-title">

        {task.title}

      </h3>


      {/* =================================================
          PRIORITY + LABELS
      ================================================= */}

      <div className="kanban-task-meta">

        <span
          className={`kanban-priority ${priority.className}`}
        >
          {priority.label}
        </span>


        {task.labels?.map(
          (label) => (

            <span
              key={label}
              className="kanban-label"
            >
              {label}
            </span>

          )
        )}

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="kanban-task-footer">

        {assigneeName ? (

          <div className="kanban-assignee-wrapper">

            <div
              className="kanban-assignee"
              title={assigneeName}
            >
              {getInitials(
                assigneeName
              )}
            </div>

            <span className="kanban-assignee-name">
              {assigneeName}
            </span>

          </div>

        ) : (

          <span className="kanban-unassigned">
            Unassigned
          </span>

        )}

      </div>

    </article>
  );
};


export default TaskCard;