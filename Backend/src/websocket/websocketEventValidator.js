const EVENT_TYPES =
  require("./eventTypes");

const {
  isValidObjectId,
  assertWorkspaceAccess
} = require("./workspaceAuthorization");

const projectRepository =
  require("../repositories/projectRepository");

const taskRepository =
  require("../repositories/taskRepository");


/*
|--------------------------------------------------------------------------
| Server-generated events
|--------------------------------------------------------------------------
|
| Clients are NEVER allowed to send these
| as commands.
|
*/

const SERVER_ONLY_EVENTS =
  new Set([

    EVENT_TYPES.CONNECTED,

    EVENT_TYPES.DISCONNECTED,

    EVENT_TYPES.PONG,

    EVENT_TYPES.USER_ONLINE,

    EVENT_TYPES.USER_OFFLINE,

    EVENT_TYPES.PRESENCE_SNAPSHOT,

    EVENT_TYPES.TASK_CREATED,

    EVENT_TYPES.TASK_UPDATED,

    EVENT_TYPES.TASK_MOVED,

    EVENT_TYPES.TASK_DELETED,

    EVENT_TYPES.COMMENT_CREATED,

    EVENT_TYPES.COMMENT_UPDATED,

    EVENT_TYPES.COMMENT_DELETED

  ]);


/*
|--------------------------------------------------------------------------
| Client commands
|--------------------------------------------------------------------------
*/

const CLIENT_COMMAND_EVENTS =
  new Set([

    EVENT_TYPES.PING,

    EVENT_TYPES.PRESENCE_HEARTBEAT,

    EVENT_TYPES.WORKSPACE_JOIN,

    EVENT_TYPES.WORKSPACE_LEAVE,

    EVENT_TYPES.TYPING_STARTED,

    EVENT_TYPES.TYPING_STOPPED

  ]);


/*
|--------------------------------------------------------------------------
| Invalid event
|--------------------------------------------------------------------------
*/

const createValidationError =
  (
    message,
    statusCode = 400
  ) => {

    const error =
      new Error(message);

    error.statusCode =
      statusCode;

    return error;

  };


/*
|--------------------------------------------------------------------------
| Validate basic event
|--------------------------------------------------------------------------
*/

const validateEventType =
  (data) => {

    if (
      !data ||
      typeof data !== "object"
    ) {

      throw createValidationError(
        "Invalid WebSocket message"
      );

    }


    if (
      typeof data.type !==
      "string"
    ) {

      throw createValidationError(
        "Event type is required"
      );

    }


    if (
      !Object.values(
        EVENT_TYPES
      ).includes(
        data.type
      )
    ) {

      throw createValidationError(
        "Unsupported WebSocket event type"
      );

    }

  };


/*
|--------------------------------------------------------------------------
| Validate workspace ID
|--------------------------------------------------------------------------
*/

const validateWorkspaceId =
  (workspaceId) => {

    if (
      !workspaceId
    ) {

      throw createValidationError(
        "workspaceId is required"
      );

    }


    if (
      !isValidObjectId(
        String(workspaceId)
      )
    ) {

      throw createValidationError(
        "Invalid workspace ID"
      );

    }


    return String(
      workspaceId
    );

  };


/*
|--------------------------------------------------------------------------
| Validate project
|--------------------------------------------------------------------------
*/

const validateProjectAccess =
  async ({
    userId,
    workspaceId,
    projectId
  }) => {

    if (
      !projectId
    ) {

      throw createValidationError(
        "projectId is required"
      );

    }


    if (
      !isValidObjectId(
        String(projectId)
      )
    ) {

      throw createValidationError(
        "Invalid project ID"
      );

    }


    const project =
      await projectRepository
        .findProjectById(
          String(projectId)
        );


    if (!project) {

      throw createValidationError(
        "Project not found",
        404
      );

    }


    /*
     * Project must belong to
     * the authorized workspace.
     */

    if (
      String(
        project.workspaceId
      ) !==
      String(
        workspaceId
      )
    ) {

      throw createValidationError(
        "Project does not belong to this workspace",
        403
      );

    }


    /*
     * Workspace membership
     * is still required.
     */

    await assertWorkspaceAccess({

      userId,

      workspaceId

    });


    return project;

  };


/*
|--------------------------------------------------------------------------
| Validate task
|--------------------------------------------------------------------------
*/

const validateTaskAccess =
  async ({
    userId,
    workspaceId,
    projectId,
    taskId
  }) => {

    if (
      !taskId
    ) {

      throw createValidationError(
        "taskId is required"
      );

    }


    if (
      !isValidObjectId(
        String(taskId)
      )
    ) {

      throw createValidationError(
        "Invalid task ID"
      );

    }


    const task =
      await taskRepository
        .findTaskById(
          String(taskId)
        );


    if (!task) {

      throw createValidationError(
        "Task not found",
        404
      );

    }


    /*
     * Task must belong to
     * the authorized workspace.
     */

    if (
      String(
        task.workspaceId
      ) !==
      String(
        workspaceId
      )
    ) {

      throw createValidationError(
        "Task does not belong to this workspace",
        403
      );

    }


    /*
     * If projectId was supplied,
     * task must belong to it.
     */

    if (
      projectId &&
      String(
        task.projectId
      ) !==
      String(
        projectId
      )
    ) {

      throw createValidationError(
        "Task does not belong to this project",
        403
      );

    }


    await assertWorkspaceAccess({

      userId,

      workspaceId

    });


    return task;

  };


