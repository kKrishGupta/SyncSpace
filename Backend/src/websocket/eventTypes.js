const EVENT_TYPES = {

  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  */

  CONNECTED:
    "CONNECTED",

  DISCONNECTED:
    "DISCONNECTED",


  /*
  |--------------------------------------------------------------------------
  | Ping / Pong
  |--------------------------------------------------------------------------
  */

  PING:
    "PING",

  PONG:
    "PONG",


  /*
  |--------------------------------------------------------------------------
  | Workspace commands
  |--------------------------------------------------------------------------
  */

  WORKSPACE_JOIN:
    "WORKSPACE_JOIN",

  WORKSPACE_LEAVE:
    "WORKSPACE_LEAVE",


  /*
  |--------------------------------------------------------------------------
  | Presence
  |--------------------------------------------------------------------------
  */

  PRESENCE_HEARTBEAT:
    "PRESENCE_HEARTBEAT",

  USER_ONLINE:
    "USER_ONLINE",

  USER_OFFLINE:
    "USER_OFFLINE",

  PRESENCE_SNAPSHOT:
    "PRESENCE_SNAPSHOT",


  /*
  |--------------------------------------------------------------------------
  | Collaboration commands
  |--------------------------------------------------------------------------
  */

  TYPING_STARTED:
    "TYPING_STARTED",

  TYPING_STOPPED:
    "TYPING_STOPPED",


  /*
  |--------------------------------------------------------------------------
  | Task events
  |--------------------------------------------------------------------------
  */

  TASK_CREATED:
    "TASK_CREATED",

  TASK_UPDATED:
    "TASK_UPDATED",

  TASK_MOVED:
    "TASK_MOVED",

  TASK_DELETED:
    "TASK_DELETED",


  /*
  |--------------------------------------------------------------------------
  | Comment events
  |--------------------------------------------------------------------------
  */

  COMMENT_CREATED:
    "COMMENT_CREATED",

  COMMENT_UPDATED:
    "COMMENT_UPDATED",

  COMMENT_DELETED:
    "COMMENT_DELETED"

};


module.exports =
  EVENT_TYPES;