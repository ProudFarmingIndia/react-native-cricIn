/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
|
| One host, one place. This file was empty, so the API host lived in
| services/api/apiConstants.js and the socket host lived in
| services/socket/socket.service.js - two separately hardcoded IPs that
| drifted apart (192.168.1.127 vs 192.168.29.86), which meant REST and
| real-time were pointing at different machines.
|
| Change API_HOST when your LAN address changes. Everything else derives
| from it.
|
| The two shapes differ on purpose:
|   API_BASE_URL includes the "/api" prefix every REST route sits under.
|   SOCKET_URL is the bare origin - Socket.IO attaches at the root.
|
| On a physical device this must be your machine's LAN IP, not localhost:
| localhost on the phone means the phone.
|
*/

const API_HOST = "http://192.168.29.86:5000";

export const ENV = {
  API_HOST,

  API_BASE_URL: `${API_HOST}/api`,

  SOCKET_URL: API_HOST,

  REQUEST_TIMEOUT: 30000,
};

export default ENV;
