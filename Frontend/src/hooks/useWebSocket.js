import {
  useCallback,
  useEffect,
  useState
} from "react";

import websocketClient from "../websocket/websocketClient";

import {
  WS_EVENT_TYPES
} from "../websocket/websocketEvents";


const useWebSocket = () => {

  const [
    connectionState,
    setConnectionState
  ] = useState(
    websocketClient.getState()
  );


  /*
   * Connect
   */

  useEffect(() => {

    const unsubscribeConnection =
      websocketClient
        .onConnectionStateChange(
          (state) => {

            setConnectionState(
              state === "connected"
                ? "CONNECTED"
                : "DISCONNECTED"
            );

          }
        );

    websocketClient.connect();

    return () => {
      unsubscribeConnection();
    };

  }, []);


  /*
   * Presence heartbeat
   */

  useEffect(() => {

    const heartbeat =
      setInterval(() => {

        if (
          connectionState ===
          "CONNECTED"
        ) {

          websocketClient.send({
            type:
              WS_EVENT_TYPES.PRESENCE_HEARTBEAT
          });

        }

      }, 10000);


    return () => {
      clearInterval(heartbeat);
    };

  }, [connectionState]);


  /*
   * Send
   */

  const send = useCallback(
    (data) => {
      return websocketClient.send(
        data
      );
    },
    []
  );


  /*
   * Subscribe
   */

  const subscribe = useCallback(
    (
      eventType,
      callback
    ) => {

      return websocketClient.subscribe(
        eventType,
        callback
      );

    },
    []
  );


  /*
   * Subscribe to all
   */

  const subscribeAll = useCallback(
    (callback) => {

      return websocketClient.subscribeAll(
        callback
      );

    },
    []
  );


  /*
   * Disconnect
   */

  const disconnect = useCallback(
    () => {

      websocketClient.disconnect();

    },
    []
  );


  return {
    connectionState,

    isConnected:
      connectionState ===
      "CONNECTED",

    send,

    subscribe,

    subscribeAll,

    disconnect
  };
};


export default useWebSocket;