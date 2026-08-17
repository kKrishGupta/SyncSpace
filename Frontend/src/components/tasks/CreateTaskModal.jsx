import React, {
  useEffect,
  useState
} from "react";

import {
  createTask
} from "../../services/taskService";

import "./CreateTaskModal.css";


const PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT"
];


const CreateTaskModal = ({
  isOpen,
  projectId,
  initialStatus = "TODO",
  onClose,
  onCreated
}) => {

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("MEDIUM");

  const [assigneeId, setAssigneeId] =
    useState("");

  const [labels, setLabels] =
    useState([]);

  const [labelInput, setLabelInput] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | Reset form whenever modal opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setAssigneeId("");
    setLabels([]);
    setLabelInput("");
    setDueDate("");
    setError("");
    setSubmitting(false);

  }, [isOpen]);


  /*
  |--------------------------------------------------------------------------
  | Escape key
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {

      if (
        event.key === "Escape" &&
        !submitting
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
    submitting,
    onClose
  ]);


  /*
  |--------------------------------------------------------------------------
  | Add label
  |--------------------------------------------------------------------------
  */

  const addLabel = () => {

    const label =
      labelInput
        .trim()
        .toLowerCase();


    if (!label) {
      return;
    }


    if (
      labels.includes(label)
    ) {
      setLabelInput("");
      return;
    }


    if (labels.length >= 5) {
      setError(
        "You can add a maximum of 5 labels."
      );
      return;
    }


    setLabels(
      (current) => [
        ...current,
        label
      ]
    );

    setLabelInput("");
    setError("");
  };


  /*
  |--------------------------------------------------------------------------
  | Remove label
  |--------------------------------------------------------------------------
  */

  const removeLabel = (labelToRemove) => {

    setLabels(
      (current) =>
        current.filter(
          (label) =>
            label !== labelToRemove
        )
    );
  };


  /*
  |--------------------------------------------------------------------------
  | Label keyboard handling
  |--------------------------------------------------------------------------
  */

  const handleLabelKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" ||
      event.key === ","
    ) {

      event.preventDefault();

      addLabel();
    }

  };


  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    const trimmedTitle =
      title.trim();


    if (!trimmedTitle) {

      setError(
        "Task title is required."
      );

      return;
    }


    if (
      trimmedTitle.length < 3
    ) {

      setError(
        "Task title must be at least 3 characters."
      );

      return;
    }


    setSubmitting(true);
    setError("");


    try {

      /*
       * IMPORTANT:
       *
       * Do NOT send:
       *
       * projectId
       * workspaceId
       * reporterId
       * version
       * status
       *
       * Backend owns those values.
       */

      const payload = {
        title: trimmedTitle,

        description:
          description.trim() || undefined,

        priority,

        labels,

        dueDate:
          dueDate || undefined
      };


      /*
       * Assignee is optional.
       *
       * Only send it if the user
       * actually selected one.
       */

      if (assigneeId) {
        payload.assigneeId =
          assigneeId;
      }


      /*
       * Backend call
       */

      const response =
        await createTask(
          projectId,
          payload
        );


      /*
       * Expected:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: task
       * }
       */

      const createdTask =
        response?.data;


      if (!createdTask) {

        throw new Error(
          "Server did not return the created task."
        );
      }


      /*
       * Send task back to Kanban
       */

      onCreated?.(
        createdTask
      );


      /*
       * Close modal
       */

      onClose();

    } catch (err) {

      console.error(
        "Create task failed:",
        err
      );


      setError(
        err.message ||
        "Failed to create task."
      );

    } finally {

      setSubmitting(false);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | Don't render
  |--------------------------------------------------------------------------
  */

  if (!isOpen) {
    return null;
  }


  return (
    <div
      className="create-task-overlay"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget &&
          !submitting
        ) {
          onClose();
        }

      }}
    >

      <div
        className="create-task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="create-task-header">

          <div>

            <span className="create-task-eyebrow">
              NEW TASK
            </span>

            <h2
              id="create-task-title"
              className="create-task-title"
            >
              Create Task
            </h2>

          </div>


          <button
            type="button"
            className="create-task-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="create-task-form"
          onSubmit={handleSubmit}
        >

          {/* TITLE */}

          <div className="create-task-field">

            <label
              htmlFor="task-title"
              className="create-task-label"
            >
              Title
              <span>*</span>
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="What needs to be done?"
              maxLength={120}
              autoFocus
              disabled={submitting}
              className="create-task-input"
            />

          </div>


          {/* DESCRIPTION */}

          <div className="create-task-field">

            <label
              htmlFor="task-description"
              className="create-task-label"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Add some context..."
              maxLength={2000}
              rows={4}
              disabled={submitting}
              className="
                create-task-input
                create-task-textarea
              "
            />

          </div>


          {/* PRIORITY + ASSIGNEE */}

          <div className="create-task-grid">

            <div className="create-task-field">

              <label
                htmlFor="task-priority"
                className="create-task-label"
              >
                Priority
              </label>

              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value
                  )
                }
                disabled={submitting}
                className="create-task-input"
              >

                {PRIORITIES.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>


            <div className="create-task-field">

              <label
                htmlFor="task-assignee"
                className="create-task-label"
              >
                Assignee
              </label>

              <input
                id="task-assignee"
                type="text"
                value={assigneeId}
                onChange={(event) =>
                  setAssigneeId(
                    event.target.value
                  )
                }
                placeholder="User ID or leave empty"
                disabled={submitting}
                className="create-task-input"
              />

            </div>

          </div>


          {/* LABELS */}

          <div className="create-task-field">

            <label className="create-task-label">
              Labels
            </label>


            <div className="create-task-label-box">

              <div className="create-task-label-list">

                {labels.map(
                  (label) => (

                    <span
                      key={label}
                      className="create-task-label-chip"
                    >

                      {label}

                      <button
                        type="button"
                        onClick={() =>
                          removeLabel(
                            label
                          )
                        }
                        disabled={submitting}
                        aria-label={
                          `Remove ${label}`
                        }
                      >
                        ×
                      </button>

                    </span>

                  )
                )}


                <input
                  type="text"
                  value={labelInput}
                  onChange={(event) =>
                    setLabelInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleLabelKeyDown
                  }
                  onBlur={() => {

                    if (
                      labelInput.trim()
                    ) {
                      addLabel();
                    }

                  }}
                  placeholder={
                    labels.length
                      ? "Add label..."
                      : "backend"
                  }
                  disabled={
                    submitting ||
                    labels.length >= 5
                  }
                  className="
                    create-task-label-input
                  "
                />


                <button
                  type="button"
                  className="create-task-add-label"
                  onClick={addLabel}
                  disabled={
                    submitting ||
                    labels.length >= 5
                  }
                >
                  +
                </button>

              </div>

            </div>

          </div>


          {/* DUE DATE */}

          <div className="create-task-field">

            <label
              htmlFor="task-due-date"
              className="create-task-label"
            >
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value
                )
              }
              disabled={submitting}
              className="create-task-input"
            />

          </div>


          {/* ERROR */}

          {error && (

            <div className="create-task-error">
              {error}
            </div>

          )}


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="create-task-footer">

            <button
              type="button"
              className="create-task-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="create-task-submit"
              disabled={submitting}
            >

              {submitting ? (
                <>
                  <span className="create-task-spinner" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


export default CreateTaskModal;