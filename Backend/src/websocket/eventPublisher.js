const {
  publishEvent
} = require("./redisPubSub");


const publishApplicationEvent =
  async (
    event
  ) => {

    if (
      !event
    ) {

      throw new Error(
        "Event is required to publish"
      );

    }


    if (
      !event.eventId
    ) {

      throw new Error(
        "eventId is required to publish"
      );

    }


    if (
      !event.type
    ) {

      throw new Error(
        "Event type is required to publish"
      );

    }


    if (
      !event.workspaceId
    ) {

      throw new Error(
        "workspaceId is required to publish"
      );

    }


    if (
      !event.actorId
    ) {

      throw new Error(
        "actorId is required to publish"
      );

    }


    if (
      !event.timestamp
    ) {

      throw new Error(
        "timestamp is required to publish"
      );

    }


    if (
      !event.payload ||
      typeof event.payload !==
        "object"
    ) {

      throw new Error(
        "Event payload must be an object"
      );

    }


    return await publishEvent(
      event
    );

  };


module.exports = {
  publishApplicationEvent
};