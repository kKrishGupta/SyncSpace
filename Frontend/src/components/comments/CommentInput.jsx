import React, { useState } from "react";

const CommentInput = ({
  onSubmit,
  loading = false,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || loading) {
      return;
    }

    try {
      await onSubmit(trimmedContent);
      setContent("");
    } catch (error) {
      // Parent handles the actual error UI.
      console.error("Failed to create comment:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form
      className="comment-input-wrapper"
      onSubmit={handleSubmit}
    >
      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder="Write a comment..."
        rows={3}
        maxLength={2000}
        disabled={loading}
      />

      <div className="comment-input-footer">
        <span className="comment-input-hint">
          Enter to send · Shift + Enter for new line
        </span>

        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="comment-send-button"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
};

export default CommentInput;