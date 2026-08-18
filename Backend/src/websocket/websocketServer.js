const WebSocket = require("ws");
const logger = require("../utils/logger");
const connectionManager = require("./connectionManager");
const devIdentity = require("./devIdentity");
const EVENT_TYPES =
  require("./eventTypes");

const initializeWebSocketServer = (server) => {
  const wss = new WebSocket.Server({
    server,
    path: "/ws"
  });

  wss.on("connection", (ws, req) => {
     const connectionUser = {
      id: devIdentity.id,
      name: devIdentity.name
    };
    ws.connectionUser = connectionUser;
    connectionManager.add(
      connectionUser.id,
      ws
    );
    logger.info(`New WebSocket connection from ${req.socket.remoteAddress}`);

    ws.send(
      JSON.stringify({
        type: EVENT_TYPES.CONNECTED,
        message: "WebSocket connected successfully",
        userId: connectionUser.id
      })
    );

    ws.on("message", (message) => {
      try {
        const data =
          JSON.parse(message.toString());

        logger.info("WebSocket message:", data);

        if (
          data.type === EVENT_TYPES.PING
        ) {
          ws.send(
            JSON.stringify({
              type: EVENT_TYPES.PONG,
              timestamp: Date.now()
            })
          );
        }
      } catch (error) {
        logger.error("Invalid WebSocket message:", error.message);

        ws.send(
          JSON.stringify({
            type: "ERROR",
            message: "Invalid WebSocket message"
          })
        );
      }
    });

    ws.on("close", () => {
      connectionManager.remove(
        connectionUser.id,
        ws
      );

      logger.info("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
  logger.error(
    `WebSocket error for ${connectionUser.name}: ${error.message}`
  );

  connectionManager.remove(
    connectionUser.id,
    ws
  );
});
  });

  logger.info("WebSocket server initialized at /ws");
  return wss;
};

module.exports =
  initializeWebSocketServer;