const WebSocket =
  require("ws");


const logger =
  require("../utils/logger");


const connectionManager =
  require("./connectionManager");


const EVENT_TYPES =
  require("./eventTypes");


const presenceService =
  require("./presenceService");


const {
  createEvent
} =
  require("./eventFactory");


const {
  publishApplicationEvent
} =
  require("./eventPublisher");


const {
  validateIncomingEvent
} =
  require("./websocketEventValidator");


/*
|--------------------------------------------------------------------------
| Send error to client
|--------------------------------------------------------------------------
*/

const sendError =
  (
    ws,
    message,
    statusCode = 400
  ) => {

    if (
      ws.readyState !==
      WebSocket.OPEN
    ) {

      return;

    }


    ws.send(
      JSON.stringify({

        type:
          "ERROR",

        statusCode,

        message

      })
    );

  };


/*
|--------------------------------------------------------------------------
| Initialize WebSocket server
|--------------------------------------------------------------------------
*/

const initializeWebSocketServer =
  (
    server
  ) => {

    const wss =
      new WebSocket.Server({

        server,

        path:
          "/ws"

      });


    /*
    |--------------------------------------------------------------------------
    | New connection
    |--------------------------------------------------------------------------
    */

    wss.on(
      "connection",
      async (
        ws,
        req
      ) => {

        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        */
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get("token");

        if (!token) {
          logger.error("WebSocket connection attempt without token");
          ws.close(1008, "Authentication token required");
          return;
        }

        let connectionUser;
        try {
          const jwt = require("jsonwebtoken");
          const User = require("../models/User");
          const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
          
          const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
          const user = await User.findById(decoded.id);

          if (!user) {
            throw new Error("User not found");
          }

          connectionUser = {
            id: String(user._id),
            name: user.name
          };
          ws.connectionUser = connectionUser;
        } catch (error) {
          logger.error({ error: error.message }, "WebSocket authentication failed");
          ws.close(1008, "Invalid or expired token");
          return;
        }


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT SECURITY CHANGE
        |--------------------------------------------------------------------------
        |
        | Do NOT automatically add DEV_WORKSPACE_ID.
        |
        | New sockets start with:
        |
        | ws.workspaceIds = Set()
        |
        | Workspace access is granted only
        | after WORKSPACE_JOIN is authorized.
        |
        |--------------------------------------------------------------------------
        */

        connectionManager.add(
          connectionUser.id,
          ws,
          []
        );


        /*
        |--------------------------------------------------------------------------
        | Socket state
        |--------------------------------------------------------------------------
        */

        ws.workspaceIds =
          new Set();


        /*
        |--------------------------------------------------------------------------
        | Connection log
        |--------------------------------------------------------------------------
        */

        logger.info(
          {
            userId:
              connectionUser.id,

            remoteAddress:
              req.socket.remoteAddress

          },
          "New WebSocket connection"
        );


        /*
        |--------------------------------------------------------------------------
        | CONNECTED
        |--------------------------------------------------------------------------
        */

        ws.send(
          JSON.stringify({

            type:
              EVENT_TYPES.CONNECTED,

            message:
              "WebSocket connected successfully",

            userId:
              connectionUser.id

          })
        );


        /*
        |--------------------------------------------------------------------------
        | MESSAGE
        |--------------------------------------------------------------------------
        */

        ws.on(
          "message",
          async (
            message
          ) => {

            try {

              /*
              |--------------------------------------------------------------------------
              | Parse JSON
              |--------------------------------------------------------------------------
              */

              let data;


              try {

                data =
                  JSON.parse(
                    message.toString()
                  );

              } catch (
                error
              ) {

                sendError(
                  ws,
                  "Invalid JSON",
                  400
                );


                return;

              }


              logger.info(
                {
                  userId:
                    connectionUser.id,

                  type:
                    data?.type,

                  workspaceId:
                    data?.workspaceId,

                  projectId:
                    data?.projectId,

                  entityId:
                    data?.entityId

                },
                "WebSocket command received"
              );


              /*
              |--------------------------------------------------------------------------
              | SERVER-SIDE VALIDATION
              |--------------------------------------------------------------------------
              */

              const context =
                await validateIncomingEvent({

                  ws,

                  data

                });


              /*
              |--------------------------------------------------------------------------
              | PING
              |--------------------------------------------------------------------------
              */

              if (
                context.type ===
                EVENT_TYPES.PING
              ) {

                ws.send(
                  JSON.stringify({

                    type:
                      EVENT_TYPES.PONG,

                    timestamp:
                      Date.now()

                  })
                );


                return;

              }


              /*
              |--------------------------------------------------------------------------
              | WORKSPACE JOIN
              |--------------------------------------------------------------------------
              */

              if (
                context.type ===
                EVENT_TYPES.WORKSPACE_JOIN
              ) {

                const workspaceId =
                  context.workspaceId;


                /*
                * Membership was already
                * verified by validator.
                *
                * NOW and only now do we
                * grant socket access.
                */

                connectionManager
                  .addWorkspace(
                    connectionUser.id,
                    ws,
                    workspaceId
                  );


                /*
                * Store authorized workspace.
                */

                ws.workspaceIds.add(
                  workspaceId
                );


                /*
                * Workspace-specific presence.
                */

                await presenceService
                  .markUserOnline(
                    connectionUser.id,
                    workspaceId
                  );


                /*
                * Presence snapshot.
                */

                const onlineUsers =
                  await presenceService
                    .getOnlineUsers(
                      workspaceId
                    );


                ws.send(
                  JSON.stringify({

                    type:
                      EVENT_TYPES.PRESENCE_SNAPSHOT,

                    workspaceId,

                    projectId:
                      null,

                    entityId:
                      null,

                    actorId:
                      connectionUser.id,

                    timestamp:
                      new Date()
                        .toISOString(),

                    payload: {

                      users:
                        onlineUsers

                    }

                  })
                );


                /*
                * USER_ONLINE is SERVER GENERATED.
                */

                const event =
                  createEvent({

                    type:
                      EVENT_TYPES.USER_ONLINE,

                    workspaceId,

                    projectId:
                      null,

                    entityId:
                      null,

                    actorId:
                      connectionUser.id,

                    payload: {

                      userId:
                        connectionUser.id,

                      name:
                        connectionUser.name

                    }

                  });


                await publishApplicationEvent(
                  event
                );


                logger.info(
                  {
                    userId:
                      connectionUser.id,

                    workspaceId

                  },
                  "Workspace access granted"
                );


                return;

              }


              /*
              |--------------------------------------------------------------------------
              | WORKSPACE LEAVE
              |--------------------------------------------------------------------------
              */

              if (
                context.type ===
                EVENT_TYPES.WORKSPACE_LEAVE
              ) {

                const workspaceId =
                  context.workspaceId;


                connectionManager
                  .removeWorkspace(
                    connectionUser.id,
                    ws,
                    workspaceId
                  );


                ws.workspaceIds.delete(
                  workspaceId
                );


                await presenceService
                  .markUserOffline(
                    connectionUser.id,
                    [
                      workspaceId
                    ]
                  );


                logger.info(
                  {
                    userId:
                      connectionUser.id,

                    workspaceId

                  },
                  "Workspace access removed"
                );


                return;

              }


              /*
              |--------------------------------------------------------------------------
              | PRESENCE HEARTBEAT
              |--------------------------------------------------------------------------
              */

              if (
                context.type ===
                EVENT_TYPES.PRESENCE_HEARTBEAT
              ) {

                await presenceService
                  .refreshUserPresence(
                    connectionUser.id,
                    context.workspaceIds
                  );


                return;

              }


              /*
              |--------------------------------------------------------------------------
              | TYPING STARTED / STOPPED
              |--------------------------------------------------------------------------
              */

              if (
                context.type ===
                  EVENT_TYPES.TYPING_STARTED ||
                context.type ===
                  EVENT_TYPES.TYPING_STOPPED
              ) {

                /*
                * IMPORTANT:
                *
                * actorId
                * userId
                * name
                * workspaceId
                *
                * are all server-controlled.
                */

                const event =
                  createEvent({

                    type:
                      context.type,

                    workspaceId:
                      context.workspaceId,

                    projectId:
                      context.projectId,

                    entityId:
                      context.taskId,

                    actorId:
                      connectionUser.id,

                    payload: {

                      userId:
                        connectionUser.id,

                      name:
                        connectionUser.name

                    }

                  });


                await publishApplicationEvent(
                  event
                );


                return;

              }


              /*
              |--------------------------------------------------------------------------
              | Anything else
              |--------------------------------------------------------------------------
              */

              throw new Error(
                "Unhandled WebSocket command"
              );

            } catch (
              error
            ) {

              logger.error(
                {
                  userId:
                    ws.connectionUser?.id,

                  error:
                    error.message

                },
                "WebSocket command rejected"
              );


              sendError(
                ws,

                error.message ||
                  "Invalid WebSocket request",

                error.statusCode ||
                  400

              );

            }

          }
        );


        /*
        |--------------------------------------------------------------------------
        | CLOSE
        |--------------------------------------------------------------------------
        */

        ws.on(
          "close",
          async () => {

            const userId =
              ws.connectionUser.id;


            const workspaceIds =
              ws.workspaceIds
                ? Array.from(
                    ws.workspaceIds
                  )
                : [];


            /*
            * Remove socket first.
            */

            connectionManager
              .remove(
                userId,
                ws
              );


            /*
            * If another socket for this
            * user still exists, do not
            * mark global user offline.
            */

            if (
              connectionManager
                .isUserConnected(
                  userId
                )
            ) {

              logger.info(
                {
                  userId

                },
                "WebSocket closed; user still has active connections"
              );


              return;

            }


            /*
            * No sockets remain.
            */

            await presenceService
              .markUserOffline(
                userId,
                workspaceIds
              );


            /*
            * Publish USER_OFFLINE for
            * each authorized workspace.
            */

            for (
              const workspaceId
              of workspaceIds
            ) {

              const event =
                createEvent({

                  type:
                    EVENT_TYPES.USER_OFFLINE,

                  workspaceId,

                  projectId:
                    null,

                  entityId:
                    null,

                  actorId:
                    userId,

                  payload: {

                    userId

                  }

                });


              await publishApplicationEvent(
                event
              );

            }


            logger.info(
              {
                userId

              },
              "WebSocket client disconnected"
            );

          }
        );


        /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

        ws.on(
          "error",
          (
            error
          ) => {

            logger.error(
              {
                userId:
                  connectionUser.id,

                error:
                  error.message

              },
              "WebSocket connection error"
            );

          }
        );

      }
    );


    logger.info(
      "WebSocket server initialized at /ws"
    );


    return wss;

  };


module.exports =
  initializeWebSocketServer;