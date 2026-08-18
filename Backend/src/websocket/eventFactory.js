const { randomUUID } = require("crypto");

const createEvent = ({
  type,
  workspaceId = null,
  projectId = null,
  entityId = null,
  actorId,
  payload = {}
}) => {
  if (!type) {
    throw new Error("Event type is required");
  }

  if (!actorId) {
    throw new Error("Actor ID is required");
  }

  return {
    eventId: randomUUID(),
    type,
    workspaceId,
    projectId,
    entityId,
    actorId,
    timestamp: new Date().toISOString(),
    payload
  };
};

module.exports = {
  createEvent
};