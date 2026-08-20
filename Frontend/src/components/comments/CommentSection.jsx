import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import CommentList
  from "./CommentList";

import CommentInput
  from "./CommentInput";

import useWebSocket
  from "../../hooks/useWebSocket";

import {
  WS_EVENT_TYPES
} from "../../websocket/websocketEvents";

import {
  getCommentsByTask,
  createComment
} from "../../services/commentService";

import "./comments.css";


const CommentSection = ({
  taskId,
  projectId,
  workspaceId,
  currentUser
}) => {

  const {
    send,
    subscribe
  } = useWebSocket();


  const [
    comments,
    setComments
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    sending,
    setSending
  ] = useState(false);


  const [
    error,
    setError
  ] = useState("");


  /*
   * =====================================================
   * Typing state
   * =====================================================
   */

  const [
    typingUsers,
    setTypingUsers
  ] = useState([]);


  const typingTimerRef =
    useRef(null);


  const typingActiveRef =
    useRef(false);


  /*
   * =====================================================
   * Load comments
   * =====================================================
   */

  const loadComments =
    useCallback(
      async () => {

        if (!taskId) {
          return;
        }

        try {

          setLoading(true);
          setError("");

          const response =
            await getCommentsByTask(
              taskId
            );

          setComments(
            response?.data || []
          );

        } catch (error) {

          console.error(
            "Failed to load comments:",
            error
          );

          setError(
            error?.response?.data?.message ||
            "Failed to load comments."
          );

        } finally {

          setLoading(false);

        }

      },
      [taskId]
    );


  useEffect(() => {

    loadComments();

  }, [loadComments]);


  /*
   * =====================================================
   * COMMENT_CREATED
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.COMMENT_CREATED,
        (event) => {

          if (
            String(event.projectId) !==
            String(projectId)
          ) {
            return;
          }

          const comment =
            event.payload?.comment;

          if (!comment) {
            return;
          }

          setComments(
            (current) => {

              const exists =
                current.some(
                  (item) =>
                    String(item._id) ===
                    String(comment._id)
                );

              if (exists) {
                return current;
              }

              return [
                ...current,
                comment
              ];

            }
          );

        }
      );


    return unsubscribe;

  }, [
    projectId,
    subscribe
  ]);


  /*
   * =====================================================
   * COMMENT_UPDATED
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.COMMENT_UPDATED,
        (event) => {

          if (
            String(event.projectId) !==
            String(projectId)
          ) {
            return;
          }

          const comment =
            event.payload?.comment;

          if (!comment) {
            return;
          }

          setComments(
            (current) =>
              current.map(
                (item) =>
                  String(item._id) ===
                  String(comment._id)
                    ? comment
                    : item
              )
          );

        }
      );


    return unsubscribe;

  }, [
    projectId,
    subscribe
  ]);


  /*
   * =====================================================
   * COMMENT_DELETED
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.COMMENT_DELETED,
        (event) => {

          if (
            String(event.projectId) !==
            String(projectId)
          ) {
            return;
          }

          const commentId =
            String(event.entityId);

          setComments(
            (current) =>
              current.filter(
                (comment) =>
                  String(comment._id) !==
                  commentId
              )
          );

        }
      );


    return unsubscribe;

  }, [
    projectId,
    subscribe
  ]);


  /*
   * =====================================================
   * TYPING_STARTED
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.TYPING_STARTED,
        (event) => {

          if (
            String(event.projectId) !==
            String(projectId)
          ) {
            return;
          }

          if (
            String(event.entityId) !==
            String(taskId)
          ) {
            return;
          }

          const user =
            event.payload;

          if (!user?.userId) {
            return;
          }


          /*
           * Don't show our own
           * typing indicator.
           */

          if (
            currentUser?.id &&
            String(user.userId) ===
            String(currentUser.id)
          ) {
            return;
          }


          setTypingUsers(
            (current) => {

              const exists =
                current.some(
                  (item) =>
                    String(item.userId) ===
                    String(user.userId)
                );

              if (exists) {
                return current;
              }

              return [
                ...current,
                user
              ];

            }
          );

        }
      );


    return unsubscribe;

  }, [
    projectId,
    taskId,
    currentUser,
    subscribe
  ]);


  /*
   * =====================================================
   * TYPING_STOPPED
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.TYPING_STOPPED,
        (event) => {

          if (
            String(event.projectId) !==
            String(projectId)
          ) {
            return;
          }

          if (
            String(event.entityId) !==
            String(taskId)
          ) {
            return;
          }

          const userId =
            event.payload?.userId;

          if (!userId) {
            return;
          }

          setTypingUsers(
            (current) =>
              current.filter(
                (user) =>
                  String(user.userId) !==
                  String(userId)
              )
          );

        }
      );


    return unsubscribe;

  }, [
    projectId,
    taskId,
    subscribe
  ]);


  /*
   * =====================================================
   * Send TYPING_STARTED
   * =====================================================
   */

  const sendTypingStarted =
    useCallback(() => {

      if (
        !workspaceId ||
        !projectId ||
        !taskId ||
        !currentUser?.id
      ) {
        return;
      }

      if (typingActiveRef.current) {
        return;
      }

      typingActiveRef.current =
        true;


      send({

        type:
          WS_EVENT_TYPES.TYPING_STARTED,

        workspaceId:
          String(workspaceId),

        projectId:
          String(projectId),

        entityId:
          String(taskId),

        actorId:
          String(currentUser.id),

        payload: {

          userId:
            String(currentUser.id),

          name:
            currentUser.name

        }

      });

    }, [
      send,
      workspaceId,
      projectId,
      taskId,
      currentUser
    ]);


  /*
   * =====================================================
   * Send TYPING_STOPPED
   * =====================================================
   */

  const sendTypingStopped =
    useCallback(() => {

      if (
        !workspaceId ||
        !projectId ||
        !taskId ||
        !currentUser?.id
      ) {
        return;
      }

      if (
        !typingActiveRef.current
      ) {
        return;
      }

      typingActiveRef.current =
        false;


      send({

        type:
          WS_EVENT_TYPES.TYPING_STOPPED,

        workspaceId:
          String(workspaceId),

        projectId:
          String(projectId),

        entityId:
          String(taskId),

        actorId:
          String(currentUser.id),

        payload: {

          userId:
            String(currentUser.id),

          name:
            currentUser.name

        }

      });

    }, [
      send,
      workspaceId,
      projectId,
      taskId,
      currentUser
    ]);


  /*
   * =====================================================
   * Typing debounce
   * =====================================================
   */

  const handleTyping =
    useCallback(
      (value) => {

        /*
         * Empty input means
         * typing has stopped.
         */

        if (!value.trim()) {

          clearTimeout(
            typingTimerRef.current
          );

          typingTimerRef.current =
            null;

          sendTypingStopped();

          return;
        }


        /*
         * First character:
         * send TYPING_STARTED.
         */

        sendTypingStarted();


        /*
         * Reset timer on every
         * subsequent keypress.
         */

        clearTimeout(
          typingTimerRef.current
        );


        typingTimerRef.current =
          setTimeout(() => {

            sendTypingStopped();

            typingTimerRef.current =
              null;

          }, 1000);

      },
      [
        sendTypingStarted,
        sendTypingStopped
      ]
    );


  /*
   * =====================================================
   * Cleanup typing timer
   * =====================================================
   */

  useEffect(() => {

    return () => {

      clearTimeout(
        typingTimerRef.current
      );

      typingTimerRef.current =
        null;

    };

  }, []);


  /*
   * =====================================================
   * Create comment
   * =====================================================
   */

  const handleCreateComment =
    async (content) => {

      try {

        setSending(true);
        setError("");

        /*
         * Stop typing before sending.
         */

        sendTypingStopped();


        const response =
          await createComment(
            taskId,
            content
          );


        const newComment =
          response?.data;


        if (!newComment) {

          throw new Error(
            "Failed to create comment."
          );

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

          <h3>
            Comments
          </h3>

          <span>
            {comments.length}{" "}
            {
              comments.length === 1
                ? "comment"
                : "comments"
            }
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


      {typingUsers.length > 0 && (

        <div className="typing-indicator">

          {
            typingUsers.length === 1
              ? `${typingUsers[0].name} is typing...`
              : `${typingUsers.length} people are typing...`
          }

        </div>

      )}


      <CommentList
        comments={comments}
        loading={loading}
      />


      <CommentInput
        onSubmit={
          handleCreateComment
        }

        onTyping={
          handleTyping
        }

        loading={sending}
      />

    </section>

  );

};


export default CommentSection;