import { io } from "socket.io-client";

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

const SOCKET_URL = "http://192.168.29.86:5000";

let socket = null;

export const connectSocket = (token) => {
  // Avoid creating duplicate connections.
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: token ? { token } : {},
    query: token ? { token } : {},
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

export default socket;
