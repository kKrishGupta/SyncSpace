const {
  randomUUID
} = require("crypto");


const createEvent = ({
  type,
  workspaceId = null,
  projectId = null,
  entityId = null,
  actorId,
  payload = {}
}) => {

  if (
    !type
  ) {

    throw new Error(
      "Event type is required"
    );

  }


  if (
    !actorId
  ) {

    throw new Error(
      "Actor ID is required"
    );

  }


  if (
    !workspaceId
  ) {

    throw new Error(
      "Workspace ID is required"
    );

  }


  return {

    eventId:
      randomUUID(),

    type,

    workspaceId:
      String(
        workspaceId
      ),

    projectId:
      projectId
        ? String(projectId)
        : null,

    entityId:
      entityId
        ? String(entityId)
        : null,

    actorId:
      String(
        actorId
      ),

    timestamp:
      new Date()
        .toISOString(),

    payload

  };

};


module.exports = {
  createEvent
};