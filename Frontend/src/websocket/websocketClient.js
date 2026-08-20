const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://localhost:5000/ws";


class WebSocketClient {
  constructor() {
    this.socket = null;

    // eventType -> Set(callback)
    this.listeners = new Map();

    // Connection state listeners
    this.connectionListeners = new Set();

    this.shouldReconnect = true;

    this.reconnectAttempts = 0;

    this.maxReconnectAttempts = 10;

    this.reconnectTimer = null;

    this.baseReconnectDelay = 1000;
  }


  /*
  |--------------------------------------------------------------------------
  | CONNECT
  |--------------------------------------------------------------------------
  */

  connect(token) {
    if (
      this.socket &&
      (
        this.socket.readyState ===
          WebSocket.OPEN ||
        this.socket.readyState ===
          WebSocket.CONNECTING
      )
    ) {
      return;
    }

    if (!token) {
      console.warn("WebSocket connection skipped: No token provided");
      return;
    }

    this.shouldReconnect = true;
    this.token = token; // Store token for reconnections

    const urlWithToken = `${WS_URL}?token=${token}`;
    console.log("Connecting WebSocket:", WS_URL);

    this.socket = new WebSocket(urlWithToken);

    this.socket.onopen = () => {
      console.log(
        "WebSocket connected"
      );

      this.reconnectAttempts = 0;

      this.notifyConnectionListeners(
        "connected"
      );
    };


    this.socket.onmessage = (event) => {
      this.handleMessage(event);
    };


    this.socket.onerror = (error) => {
      console.error(
        "WebSocket error:",
        error
      );
    };


    this.socket.onclose = () => {
      console.log(
        "WebSocket disconnected"
      );

      this.socket = null;

      this.notifyConnectionListeners(
        "disconnected"
      );

      if (this.shouldReconnect) {
        this.reconnect();
      }
    };
  }


  /*
  |--------------------------------------------------------------------------
  | DISCONNECT
  |--------------------------------------------------------------------------
  */

  disconnect() {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(
        this.reconnectTimer
      );

      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();

      this.socket = null;
    }

    this.reconnectAttempts = 0;
  }


  /*
  |--------------------------------------------------------------------------
  | SEND
  |--------------------------------------------------------------------------
  */

  send(data) {
    if (
      !this.socket ||
      this.socket.readyState !==
        WebSocket.OPEN
    ) {
      console.warn(
        "WebSocket is not connected"
      );

      return false;
    }

    try {
      this.socket.send(
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error(
        "WebSocket send failed:",
        error
      );

      return false;
    }
  }


  /*
  |--------------------------------------------------------------------------
  | SUBSCRIBE
  |--------------------------------------------------------------------------
  */

  subscribe(
    eventType,
    callback
  ) {
    if (
      typeof callback !==
      "function"
    ) {
      throw new Error(
        "WebSocket callback must be a function"
      );
    }

    if (
      !this.listeners.has(
        eventType
      )
    ) {
      this.listeners.set(
        eventType,
        new Set()
      );
    }

    this.listeners
      .get(eventType)
      .add(callback);


    // Return unsubscribe function
    return () => {
      const callbacks =
        this.listeners.get(
          eventType
        );

      if (!callbacks) {
        return;
      }

      callbacks.delete(
        callback
      );

      if (
        callbacks.size === 0
      ) {
        this.listeners.delete(
          eventType
        );
      }
    };
  }


  /*
  |--------------------------------------------------------------------------
  | SUBSCRIBE TO ALL EVENTS
  |--------------------------------------------------------------------------
  */

  subscribeAll(callback) {
    return this.subscribe(
      "*",
      callback
    );
  }


  /*
  |--------------------------------------------------------------------------
  | HANDLE MESSAGE
  |--------------------------------------------------------------------------
  */

  handleMessage(event) {
    let message;

    try {
      message =
        JSON.parse(
          event.data
        );
    } catch (error) {
      console.error(
        "Invalid WebSocket message:",
        error
      );

      return;
    }


    if (!message?.type) {
      console.warn(
        "WebSocket message has no type:",
        message
      );

      return;
    }


    /*
    | Exact event subscribers
    */

    const callbacks =
      this.listeners.get(
        message.type
      );

    if (callbacks) {
      callbacks.forEach(
        (callback) => {
          try {
            callback(message);
          } catch (error) {
            console.error(
              `Error in ${message.type} listener:`,
              error
            );
          }
        }
      );
    }


    /*
    | Global subscribers
    */

    const allCallbacks =
      this.listeners.get("*");

    if (allCallbacks) {
      allCallbacks.forEach(
        (callback) => {
          try {
            callback(message);
          } catch (error) {
            console.error(
              "Error in WebSocket listener:",
              error
            );
          }
        }
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | RECONNECT
  |--------------------------------------------------------------------------
  */

  reconnect() {
    if (!this.shouldReconnect) {
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    if (
      this.reconnectAttempts >=
      this.maxReconnectAttempts
    ) {
      console.error(
        "Maximum WebSocket reconnect attempts reached"
      );

      return;
    }

    this.reconnectAttempts += 1;

    const delay =
      Math.min(
        this.baseReconnectDelay *
          Math.pow(
            2,
            this.reconnectAttempts - 1
          ),
        30000
      );

    console.log(
      `WebSocket reconnecting in ${delay}ms`
    );

    this.reconnectTimer =
      setTimeout(() => {
        this.reconnectTimer = null;

        this.connect(this.token);
      }, delay);
  }


  /*
  |--------------------------------------------------------------------------
  | CONNECTION STATE
  |--------------------------------------------------------------------------
  */

  onConnectionStateChange(
    callback
  ) {
    this.connectionListeners.add(
      callback
    );

    return () => {
      this.connectionListeners.delete(
        callback
      );
    };
  }


  notifyConnectionListeners(
    state
  ) {
    this.connectionListeners.forEach(
      (callback) => {
        try {
          callback(state);
        } catch (error) {
          console.error(
            "Connection state listener failed:",
            error
          );
        }
      }
    );
  }


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  getState() {
    if (!this.socket) {
      return "DISCONNECTED";
    }

    switch (
      this.socket.readyState
    ) {
      case WebSocket.CONNECTING:
        return "CONNECTING";

      case WebSocket.OPEN:
        return "CONNECTED";

      case WebSocket.CLOSING:
        return "CLOSING";

      default:
        return "DISCONNECTED";
    }
  }
}


/*
|--------------------------------------------------------------------------
| Singleton
|--------------------------------------------------------------------------
*/

const websocketClient =
  new WebSocketClient();


export default websocketClient;