const {redisPublisher, redisSubscriber} = require("../config/redis");

const getWorkspaceChannel = (workspaceId) => {
  if (!workspaceId) {
    throw new Error(
      "workspaceId is required to create a Redis channel"
    );
  }

  return `syncspace:workspace:${workspaceId}`;
};


const publishEvent = async (event) => {
  if (!event) {
    throw new Error(
      "Cannot publish empty event"
    );
  }

  if (!event.workspaceId) {
    throw new Error(
      "workspaceId is required for workspace event"
    );
  }

  const channel = getWorkspaceChannel(event.workspaceId);

  const message = JSON.stringify(event);

  await redisPublisher.publish(
    channel,
    message
  );
  return channel;
};

const subscribeToWorkspace = async (
  workspaceId,
  onEvent
) => {
  if (!workspaceId) {
    throw new Error(
      "workspaceId is required"
    );
  }

  if (
    typeof onEvent !== "function"
  ) {
    throw new Error(
      "Event handler must be a function"
    );
  }

  const channel = getWorkspaceChannel(workspaceId);
  await redisSubscriber.subscribe(
    channel, (message) => {
      try {
        const event = JSON.parse(message);
        onEvent(event);
      } catch (error) {
        logger.error(
          "Invalid Redis event:",
          error.message
        );
      }
    }
  );
  logger.info(
    `Subscribed to Redis channel: ${channel}`
  );
  return channel;
};

const unsubscribeFromWorkspace = async (
  workspaceId
) => {
  const channel =
    getWorkspaceChannel(workspaceId);

  await redisSubscriber.unsubscribe(
    channel
  );

  logger.info(
    `Unsubscribed from Redis channel: ${channel}`
  );
};


module.exports = {
  getWorkspaceChannel,
  publishEvent,
  subscribeToWorkspace,
  unsubscribeFromWorkspace
};