export const WS_EVENT_TYPES = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",

  PING: "PING",
  PONG: "PONG",

  // =========================
  // Workspace
  // =========================

  WORKSPACE_JOIN: "WORKSPACE_JOIN",
  WORKSPACE_LEAVE: "WORKSPACE_LEAVE",

  // =========================
  // Presence
  // =========================

  PRESENCE_HEARTBEAT: "PRESENCE_HEARTBEAT",
  PRESENCE_SNAPSHOT: "PRESENCE_SNAPSHOT",

  USER_ONLINE: "USER_ONLINE",
  USER_OFFLINE: "USER_OFFLINE",

  // =========================
  // Tasks
  // =========================

  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_MOVED: "TASK_MOVED",
  TASK_DELETED: "TASK_DELETED",

  // =========================
  // Comments
  // =========================

  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_UPDATED: "COMMENT_UPDATED",
  COMMENT_DELETED: "COMMENT_DELETED",

  // =========================
  // Typing
  // =========================

  TYPING_STARTED: "TYPING_STARTED",
  TYPING_STOPPED: "TYPING_STOPPED"
};

export default WS_EVENT_TYPES;