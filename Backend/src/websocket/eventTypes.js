const EVENT_TYPES = {

  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  */
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",

  /*
  |--------------------------------------------------------------------------
  | Ping / Pong
  |--------------------------------------------------------------------------
  */
  PING: "PING",
  PONG: "PONG",

  /*
  |--------------------------------------------------------------------------
  | Workspace & Room Commands
  |--------------------------------------------------------------------------
  */
  WORKSPACE_JOIN: "WORKSPACE_JOIN",
  WORKSPACE_LEAVE: "WORKSPACE_LEAVE",
  WORKSPACE_MEMBER_ADDED: "WORKSPACE_MEMBER_ADDED",
  WORKSPACE_MEMBER_UPDATED: "WORKSPACE_MEMBER_UPDATED",
  WORKSPACE_MEMBER_REMOVED: "WORKSPACE_MEMBER_REMOVED",

  /*
  |--------------------------------------------------------------------------
  | Presence & Live Active File / Cursor
  |--------------------------------------------------------------------------
  */
  PRESENCE_HEARTBEAT: "PRESENCE_HEARTBEAT",
  USER_ONLINE: "USER_ONLINE",
  USER_OFFLINE: "USER_OFFLINE",
  PRESENCE_SNAPSHOT: "PRESENCE_SNAPSHOT",
  FILE_OPENED: "FILE_OPENED",
  FILE_CLOSED: "FILE_CLOSED",
  CURSOR_MOVED: "CURSOR_MOVED",

  /*
  |--------------------------------------------------------------------------
  | Real-Time Code Collaboration
  |--------------------------------------------------------------------------
  */
  TYPING_STARTED: "TYPING_STARTED",
  TYPING_STOPPED: "TYPING_STOPPED",
  FILE_EDITED: "FILE_EDITED",

  /*
  |--------------------------------------------------------------------------
  | Task, Review, Comment, Chat, Blocker Events
  |--------------------------------------------------------------------------
  */
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_MOVED: "TASK_MOVED",
  TASK_DELETED: "TASK_DELETED",

  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_UPDATED: "COMMENT_UPDATED",
  COMMENT_DELETED: "COMMENT_DELETED",
  CODE_COMMENT_CREATED: "CODE_COMMENT_CREATED",

  CHAT_MESSAGE_CREATED: "CHAT_MESSAGE_CREATED",
  REVIEW_CREATED: "REVIEW_CREATED",
  REVIEW_UPDATED: "REVIEW_UPDATED",
  BLOCKER_CREATED: "BLOCKER_CREATED"
};

module.exports = EVENT_TYPES;