/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
|
| One host, one place. This file was empty once, so the API host lived in
| services/api/apiConstants.js and the socket host lived in
| services/socket/socket.service.js - two separately hardcoded IPs that
| drifted apart (192.168.1.127 vs 192.168.29.86), which meant REST and
| real-time were pointing at different machines. Both now derive from here.
|
| WHERE THE HOST COMES FROM
|
| EXPO_PUBLIC_API_HOST, when it is set. Expo inlines any variable with that
| prefix into the bundle at build time, and eas.json sets it per profile -
| so a `preview` or `production` build is compiled with the Render URL and a
| plain `npx expo start` is not.
|
| The fallback below is the LAN address of a development machine, used only
| when nothing set the variable.
|
| This is deliberately NOT a value you edit by hand before each build. It
| was, and the failure mode is nasty and silent: an APK handed to somebody
| with the host still pointing at a laptop on your home wifi. Every screen
| fails with a network error and nothing on the phone explains why. Making
| the build profile decide removes the chance to forget.
|
| To develop against the deployed server instead of your laptop, create a
| .env file next to package.json:
|
|     EXPO_PUBLIC_API_HOST=https://cricin-node-backend-module.onrender.com
|
| THE TWO SHAPES DIFFER ON PURPOSE
|   API_BASE_URL includes the "/api" prefix every REST route sits under.
|   SOCKET_URL is the bare origin - Socket.IO attaches at the root.
|
| On a physical device the fallback must be your machine's LAN IP, never
| localhost: localhost on the phone means the phone.
|
*/

const LOCAL_API_HOST = "http://192.168.1.127:5000";

const API_HOST = process.env.EXPO_PUBLIC_API_HOST || LOCAL_API_HOST;

/*
| Ninety seconds, and it is not over-cautious.
|
| The Render free instance sleeps after about fifteen minutes idle and takes
| up to fifty seconds to wake. At the old thirty-second timeout the FIRST
| request after any quiet period was guaranteed to abort while the server
| was still starting - the app showed a network error, and the server came
| up healthy twenty seconds later with nobody watching.
|
| Drop this back to 30000 when the instance moves off the free plan. A long
| timeout is a real cost: a genuine network failure now hangs for a minute
| and a half before the user is told anything.
*/

const REQUEST_TIMEOUT = 90000;

export const ENV = {
  API_HOST,

  API_BASE_URL: `${API_HOST}/api`,

  SOCKET_URL: API_HOST,

  REQUEST_TIMEOUT,

  // Handy in a debug banner or a support screen: which server am I talking to?
  IS_REMOTE: API_HOST !== LOCAL_API_HOST,
};

export default ENV;
