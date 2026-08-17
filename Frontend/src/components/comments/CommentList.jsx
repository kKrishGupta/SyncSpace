import React from "react";
import CommentItem from "./CommentItem";

const CommentList = ({ comments = [], loading = false }) => {
  if (loading) {
    return (
      <div className="comments-loading">
        Loading comments...
      </div>
    );
  }

  if (!comments.length) {
    return (
      <div className="comments-empty">
        <div className="comments-empty-icon">
          💬
        </div>

        <p>No comments yet.</p>

        <span>
          Start the discussion for this task.
        </span>
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id || comment.id}
          comment={comment}
        />
      ))}
    </div>
  );
};

export default CommentList;