const Comment = require("../models/Comment");


/*
|--------------------------------------------------------------------------
| CREATE COMMENT
|--------------------------------------------------------------------------
*/

const createComment = async (commentData) => {
  return await Comment.create(commentData);
};


/*
|--------------------------------------------------------------------------
| FIND COMMENT BY ID
|--------------------------------------------------------------------------
*/

const findCommentById = async (commentId) => {
  return await Comment.findById(commentId);
};


/*
|--------------------------------------------------------------------------
| FIND COMMENTS BY TASK
|--------------------------------------------------------------------------
*/

const findCommentsByTask = async (taskId) => {

  return await Comment
    .find({
      taskId
    })
    .sort({
      createdAt: 1
    })
    .lean();

};


/*
|--------------------------------------------------------------------------
| UPDATE COMMENT
|--------------------------------------------------------------------------
*/

const updateComment = async (
  commentId,
  updateData
) => {

  return await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: updateData
    },
    {
      new: true,
      runValidators: true
    }
  );

};


/*
|--------------------------------------------------------------------------
| DELETE COMMENT
|--------------------------------------------------------------------------
*/

const deleteComment = async (commentId) => {

  return await Comment.findByIdAndDelete(
    commentId
  );

};


module.exports = {
  createComment,
  findCommentById,
  findCommentsByTask,
  updateComment,
  deleteComment
};