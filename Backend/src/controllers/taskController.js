const taskService = require("../services/taskService");
const logger = require("../utils/logger");
const activityService = require("../services/activityService");
const notificationService = require("../services/notificationService");

// POST /api/v1/projects/:id/tasks
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      labels,
      dueDate
    } = req.body;

    const task = await taskService.createTask({
      projectId: req.params.id,
      title,
      description,
      priority,
      labels,
      dueDate,
      userId: req.user.id
    });

    await activityService.logActivity({
      workspaceId: task.workspaceId,
      projectId: task.projectId,
      actorId: req.user.id,
      action: 'CREATED',
      entityType: 'Task',
      entityId: task._id,
      metadata: { title: task.title }
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


// GET /api/v1/projects/:id/tasks
const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByProject(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


// GET /api/v1/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


// PATCH /api/v1/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


// DELETE /api/v1/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
        title: result.title,
        description: result.description
      }
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


// PATCH /api/v1/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const {
      status,
      version
    } = req.body;

    const task = await taskService.updateTaskStatus(
      req.params.id,
      status,
      version,
      req.user.id
    );

    await activityService.logActivity({
      workspaceId: task.workspaceId,
      projectId: task.projectId,
      actorId: req.user.id,
      action: 'MOVED',
      entityType: 'Task',
      entityId: task._id,
      metadata: { status }
    });

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


// PATCH /api/v1/tasks/:id/assignee
const updateTaskAssignee = async (req, res, next) => {
  try {
    const {
      assigneeId,
      version
    } = req.body;

    const task = await taskService.updateTaskAssignee(
      req.params.id,
      assigneeId,
      version,
      req.user.id
    );

    await activityService.logActivity({
      workspaceId: task.workspaceId,
      projectId: task.projectId,
      actorId: req.user.id,
      action: 'ASSIGNED',
      entityType: 'Task',
      entityId: task._id,
      metadata: { assigneeId }
    });

    if (assigneeId.toString() !== req.user.id.toString()) {
      await notificationService.createNotification({
        recipientId: assigneeId,
        actorId: req.user.id,
        type: 'TASK_ASSIGNED',
        entityId: task._id,
        entityType: 'Task',
        message: `assigned you to task: ${task.title}`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task assignee updated successfully",
      data: task
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskAssignee
};