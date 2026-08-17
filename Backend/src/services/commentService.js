const mongoose =
  require("mongoose");

const taskRepository =
  require("../repositories/taskRepository");

const commentRepository =
  require("../repositories/commentRepository");

const workspaceMemberRepository =
  require("../repositories/workspaceMemberRepository");


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
   * Check workspace membership
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
   * If replying to another comment,
   * validate the parent.
   */

  if (parentCommentId) {

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
     * Parent must belong to
     * the same task.
     */

    if (
      parentComment.taskId.toString() !==
      taskId.toString()
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
   * Create comment
   */

  return await commentRepository.createComment({
    taskId: task._id,
    authorId: userId,
    content: content.trim(),
    mentions,
    parentCommentId
  });
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
   * Find the task so we can
   * verify workspace membership.
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
   * Only comment author can edit
   * their own comment.
   */

  if (
    comment.authorId.toString() !==
    userId.toString()
  ) {

    const error =
      new Error(
        "You can only edit your own comments"
      );

    error.statusCode = 403;

    throw error;
  }


  return await commentRepository.updateComment(
    commentId,
    {
      content: content.trim()
    }
  );
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
    comment.authorId.toString() ===
    userId.toString();


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


  await commentRepository.deleteComment(
    commentId
  );


  return {
    id: commentId,
    message: "Comment deleted successfully"
  };
};


module.exports = {
  createComment,
  getCommentsByTask,
  updateComment,
  deleteComment
};