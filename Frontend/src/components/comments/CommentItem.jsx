import React from "react";

const CommentItem = ({ comment }) => {
  const authorName =
    comment.author?.name ||
    comment.author?.username ||
    comment.authorName ||
    "Unknown user";

  const createdAt = comment.createdAt
    ? new Date(comment.createdAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <article className="comment-item">
      <div className="comment-avatar">
        {authorName.charAt(0).toUpperCase()}
      </div>

      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">
            {authorName}
          </span>

          {createdAt && (
            <span className="comment-time">
              {createdAt}
            </span>
          )}
        </div>

        <p className="comment-text">
          {comment.content}
        </p>
      </div>
    </article>
  );
};

export default CommentItem;