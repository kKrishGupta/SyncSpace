class ConnectionManager {
  constructor() {
    // userId -> Set<WebSocket>
    this.connections = new Map();
  }

  /*
  |--------------------------------------------------------------------------
  | Add connection
  |--------------------------------------------------------------------------
  */

  add(userId, ws) {
    if (!userId || !ws) {
      return;
    }

    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }

    this.connections.get(userId).add(ws);
  }

  /*
  |--------------------------------------------------------------------------
  | Remove connection
  |--------------------------------------------------------------------------
  */

  remove(userId, ws) {
    const userConnections =
      this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    userConnections.delete(ws);

    // Remove user completely when
    // they have no active sockets.
    if (userConnections.size === 0) {
      this.connections.delete(userId);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Send event to one user
  |--------------------------------------------------------------------------
  */

  sendToUser(userId, message) {
    const userConnections =
      this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    const payload =
      JSON.stringify(message);

    for (const ws of userConnections) {
      if (ws.readyState === 1) {
        ws.send(payload);
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Broadcast to every connected user
  |--------------------------------------------------------------------------
  */

  broadcast(message) {
    const payload =
      JSON.stringify(message);

    for (const userConnections of this.connections.values()) {
      for (const ws of userConnections) {
        if (ws.readyState === 1) {
          ws.send(payload);
        }
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Check whether user is connected
  |--------------------------------------------------------------------------
  */

  isUserConnected(userId) {
    const userConnections =
      this.connections.get(userId);

    return (
      !!userConnections &&
      userConnections.size > 0
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Get number of sockets for a user
  |--------------------------------------------------------------------------
  */

  getUserConnectionCount(userId) {
    const userConnections =
      this.connections.get(userId);

    return userConnections
      ? userConnections.size
      : 0;
  }

  /*
  |--------------------------------------------------------------------------
  | Get total active sockets
  |--------------------------------------------------------------------------
  */

  getConnectionCount() {
    let count = 0;

    for (const userConnections of this.connections.values()) {
      count += userConnections.size;
    }

    return count;
  }

  /*
  |--------------------------------------------------------------------------
  | Get connected user count
  |--------------------------------------------------------------------------
  */

  getUserCount() {
    return this.connections.size;
  }
}

module.exports =
  new ConnectionManager();