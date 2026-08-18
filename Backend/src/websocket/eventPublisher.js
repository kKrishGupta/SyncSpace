const {publishEvent } = require('./redisPubSub');

const publishApplicationEvent = async (event) => {
  if (!event) {
    throw new Error(
      "Event is required to publish"
    );
  }
  if(!event.type){
    throw new Error(
      "Event type is required to publish"
    );
  }
  if(!event.workspaceId){
    throw new Error(
      "workspaceId is required to publish"
    );
  }
  const channel = await publishEvent(event);
  return channel;
}
  module.exports = {
    publishApplicationEvent
  };
  