const mongoose = require("mongoose");

const projectRepository =
  require("../repositories/projectRepository");

const taskRepository =
  require("../repositories/taskRepository");

const workspaceMemberRepository =
  require("../repositories/workspaceMemberRepository");

const {
  createEvent
} = require("../websocket/eventFactory");

const EVENT_TYPES =
  require("../websocket/eventTypes");

const {
  publishApplicationEvent
} = require("../websocket/eventPublisher");


const UPDATE_ROLES = [
  "OWNER",
  "ADMIN",
  "MANAGER"
];

const DELETE_ROLES = [
  "OWNER",
  "ADMIN"
];


/*
|--------------------------------------------------------------------------
| CREATE TASK
|--------------------------------------------------------------------------
*/

const createTask = async ({
  projectId,
  title,
  description,
  priority,
  labels,
  dueDate,
  userId
}) => {

  /*
   * Validate project ID
   */

  if (
    !mongoose.Types.ObjectId.isValid(
      projectId
    )
  ) {

    const error =
      new Error(
        "Invalid project ID"
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Find project
   */

  const project =
    await projectRepository.findProjectById(
      projectId
    );


  if (!project) {

    const error =
      new Error(
        "Project not found"
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Workspace membership
   */

  const workspaceId =
    project.workspaceId;


  const membership =
    await workspaceMemberRepository.findMembership(
      workspaceId,
      userId
    );


  if (!membership) {

    const error =
      new Error(
        "You do not have access to this workspace"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Create task in MongoDB
   */

  const task =
    await taskRepository.createTask({

      projectId:
        project._id,

      workspaceId:
        project.workspaceId,

      title,

      description:
        description || "",

      status:
        "TODO",

      priority:
        priority || "MEDIUM",

      assigneeId:
        userId,

      reporterId:
        userId,

      labels:
        labels || [],

      dueDate:
        dueDate || null,

      version:
        1

    });


  /*
   * MongoDB succeeded.
   *
   * NOW publish real-time event.
   */

  const event =
    createEvent({

      type:
        EVENT_TYPES.TASK_CREATED,

      workspaceId:
        String(
          task.workspaceId
        ),

      projectId:
        String(
          task.projectId
        ),

      entityId:
        String(
          task._id
        ),

      actorId:
        String(
          userId
        ),

      payload: {

        task

      }

    });


  await publishApplicationEvent(
    event
  );


  return task;
};


/*
|--------------------------------------------------------------------------
| GET TASKS BY PROJECT
|--------------------------------------------------------------------------
*/

const getTasksByProject = async (
  projectId,
  userId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      projectId
    )
  ) {

    const error =
      new Error(
        "Invalid project ID"
      );

    error.statusCode = 400;

    throw error;
  }


  const project =
    await projectRepository.findProjectById(
      projectId
    );


  if (!project) {

    const error =
      new Error(
        "Project not found"
      );

    error.statusCode = 404;

    throw error;
  }


  const workspaceId =
    project.workspaceId;


  const membership =
    await workspaceMemberRepository.findMembership(
      workspaceId,
      userId
    );


  if (!membership) {

    const error =
      new Error(
        "You do not have access to this workspace"
      );

    error.statusCode = 403;

    throw error;
  }


  return await taskRepository.findTasksByProject(
    projectId
  );
};


/*
|--------------------------------------------------------------------------
| GET TASK BY ID
|--------------------------------------------------------------------------
*/

const getTaskById = async (
  taskId,
  userId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      taskId
    )
  ) {

    const error =
      new Error(
        "Invalid task ID"
      );

    error.statusCode = 400;

    throw error;
  }


  const task =
    await taskRepository.findTaskById(
      taskId
    );


  if (!task) {

    const error =
      new Error(
        "Task not found"
      );

    error.statusCode = 404;

    throw error;
  }


  const membership =
    await workspaceMemberRepository.findMembership(
      task.workspaceId,
      userId
    );


  if (!membership) {

    const error =
      new Error(
        "You do not have access to this task"
      );

    error.statusCode = 403;

    throw error;
  }


  return task;
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK
|--------------------------------------------------------------------------
*/

const updateTask = async (
  taskId,
  updateData,
  userId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      taskId
    )
  ) {

    const error =
      new Error(
        "Invalid task ID"
      );

    error.statusCode = 400;

    throw error;
  }


  const task =
    await taskRepository.findTaskById(
      taskId
    );


  if (!task) {

    const error =
      new Error(
        "Task not found"
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Workspace membership
   */

  const membership =
    await workspaceMemberRepository.findMembership(
      task.workspaceId,
      userId
    );


  if (!membership) {

    const error =
      new Error(
        "You do not have access to this task"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Permission
   */

  if (
    !UPDATE_ROLES.includes(
      membership.role
    )
  ) {

    const error =
      new Error(
        "You do not have permission to update this task"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Version required
   */

  if (
    updateData.version === undefined
  ) {

    const error =
      new Error(
        "Version is required for update"
      );

    error.statusCode = 400;

    throw error;
  }


  const {
    version,
    ...updateFields
  } = updateData;


  /*
   * Optimistic concurrency update
   */

  const updatedTask =
    await taskRepository.updateTaskWithVersion(
      taskId,
      version,
      updateFields
    );


  if (!updatedTask) {

    const error =
      new Error(
        "Task was modified by another user. Please refresh and try again."
      );

    error.statusCode = 409;

    throw error;
  }


  /*
   * MongoDB succeeded.
   *
   * Publish AFTER the database update.
   */

  const event =
    createEvent({

      type:
        EVENT_TYPES.TASK_UPDATED,

      workspaceId:
        String(
          updatedTask.workspaceId
        ),

      projectId:
        String(
          updatedTask.projectId
        ),

      entityId:
        String(
          updatedTask._id
        ),

      actorId:
        String(
          userId
        ),

      payload: {

        task:
          updatedTask

      }

    });


  await publishApplicationEvent(
    event
  );


  return updatedTask;
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK STATUS / MOVE TASK
|--------------------------------------------------------------------------
*/

const updateTaskStatus = async (
  taskId,
  status,
  version,
  userId
) => {

  /*
   * Validate task ID
   */

  if (
    !mongoose.Types.ObjectId.isValid(
      taskId
    )
  ) {

    const error =
      new Error(
        "Invalid task ID"
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Find current task
   */

  const task =
    await taskRepository.findTaskById(
      taskId
    );


  if (!task) {

    const error =
      new Error(
        "Task not found"
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Workspace membership
   */

  const membership =
    await workspaceMemberRepository.findMembership(
      task.workspaceId,
      userId
    );


  if (!membership) {

    const error =
      new Error(
        "You do not have access to this task"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Permission
   */

  if (
    !UPDATE_ROLES.includes(
      membership.role
    )
  ) {

    const error =
      new Error(
        "You do not have permission to update this task"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Version required
   */

  if (
    version === undefined
  ) {

    const error =
      new Error(
        "Version is required for update"
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Status cannot be the same
   */

  const previousStatus =
    task.status;


  if (
    previousStatus === status
  ) {

    const error =
      new Error(
        "New status is the same as the current status"
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Update MongoDB ONCE.
   *
   * IMPORTANT:
   * Do NOT call updateTask() here.
   * updateTask() itself publishes TASK_UPDATED.
   *
   * Calling it here would create duplicate updates/events.
   */

  const updatedTask =
    await taskRepository.updateTaskWithVersion(
      taskId,
      version,
      {
        status
      }
    );


  if (!updatedTask) {

    const error =
      new Error(
        "Task was modified by another user. Please refresh and try again."
      );

    error.statusCode = 409;

    throw error;
  }


  /*
   * Publish TASK_MOVED AFTER MongoDB succeeds.
   */

  const event =
    createEvent({

      type:
        EVENT_TYPES.TASK_MOVED,

      workspaceId:
        String(
          updatedTask.workspaceId
        ),

      projectId:
        String(
          updatedTask.projectId
        ),

      entityId:
        String(
          updatedTask._id
        ),

      actorId:
        String(
          userId
        ),

      payload: {

        from:
          previousStatus,

        to:
          updatedTask.status,

        version:
          updatedTask.version

      }

    });


  await publishApplicationEvent(
    event
  );


  return updatedTask;
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK ASSIGNEE
|--------------------------------------------------------------------------
*/

const updateTaskAssignee = async (
  taskId,
  assigneeId,
  version,
  userId
) => {

  return await updateTask(

    taskId,

    {
      assigneeId,

      version

    },

    userId

  );
};


/*
|--------------------------------------------------------------------------
| DELETE TASK
|--------------------------------------------------------------------------
*/

const deleteTask = async (
  taskId,
  userId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      taskId
    )
  ) {

    const error =
      new Error(
        "Invalid task ID"
      );

    error.statusCode = 400;

    throw error;
  }


  const task =
    await taskRepository.findTaskById(
      taskId
    );


  if (!task) {

    const error =
      new Error(
        "Task not found"
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Workspace membership
   */

  const membership =
    await workspaceMemberRepository.findMembership(
      task.workspaceId,
      userId
    );


  if (!membership) {

    const error =
      new Error(
        "You do not have access to this task"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Delete permission
   */

  if (
    !DELETE_ROLES.includes(
      membership.role
    )
  ) {

    const error =
      new Error(
        "You do not have permission to delete this task"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Delete from MongoDB
   */

  await taskRepository.deleteTask(
    taskId
  );


  /*
   * Publish AFTER successful deletion.
   */

  const event =
    createEvent({

      type:
        EVENT_TYPES.TASK_DELETED,

      workspaceId:
        String(
          task.workspaceId
        ),

      projectId:
        String(
          task.projectId
        ),

      entityId:
        String(
          task._id
        ),

      actorId:
        String(
          userId
        ),

      payload: {}

    });


  await publishApplicationEvent(
    event
  );


  return {

    id:
      task._id,

    title:
      task.title,

    description:
      task.description,

    message:
      "Task deleted successfully"

  };
};


module.exports = {

  createTask,

  getTasksByProject,

  getTaskById,

  updateTask,

  updateTaskStatus,

  updateTaskAssignee,

  deleteTask

};