class ConnectionManager {

  constructor() {

    /*
    |--------------------------------------------------------------------------
    | userId -> Set<WebSocket>
    |--------------------------------------------------------------------------
    */

    this.connections =
      new Map();

  }


  /*
  |--------------------------------------------------------------------------
  | Add connection
  |--------------------------------------------------------------------------
  */

  add(
    userId,
    ws,
    workspaceIds = []
  ) {

    if (
      !userId ||
      !ws
    ) {

      return;

    }


    if (
      !this.connections.has(
        String(userId)
      )
    ) {

      this.connections.set(
        String(userId),
        new Set()
      );

    }


    /*
     * IMPORTANT:
     *
     * A new socket starts with
     * NO authorized workspace.
     *
     * Workspace access is granted only
     * after WORKSPACE_JOIN passes
     * membership validation.
     */

    ws.workspaceIds =
      new Set(
        workspaceIds
          .filter(Boolean)
          .map(
            (id) =>
              String(id)
          )
      );


    this.connections
      .get(String(userId))
      .add(ws);

  }


  /*
  |--------------------------------------------------------------------------
  | Remove connection
  |--------------------------------------------------------------------------
  */

  remove(
    userId,
    ws
  ) {

    const userConnections =
      this.connections.get(
        String(userId)
      );


    if (!userConnections) {

      return;

    }


    userConnections.delete(ws);


    if (
      userConnections.size === 0
    ) {

      this.connections.delete(
        String(userId)
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | Add authorized workspace
  |--------------------------------------------------------------------------
  */

  addWorkspace(
    userId,
    ws,
    workspaceId
  ) {

    if (
      !userId ||
      !ws ||
      !workspaceId
    ) {

      return;

    }


    if (!ws.workspaceIds) {

      ws.workspaceIds =
        new Set();

    }


    ws.workspaceIds.add(
      String(workspaceId)
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Remove workspace
  |--------------------------------------------------------------------------
  */

  removeWorkspace(
    userId,
    ws,
    workspaceId
  ) {

    if (
      !ws ||
      !workspaceId
    ) {

      return;

    }


    if (!ws.workspaceIds) {

      return;

    }


    ws.workspaceIds.delete(
      String(workspaceId)
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Check socket workspace access
  |--------------------------------------------------------------------------
  */

  hasWorkspaceAccess(
    ws,
    workspaceId
  ) {

    if (
      !ws ||
      !workspaceId ||
      !ws.workspaceIds
    ) {

      return false;

    }


    return ws.workspaceIds.has(
      String(workspaceId)
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Send event to one user
  |--------------------------------------------------------------------------
  */

  sendToUser(
    userId,
    message
  ) {

    const userConnections =
      this.connections.get(
        String(userId)
      );


    if (!userConnections) {

      return;

    }


    const payload =
      JSON.stringify(message);


    for (
      const ws
      of userConnections
    ) {

      if (
        ws.readyState === 1
      ) {

        ws.send(payload);

      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | Broadcast to authorized workspace sockets
  |--------------------------------------------------------------------------
  */

  broadcastToWorkspace(
    workspaceId,
    message
  ) {

    if (!workspaceId) {

      return;

    }


    const workspace =
      String(workspaceId);


    const payload =
      JSON.stringify(message);


    for (
      const userConnections
      of this.connections.values()
    ) {

      for (
        const ws
        of userConnections
      ) {

        if (
          ws.readyState !== 1
        ) {

          continue;

        }


        /*
         * SECURITY BOUNDARY
         *
         * Only sockets that explicitly
         * passed workspace authorization
         * receive this event.
         */

        if (
          !this.hasWorkspaceAccess(
            ws,
            workspace
          )
        ) {

          continue;

        }


        ws.send(payload);

      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | Broadcast to everyone
  |--------------------------------------------------------------------------
  */

  broadcast(
    message
  ) {

    const payload =
      JSON.stringify(message);


    for (
      const userConnections
      of this.connections.values()
    ) {

      for (
        const ws
        of userConnections
      ) {

        if (
          ws.readyState === 1
        ) {

          ws.send(payload);

        }

      }

    }

  }


  /*
  |--------------------------------------------------------------------------
  | Check user connection
  |--------------------------------------------------------------------------
  */

  isUserConnected(
    userId
  ) {

    const userConnections =
      this.connections.get(
        String(userId)
      );


    return (
      !!userConnections &&
      userConnections.size > 0
    );

  }


  /*
  |--------------------------------------------------------------------------
  | Check user workspace connection
  |--------------------------------------------------------------------------
  */

  isUserConnectedToWorkspace(
    userId,
    workspaceId
  ) {

    const userConnections =
      this.connections.get(
        String(userId)
      );


    if (!userConnections) {

      return false;

    }


    for (
      const ws
      of userConnections
    ) {

      if (
        this.hasWorkspaceAccess(
          ws,
          workspaceId
        )
      ) {

        return true;

      }

    }


    return false;

  }


  /*
  |--------------------------------------------------------------------------
  | User connection count
  |--------------------------------------------------------------------------
  */

  getUserConnectionCount(
    userId
  ) {

    const userConnections =
      this.connections.get(
        String(userId)
      );


    return userConnections
      ? userConnections.size
      : 0;

  }


  /*
  |--------------------------------------------------------------------------
  | Total sockets
  |--------------------------------------------------------------------------
  */

  getConnectionCount() {

    let count = 0;


    for (
      const userConnections
      of this.connections.values()
    ) {

      count +=
        userConnections.size;

    }


    return count;

  }


  /*
  |--------------------------------------------------------------------------
  | Connected users
  |--------------------------------------------------------------------------
  */

  getUserCount() {

    return this.connections.size;

  }

}


module.exports =
  new ConnectionManager();