/*
|--------------------------------------------------------------------------
| Validate incoming WebSocket command
|--------------------------------------------------------------------------
*/

const validateIncomingEvent =
  async ({
    ws,
    data
  }) => {

    validateEventType(
      data
    );


    /*
     * ------------------------------------------------------
     * Never accept server-generated events from browser
     * ------------------------------------------------------
     */

    if (
      SERVER_ONLY_EVENTS.has(
        data.type
      )
    ) {

      throw createValidationError(
        "This event can only be generated by the server",
        403
      );

    }


    /*
     * ------------------------------------------------------
     * Ensure command is allowed
     * ------------------------------------------------------
     */

    if (
      !CLIENT_COMMAND_EVENTS.has(
        data.type
      )
    ) {

      throw createValidationError(
        "WebSocket command is not allowed",
        403
      );

    }


    /*
     * ------------------------------------------------------
     * Connected user
     * ------------------------------------------------------
     */

    if (
      !ws.connectionUser ||
      !ws.connectionUser.id
    ) {

      throw createValidationError(
        "Unauthenticated WebSocket connection",
        401
      );

    }


    const userId =
      String(
        ws.connectionUser.id
      );


    /*
     * ------------------------------------------------------
     * PING
     * ------------------------------------------------------
     */

    if (
      data.type ===
      EVENT_TYPES.PING
    ) {

      return {

        type:
          data.type,

        userId

      };

    }


    /*
     * ------------------------------------------------------
     * WORKSPACE JOIN
     * ------------------------------------------------------
     */

    if (
      data.type ===
      EVENT_TYPES.WORKSPACE_JOIN
    ) {

      const workspaceId =
        validateWorkspaceId(
          data.workspaceId
        );


      /*
       * CRITICAL SECURITY CHECK
       *
       * User
       *   ↓
       * WorkspaceMember
       *   ↓
       * Workspace
       */

      const membership =
        await assertWorkspaceAccess({

          userId,

          workspaceId

        });


      return {

        type:
          data.type,

        userId,

        workspaceId,

        membership

      };

    }


    /*
     * ------------------------------------------------------
     * WORKSPACE LEAVE
     * ------------------------------------------------------
     */

    if (
      data.type ===
      EVENT_TYPES.WORKSPACE_LEAVE
    ) {

      const workspaceId =
        validateWorkspaceId(
          data.workspaceId
        );


      /*
       * The socket can only leave a
       * workspace that it is currently
       * subscribed to.
       */

      if (
        !ws.workspaceIds ||
        !ws.workspaceIds.has(
          workspaceId
        )
      ) {

        throw createValidationError(
          "You are not subscribed to this workspace",
          403
        );

      }


      /*
       * Re-check membership.
       *
       * This matters for long-lived
       * WebSocket connections.
       */

      await assertWorkspaceAccess({

        userId,

        workspaceId

      });


      return {

        type:
          data.type,

        userId,

        workspaceId

      };

    }


    /*
     * ------------------------------------------------------
     * HEARTBEAT
     * ------------------------------------------------------
     */

    if (
      data.type ===
      EVENT_TYPES.PRESENCE_HEARTBEAT
    ) {

      if (
        !ws.workspaceIds ||
        ws.workspaceIds.size === 0
      ) {

        throw createValidationError(
          "Workspace subscription required",
          403
        );

      }


      /*
       * Refresh only the socket's
       * already-authorized workspace(s).
       */

      return {

        type:
          data.type,

        userId,

        workspaceIds:
          Array.from(
            ws.workspaceIds
          )

      };

    }


    /*
     * ------------------------------------------------------
     * TYPING
     * ------------------------------------------------------
     */

    if (
      data.type ===
        EVENT_TYPES.TYPING_STARTED ||
      data.type ===
        EVENT_TYPES.TYPING_STOPPED
    ) {

      if (
        !ws.workspaceIds ||
        !ws.workspaceIds.size
      ) {

        throw createValidationError(
          "Workspace subscription required",
          403
        );

      }


      const workspaceId =
        validateWorkspaceId(
          data.workspaceId
        );


      /*
       * Never trust data.workspaceId.
       *
       * It must match a workspace
       * authorized on this socket.
       */

      if (
        !ws.workspaceIds.has(
          workspaceId
        )
      ) {

        throw createValidationError(
          "Workspace access denied",
          403
        );

      }


      /*
       * Re-check membership because
       * the connection is long-lived.
       */

      await assertWorkspaceAccess({

        userId,

        workspaceId

      });


      const project =
        await validateProjectAccess({

          userId,

          workspaceId,

          projectId:
            data.projectId

        });


      const task =
        await validateTaskAccess({

          userId,

          workspaceId,

          projectId:
            data.projectId,

          taskId:
            data.entityId

        });


      return {

        type:
          data.type,

        userId,

        workspaceId,

        projectId:
          String(
            project._id
          ),

        taskId:
          String(
            task._id
          )

      };

    }


    throw createValidationError(
      "Unsupported WebSocket command"
    );

  };


module.exports = {
  validateIncomingEvent,
  validateProjectAccess,
  validateTaskAccess
};