const EVENT_TYPES = {
  // ==========================================
  // Connection events
  // ==========================================

  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",

  PING: "PING",
  PONG: "PONG",

  // ==========================================
  // Task events
  // ==========================================

  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_MOVED: "TASK_MOVED",
  TASK_DELETED: "TASK_DELETED",

  // ==========================================
  // Comment events
  // ==========================================

  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_UPDATED: "COMMENT_UPDATED",
  COMMENT_DELETED: "COMMENT_DELETED",

  // ==========================================
  // Presence events
  // ==========================================

  USER_ONLINE: "USER_ONLINE",
  USER_OFFLINE: "USER_OFFLINE",

  // ==========================================
  // Collaboration events
  // ==========================================

  TYPING_STARTED: "TYPING_STARTED",
  TYPING_STOPPED: "TYPING_STOPPED"
};

module.exports = EVENT_TYPES;