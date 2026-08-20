const {
  redisPublisher
} = require("../config/redis");


const PRESENCE_TTL = 30;


/*
|--------------------------------------------------------------------------
| Keys
|--------------------------------------------------------------------------
*/

const getPresenceKey =
  (userId) =>
    `presence:user:${userId}`;


const getWorkspacePresenceKey =
  (workspaceId) =>
    `presence:workspace:${workspaceId}`;


/*
|--------------------------------------------------------------------------
| Mark user online
|--------------------------------------------------------------------------
*/

const markUserOnline =
  async (
    userId,
    workspaceId = null
  ) => {

    const key =
      getPresenceKey(
        userId
      );


    await redisPublisher.set(
      key,
      "1",
      {
        EX:
          PRESENCE_TTL
      }
    );


    /*
     * Workspace-specific
     * presence.
     */

    if (
      workspaceId
    ) {

      await redisPublisher.sAdd(
        getWorkspacePresenceKey(
          workspaceId
        ),
        String(userId)
      );

    }

  };


/*
|--------------------------------------------------------------------------
| Refresh user presence
|--------------------------------------------------------------------------
*/

const refreshUserPresence =
  async (
    userId,
    workspaceIds = []
  ) => {

    const key =
      getPresenceKey(
        userId
      );


    await redisPublisher.expire(
      key,
      PRESENCE_TTL
    );


    /*
     * Refresh workspace membership
     * in Redis sets.
     */

    for (
      const workspaceId
      of workspaceIds
    ) {

      await redisPublisher.sAdd(
        getWorkspacePresenceKey(
          workspaceId
        ),
        String(userId)
      );

    }

  };


/*
|--------------------------------------------------------------------------
| Mark user offline
|--------------------------------------------------------------------------
*/

const markUserOffline =
  async (
    userId,
    workspaceIds = []
  ) => {

    const key =
      getPresenceKey(
        userId
      );


    await redisPublisher.del(
      key
    );


    /*
     * Remove user from workspace
     * presence sets.
     */

    for (
      const workspaceId
      of workspaceIds
    ) {

      await redisPublisher.sRem(
        getWorkspacePresenceKey(
          workspaceId
        ),
        String(userId)
      );

    }

  };


/*
|--------------------------------------------------------------------------
| Get online users in workspace
|--------------------------------------------------------------------------
*/

const getOnlineUsers =
  async (
    workspaceId
  ) => {

    if (
      !workspaceId
    ) {

      return [];

    }


    return await redisPublisher
      .sMembers(
        getWorkspacePresenceKey(
          workspaceId
        )
      );

  };


/*
|--------------------------------------------------------------------------
| Is user online
|--------------------------------------------------------------------------
*/

const isUserOnline =
  async (
    userId
  ) => {

    const key =
      getPresenceKey(
        userId
      );


    const exists =
      await redisPublisher.exists(
        key
      );


    return exists === 1;

  };


module.exports = {

  PRESENCE_TTL,

  getPresenceKey,

  getWorkspacePresenceKey,

  markUserOnline,

  refreshUserPresence,

  markUserOffline,

  getOnlineUsers,

  isUserOnline

};