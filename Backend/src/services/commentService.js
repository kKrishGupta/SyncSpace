const mongoose =
  require("mongoose");


const taskRepository =
  require("../repositories/taskRepository");


const commentRepository =
  require("../repositories/commentRepository");


const workspaceMemberRepository =
  require("../repositories/workspaceMemberRepository");


const {
  createEvent
} = require("../websocket/eventFactory");


const EVENT_TYPES =
  require("../websocket/eventTypes");


const {
  publishApplicationEvent
} =
  require("../websocket/eventPublisher");


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
| CREATE COMMENT
|--------------------------------------------------------------------------
*/

const createComment = async ({
  taskId,
  content,
  mentions = [],
  parentCommentId = null,
  userId
}) => {

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
   * Validate content
   */

  if (
    !content ||
    !content.trim()
  ) {

    const error =
      new Error(
        "Comment content is required"
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Find task
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
        "You are not a member of this workspace"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Validate parent comment
   */

  if (
    parentCommentId
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        parentCommentId
      )
    ) {

      const error =
        new Error(
          "Invalid parent comment ID"
        );

      error.statusCode = 400;

      throw error;
    }


    const parentComment =
      await commentRepository.findCommentById(
        parentCommentId
      );


    if (!parentComment) {

      const error =
        new Error(
          "Parent comment not found"
        );

      error.statusCode = 404;

      throw error;
    }


    /*
     * Parent must belong
     * to same task.
     */

    if (
      String(
        parentComment.taskId
      ) !==
      String(
        taskId
      )
    ) {

      const error =
        new Error(
          "Parent comment belongs to another task"
        );

      error.statusCode = 400;

      throw error;
    }

  }


  /*
   * Create comment in MongoDB
   */

  const comment =
    await commentRepository.createComment({

      taskId:
        task._id,

      authorId:
        userId,

      content:
        content.trim(),

      mentions,

      parentCommentId

    });


  /*
   * MongoDB succeeded.
   *
   * Publish COMMENT_CREATED.
   *
   * entityId = TASK ID
   * because comments belong to a task.
   */

  const event =
    createEvent({

      type:
        EVENT_TYPES.COMMENT_CREATED,

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

        comment

      }

    });


  await publishApplicationEvent(
    event
  );


  return comment;
};


/*
|--------------------------------------------------------------------------
| GET COMMENTS
|--------------------------------------------------------------------------
*/

const getCommentsByTask = async (
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


  /*
   * Find task
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
        "You are not a member of this workspace"
      );

    error.statusCode = 403;

    throw error;
  }


  return await commentRepository.findCommentsByTask(
    taskId
  );
};


/*
|--------------------------------------------------------------------------
| UPDATE COMMENT
|--------------------------------------------------------------------------
*/

const updateComment = async (
  commentId,
  content,
  userId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      commentId
    )
  ) {

    const error =
      new Error(
        "Invalid comment ID"
      );

    error.statusCode = 400;

    throw error;
  }


  if (
    !content ||
    !content.trim()
  ) {

    const error =
      new Error(
        "Comment content is required"
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Find comment
   */

  const comment =
    await commentRepository.findCommentById(
      commentId
    );


  if (!comment) {

    const error =
      new Error(
        "Comment not found"
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Find task
   */

  const task =
    await taskRepository.findTaskById(
      comment.taskId
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
        "You are not a member of this workspace"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Only author can edit.
   */

  if (
    String(
      comment.authorId
    ) !==
    String(
      userId
    )
  ) {

    const error =
      new Error(
        "You can only edit your own comments"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * IMPORTANT:
   *
   * Update MongoDB FIRST.
   */

  const updatedComment =
    await commentRepository.updateComment(

      commentId,

      {
        content:
          content.trim()
      }

    );


  if (!updatedComment) {

    const error =
      new Error(
        "Comment could not be updated"
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * MongoDB succeeded.
   *
   * NOW publish event.
   */

  const event =
    createEvent({

      type:
        EVENT_TYPES.COMMENT_UPDATED,

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

        comment:
          updatedComment

      }

    });


  await publishApplicationEvent(
    event
  );


  return updatedComment;
};


/*
|--------------------------------------------------------------------------
| DELETE COMMENT
|--------------------------------------------------------------------------
*/

const deleteComment = async (
  commentId,
  userId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      commentId
    )
  ) {

    const error =
      new Error(
        "Invalid comment ID"
      );

    error.statusCode = 400;

    throw error;
  }


  /*
   * Find comment
   */

  const comment =
    await commentRepository.findCommentById(
      commentId
    );


  if (!comment) {

    const error =
      new Error(
        "Comment not found"
      );

    error.statusCode = 404;

    throw error;
  }


  /*
   * Find task
   */

  const task =
    await taskRepository.findTaskById(
      comment.taskId
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
        "You are not a member of this workspace"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Author can delete.
   *
   * OWNER / ADMIN can also delete.
   */

  const isAuthor =
    String(
      comment.authorId
    ) ===
    String(
      userId
    );


  const isAdmin =
    DELETE_ROLES.includes(
      membership.role
    );


  if (
    !isAuthor &&
    !isAdmin
  ) {

    const error =
      new Error(
        "You do not have permission to delete this comment"
      );

    error.statusCode = 403;

    throw error;
  }


  /*
   * Delete from MongoDB FIRST.
   */

  await commentRepository.deleteComment(
    commentId
  );


  /*
   * MongoDB succeeded.
   *
   * Do NOT send deleted comment.
   *
   * entityId = taskId
   * payload = {}
   *
   * commentId goes in payload so
   * frontend knows exactly what to remove.
   */

  const event =
    createEvent({

      type:
        EVENT_TYPES.COMMENT_DELETED,

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

        commentId:
          String(
            commentId
          )

      }

    });


  await publishApplicationEvent(
    event
  );


  return {

    id:
      commentId,

    message:
      "Comment deleted successfully"

  };
};


module.exports = {

  createComment,

  getCommentsByTask,

  updateComment,

  deleteComment

};