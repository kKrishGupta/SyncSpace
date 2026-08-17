import React from "react";

import {
  useDroppable
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import TaskCard from "./TaskCard";


const COLUMN_CONFIG = {

  TODO: {
    title: "TODO",
    className: "todo"
  },

  IN_PROGRESS: {
    title: "IN PROGRESS",
    className: "in-progress"
  },

  IN_REVIEW: {
    title: "IN REVIEW",
    className: "in-review"
  },

  DONE: {
    title: "DONE",
    className: "done"
  }

};


const KanbanColumn = ({
  status,
  tasks,
  onAddTask,
  onTaskClick
}) => {

  const config =
    COLUMN_CONFIG[status];


  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: status,

    data: {
      type: "column",
      status
    }
  });


  return (
    <section
      ref={setNodeRef}
      className={`kanban-column ${
        isOver
          ? "is-over"
          : ""
      }`}
    >

      {/* COLUMN HEADER */}

      <div className="kanban-column-header">

        <div className="kanban-column-heading">

          <span
            className={`kanban-status-dot ${config.className}`}
          />

          <h3 className="kanban-column-title">
            {config.title}
          </h3>

          <span className="kanban-task-count">
            {tasks.length}
          </span>

        </div>


        <button
          type="button"
          className="kanban-column-add-icon"
          onClick={() =>
            onAddTask?.(status)
          }
        >
          +
        </button>

      </div>


      {/* TASK AREA */}

      <div className="kanban-column-body">

        <SortableContext
          items={tasks.map(
            (task) => task._id
          )}
          strategy={
            verticalListSortingStrategy
          }
        >

          <div className="kanban-task-list">

            {tasks.length > 0 ? (

              tasks.map(
                (task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={
                      onTaskClick
                    }
                  />
                )
              )

            ) : (

              <div className="kanban-empty">

                <div className="kanban-empty-content">

                  <div className="kanban-empty-icon">
                    +
                  </div>

                  <p className="kanban-empty-text">
                    Drop tasks here
                  </p>

                </div>

              </div>

            )}

          </div>

        </SortableContext>

      </div>


      {/* FOOTER */}

      <div className="kanban-column-footer">

        <button
          type="button"
          className="kanban-add-task"
          onClick={() =>
            onAddTask?.(status)
          }
        >
          + Add task
        </button>

      </div>

    </section>
  );
};


export default KanbanColumn;