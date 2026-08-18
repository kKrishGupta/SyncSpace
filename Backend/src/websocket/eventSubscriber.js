const {
  subscribeToWorkspace
} = require("./redisPubSub");

const connectionManager =
  require("./connectionManager");

const logger =
  require("../utils/logger");


/*
|--------------------------------------------------------------------------
| Handle Redis Event
|--------------------------------------------------------------------------
*/

const handleRedisEvent = (event) => {
  if (!event) {
    logger.warn(
      "Received empty Redis event"
    );

    return;
  }

  if (!event.type) {
    logger.warn(
      "Received Redis event without type"
    );

    return;
  }

  if (!event.workspaceId) {
    logger.warn(
      {
        eventId: event.eventId,
        type: event.type
      },
      "Received event without workspaceId"
    );

    return;
  }

  logger.info(
    {
      eventId: event.eventId,
      type: event.type,
      workspaceId: event.workspaceId,
      entityId: event.entityId,
      actorId: event.actorId
    },
    "Redis event received"
  );


  /*
   * Send the event to clients connected
   * to this workspace.
   *
   * This method will be implemented/used
   * by the connection manager.
   */

  connectionManager.broadcastToWorkspace(
    event.workspaceId,
    event
  );
};


/*
|--------------------------------------------------------------------------
| Subscribe to Workspace
|--------------------------------------------------------------------------
*/

const subscribeToWorkspaceEvents = async (
  workspaceId
) => {

  if (!workspaceId) {
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