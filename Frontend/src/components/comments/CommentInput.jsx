import React, {
  useState
} from "react";


const CommentInput = ({
  onSubmit,
  onTyping,
  loading = false,
}) => {

  const [
    content,
    setContent
  ] = useState("");


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      const trimmedContent =
        content.trim();

      if (
        !trimmedContent ||
        loading
      ) {
        return;
      }

      try {

        await onSubmit(
          trimmedContent
        );

        setContent("");

        /*
         * Make sure typing state
         * stops after sending.
         */

        onTyping?.("");

      } catch (error) {

        console.error(
          "Failed to create comment:",
          error
        );

      }

    };


  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

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

        onChange={(event) => {

          const value =
            event.target.value;

          setContent(value);

          onTyping?.(value);

        }}

        onKeyDown={
          handleKeyDown
        }

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

          disabled={
            !content.trim() ||
            loading
          }

          className="comment-send-button"
        >

          {
            loading
              ? "Sending..."
              : "Send"
          }

        </button>

      </div>

    </form>
  );

};


export default CommentInput;