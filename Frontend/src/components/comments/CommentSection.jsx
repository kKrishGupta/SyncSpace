import React, { useCallback, useEffect, useState } from "react";

import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

import {
  getCommentsByTask,
  createComment,
} from "../../services/commentService";
import "./comments.css";
const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    if (!taskId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getCommentsByTask(taskId);

      setComments(response?.data || []);
    } catch (error) {
      console.error("Failed to load comments:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleCreateComment = async (content) => {
    try {
      setSending(true);
      setError("");

      const response = await createComment(
        taskId,
        content
      );

      const newComment = response?.data;

      if (newComment) {
        setComments((currentComments) => [
          ...currentComments,
          newComment,
        ]);
      }
    } catch (error) {
      console.error(
        "Failed to create comment:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to create comment."
      );

      throw error;
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="comments-section">
      <div className="comments-section-header">
        <div>
          <h3>Comments</h3>

          <span>
            {comments.length}{" "}
            {comments.length === 1
              ? "comment"
              : "comments"}
          </span>
        </div>
      </div>

      {error && (
        <div className="comments-error">
          {error}

          <button
            type="button"
            onClick={loadComments}
          >
            Retry
          </button>
        </div>
      )}

      <CommentList
        comments={comments}
        loading={loading}
      />

      <CommentInput
        onSubmit={handleCreateComment}
        loading={sending}
      />
    </section>
  );
};

export default CommentSection;