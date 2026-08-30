import { io } from "socket.io-client";

import { ENV } from "../../config/env";

/*
|--------------------------------------------------------------------------
| Socket Service
|--------------------------------------------------------------------------
|
| Real-time transport for notifications. The backend Socket.IO server runs
| on the API host WITHOUT the "/api" suffix, so we point at the bare origin.
| Auth is sent via the handshake `auth.token` which the backend verifies to
| join the user into their personal `user:${userId}` room.
|
*/

// Same origin as the REST client - see config/env.js.
const SOCKET_URL = ENV.SOCKET_URL;

let socket = null;

export const connectSocket = (token) => {
  // Avoid creating duplicate connections.
  if (socket && socket.connected) {
    return socket;
  }

  /*
  | A socket that exists but is mid-reconnect would otherwise be abandoned
  | here and replaced, leaking its listeners and its retry loop.
  */
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    /*
    | Handshake auth only. The token was ALSO sent as a query param, which
    | put the JWT in the connection URL and therefore into server access
    | logs. The backend reads handshake.auth.token first, so the query copy
    | bought nothing.
    */
    auth: token ? { token } : {},
    autoConnect: true,
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.log("Socket connection error:", error?.message || error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const onNotification = (callback) => {
  if (socket) {
    socket.on("notification", callback);
  }
};

export const offNotification = () => {
  if (socket) {
    socket.off("notification");
  }
};

export const getSocket = () => socket;
