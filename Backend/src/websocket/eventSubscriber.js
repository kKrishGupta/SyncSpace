const {
  subscribeToWorkspace
} = require("./redisPubSub");


const connectionManager =
  require("./connectionManager");


const logger =
  require("../utils/logger");


/*
|--------------------------------------------------------------------------
| Allowed server events
|--------------------------------------------------------------------------
*/

const EVENT_TYPES =
  require("./eventTypes");


const SERVER_EVENTS =
  new Set([
    EVENT_TYPES.USER_ONLINE,
    EVENT_TYPES.USER_OFFLINE,
    EVENT_TYPES.PRESENCE_SNAPSHOT,
    EVENT_TYPES.FILE_OPENED,
    EVENT_TYPES.FILE_CLOSED,
    EVENT_TYPES.CURSOR_MOVED,
    EVENT_TYPES.FILE_EDITED,
    EVENT_TYPES.TASK_CREATED,
    EVENT_TYPES.TASK_UPDATED,
    EVENT_TYPES.TASK_MOVED,
    EVENT_TYPES.TASK_DELETED,
    EVENT_TYPES.COMMENT_CREATED,
    EVENT_TYPES.COMMENT_UPDATED,
    EVENT_TYPES.COMMENT_DELETED,
    EVENT_TYPES.CODE_COMMENT_CREATED,
    EVENT_TYPES.CHAT_MESSAGE_CREATED,
    EVENT_TYPES.REVIEW_CREATED,
    EVENT_TYPES.REVIEW_UPDATED,
    EVENT_TYPES.BLOCKER_CREATED,
    EVENT_TYPES.TYPING_STARTED,
    EVENT_TYPES.TYPING_STOPPED
  ]);


/*
|--------------------------------------------------------------------------
| Handle Redis event
|--------------------------------------------------------------------------
*/

const handleRedisEvent =
  (
    event
  ) => {

    if (
      !event
    ) {

      logger.warn(
        "Received empty Redis event"
      );

      return;

    }


    if (
      !event.eventId
    ) {

      logger.warn(
        "Received Redis event without eventId"
      );

      return;

    }


    if (
      !event.type
    ) {

      logger.warn(
        "Received Redis event without type"
      );

      return;

    }


    if (
      !SERVER_EVENTS.has(
        event.type
      )
    ) {

      logger.warn(
        {
          eventId:
            event.eventId,

          type:
            event.type

        },
        "Rejected unknown Redis event type"
      );

      return;

    }


    if (
      !event.workspaceId
    ) {

      logger.warn(
        {
          eventId:
            event.eventId,

          type:
            event.type

        },
        "Received event without workspaceId"
      );

      return;

    }


    if (
      !event.actorId
    ) {

      logger.warn(
        {
          eventId:
            event.eventId,

          type:
            event.type

        },
        "Received event without actorId"
      );

      return;

    }


    logger.info(
      {
        eventId:
          event.eventId,

        type:
          event.type,

        workspaceId:
          event.workspaceId,

        projectId:
          event.projectId,

        entityId:
          event.entityId,

        actorId:
          event.actorId

      },
      "Redis event received"
    );


    /*
     * SECURITY BOUNDARY
     *
     * ConnectionManager sends this event
     * only to sockets that explicitly
     * joined this workspace after
     * membership authorization.
     */

    connectionManager
      .broadcastToWorkspace(
        event.workspaceId,
        event
      );

  };


/*
|--------------------------------------------------------------------------
| Subscribe
|--------------------------------------------------------------------------
*/

const subscribeToWorkspaceEvents =
  async (
    workspaceId
  ) => {

    if (
      !workspaceId
    ) {

      throw new Error(
        "workspaceId is required"
      );

    }


    await subscribeToWorkspace(
      workspaceId,
      handleRedisEvent
    );


    logger.info(
      {
        workspaceId
      },
      "Subscribed to workspace events"
    );

  };


module.exports = {

  handleRedisEvent,

  subscribeToWorkspaceEvents

};