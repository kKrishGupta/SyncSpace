const {
  subscribeToWorkspaceEvents
} = require("./eventSubscriber");


const initializeRedisEventHandler =
  async (
    workspaceIds = []
  ) => {

    if (
      !Array.isArray(
        workspaceIds
      )
    ) {

      throw new Error(
        "workspaceIds must be an array"
      );

    }


    for (
      const workspaceId
      of workspaceIds
    ) {

      await subscribeToWorkspaceEvents(
        workspaceId
      );

    }

  };


module.exports =
  initializeRedisEventHandler;