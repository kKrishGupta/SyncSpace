const commentService = require("../services/commentService");
const logger = require("../utils/logger");
const activityService = require("../services/activityService");
const notificationService = require("../services/notificationService");
const Task = require("../models/Task");


/*
|--------------------------------------------------------------------------
| POST /api/v1/tasks/:id/comments
|--------------------------------------------------------------------------
*/

const createComment = async ( req, res, next) => {
  try {
    const {content, mentions, parentCommentId} = req.body;
    const comment = await commentService.createComment({
        taskId: req.params.id,
        content,
        mentions,
        parentCommentId,
        userId: req.user.id
      });
      
    const task = await Task.findById(req.params.id);

    if (task) {
      await activityService.logActivity({
        workspaceId: task.workspaceId,
        projectId: task.projectId,
        actorId: req.user.id,
        action: 'COMMENTED',
        entityType: 'Task',
        entityId: task._id,
        metadata: { taskId: task._id, title: task.title }
      });
    }

    if (mentions && mentions.length > 0 && task) {
      for (const mentionId of mentions) {
        if (mentionId.toString() !== req.user.id.toString()) {
          await notificationService.createNotification({
            recipientId: mentionId,
            actorId: req.user.id,
            type: 'MENTION',
            entityId: task._id,
            entityType: 'Task',
            message: `mentioned you in a comment on ${task.title}`
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/v1/tasks/:id/comments
|--------------------------------------------------------------------------
*/

const getCommentsByTask = async (  req, res, next) => {
  try {
    const comments =
      await commentService.getCommentsByTask(
        req.params.id,
        req.user.id
      );
    return res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: comments
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/v1/comments/:id
|--------------------------------------------------------------------------
*/

const updateComment = async (req, res, next
) => {
  try {
    const { content } = req.body;
    const comment = await commentService.updateComment(
        req.params.id,
        content,
        req.user.id
      );
    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/v1/comments/:id
|--------------------------------------------------------------------------
*/

const deleteComment = async (req, res, next
) => {
  try {
    const result =
      await commentService.deleteComment(
        req.params.id,
        req.user.id
      );
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        id: result.id
      }
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};


module.exports = {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment
};