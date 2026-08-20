import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import useWebSocket from "../hooks/useWebSocket";

import {
  WS_EVENT_TYPES
} from "../websocket/websocketEvents";


const PresenceContext =
  createContext(null);


export const PresenceProvider = ({
  children
}) => {

  const {
    subscribe
  } = useWebSocket();


  /*
   * Store user IDs that are currently online.
   */

  const [
    onlineUsers,
    setOnlineUsers
  ] = useState(new Set());


  /*
   * =====================================================
   * USER ONLINE
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.USER_ONLINE,
        (event) => {

          const userId =
            event.payload?.userId;

          if (!userId) {
            return;
          }

          setOnlineUsers(
            (current) => {

              const next =
                new Set(current);

              next.add(
                String(userId)
              );

              return next;
            }
          );

        }
      );


    return unsubscribe;

  }, [subscribe]);


  /*
   * =====================================================
   * USER OFFLINE
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.USER_OFFLINE,
        (event) => {

          const userId =
            event.payload?.userId;

          if (!userId) {
            return;
          }

          setOnlineUsers(
            (current) => {

              const next =
                new Set(current);

              next.delete(
                String(userId)
              );

              return next;
            }
          );

        }
      );


    return unsubscribe;

  }, [subscribe]);


  /*
   * =====================================================
   * PRESENCE SNAPSHOT
   * =====================================================
   */

  useEffect(() => {

    const unsubscribe =
      subscribe(
        WS_EVENT_TYPES.PRESENCE_SNAPSHOT,
        (event) => {

          const users =
            event.payload?.users || [];

          setOnlineUsers(
            new Set(
              users
                .map(
                  (user) =>
                    String(user.userId)
                )
                .filter(Boolean)
            )
          );

        }
      );


    return unsubscribe;

  }, [subscribe]);


  /*
   * Helper
   */

  const isOnline = (userId) => {

    if (!userId) {
      return false;
    }

    return onlineUsers.has(
      String(userId)
    );
  };


  return (
    <PresenceContext.Provider
      value={{
        onlineUsers,
        isOnline
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
};


export const usePresence = () => {

  const context =
    useContext(PresenceContext);

  if (!context) {

    throw new Error(
      "usePresence must be used inside PresenceProvider"
    );

  }

  return context;
};