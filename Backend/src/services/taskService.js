const mongoose = require("mongoose");

const projectRepository = require("../repositories/projectRepository");
const taskRepository = require("../repositories/taskRepository");
const workspaceMemberRepository = require("../repositories/workspaceMemberRepository");

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

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error("Invalid project ID");
    error.statusCode = 400;
    throw error;
  }

  const project =
    await projectRepository.findProjectById(projectId);

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  // NEVER trust workspaceId from frontend.
  // Get it from the project.
  const workspaceId = project.workspaceId;

  const membership =
    await workspaceMemberRepository.findMembership(
      workspaceId,
      userId
    );

  if (!membership) {
    const error = new Error(
      "You do not have access to this workspace"
    );

    error.statusCode = 403;
    throw error;
  }

  const task = await taskRepository.createTask({
    projectId: project._id,
    workspaceId: project.workspaceId,

    title,
    description: description || "",

    // Backend controlled
    status: "TODO",

    priority: priority || "MEDIUM",

    // Initially assign to creator
    assigneeId: userId,

    // Backend controlled
    reporterId: userId,

    labels: labels || [],

    dueDate: dueDate || null,

    // Backend controlled
    version: 1
  });

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

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const error = new Error("Invalid project ID");
    error.statusCode = 400;
    throw error;
  }

  const project =
    await projectRepository.findProjectById(projectId);

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const workspaceId = project.workspaceId;

  const membership =
    await workspaceMemberRepository.findMembership(
      workspaceId,
      userId
    );

  if (!membership) {
    const error = new Error(
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

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error = new Error("Invalid task ID");
    error.statusCode = 400;
    throw error;
  }

  const task =
    await taskRepository.findTaskById(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const membership =
    await workspaceMemberRepository.findMembership(
      task.workspaceId,
      userId
    );

  if (!membership) {
    const error = new Error(
      "You do not have access to this task"
    );

    error.statusCode = 403;
    throw error;
  }

  return task;
};


/*
|--------------------------------------------------------------------------
| GENERIC UPDATE TASK
|--------------------------------------------------------------------------
|
| PATCH /api/v1/tasks/:id
|
| Can update:
|
| title
| description
| status
| priority
| assigneeId
| labels
| dueDate
|
| version is required for optimistic concurrency.
|
|--------------------------------------------------------------------------
*/

const updateTask = async (
  taskId,
  updateData,
  userId
) => {

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error = new Error("Invalid task ID");
    error.statusCode = 400;
    throw error;
  }

  const task =
    await taskRepository.findTaskById(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const membership =
    await workspaceMemberRepository.findMembership(
      task.workspaceId,
      userId
    );

  if (!membership) {
    const error = new Error(
      "You do not have access to this task"
    );

    error.statusCode = 403;
    throw error;
  }

  if (!UPDATE_ROLES.includes(membership.role)) {
    const error = new Error(
      "You do not have permission to update this task"
    );

    error.statusCode = 403;
    throw error;
  }

  /*
   * Version is required.
   */
  if (updateData.version === undefined) {
    const error = new Error(
      "Version is required for update"
    );

    error.statusCode = 400;
    throw error;
  }

  /*
   * Separate version from fields.
   *
   * version is NOT directly written to MongoDB.
   * Repository increments it atomically.
   */
  const {
    version,
    ...updateFields
  } = updateData;

  /*
   * Optimistic concurrency update.
   */
  const updatedTask =
    await taskRepository.updateTaskWithVersion(
      taskId,
      version,
      updateFields
    );

  /*
   * null means version mismatch.
   */
  if (!updatedTask) {
    const error = new Error(
      "Task was modified by another user. Please refresh and try again."
    );

    error.statusCode = 409;
    throw error;
  }

  return updatedTask;
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/v1/tasks/:id/status
|
| This is a specialized shortcut.
|
| It DOES NOT duplicate update logic.
|
| updateTaskStatus()
|        ↓
| updateTask()
|        ↓
| updateTaskWithVersion()
|
|--------------------------------------------------------------------------
*/

const updateTaskStatus = async (
  taskId,
  status,
  version,
  userId
) => {

  return await updateTask(
    taskId,
    {
      status,
      version
    },
    userId
  );
};


/*
|--------------------------------------------------------------------------
| UPDATE TASK ASSIGNEE
|--------------------------------------------------------------------------
|
| PATCH /api/v1/tasks/:id/assignee
|
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

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error = new Error("Invalid task ID");
    error.statusCode = 400;
    throw error;
  }

  const task =
    await taskRepository.findTaskById(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const membership =
    await workspaceMemberRepository.findMembership(
      task.workspaceId,
      userId
    );

  if (!membership) {
    const error = new Error(
      "You do not have access to this task"
    );

    error.statusCode = 403;
    throw error;
  }

  if (!DELETE_ROLES.includes(membership.role)) {
    const error = new Error(
      "You do not have permission to delete this task"
    );

    error.statusCode = 403;
    throw error;
  }

  await taskRepository.deleteTask(taskId);

  return {
    id: task._id,
    title: task.title,
    description: task.description,
    message: "Task deleted successfully"
  };
};


module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,

  // Generic update
  updateTask,

  // Specialized updates
  updateTaskStatus,
  updateTaskAssignee,

  deleteTask
};