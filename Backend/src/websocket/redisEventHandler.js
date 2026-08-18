const {
  subscribeToEvents
} = require("./redisPubSub");

const initializeRedisEventHandler =
  async () => {

    await subscribeToEvents(
      (event) => {

        console.log(
          "Redis event received:",
          event
        );

        /*
         * Later:
         *
         * connectionManager.broadcast(event)
         *
         * or workspace-specific delivery.
         */

      }
    );

  };

module.exports =
  initializeRedisEventHandler;