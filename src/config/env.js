import Constants from "expo-constants";

/*
|--------------------------------------------------------------------------
| Environment - Which Backend Am I Talking To?
|--------------------------------------------------------------------------
|
| One file decides the host for BOTH the REST client and the socket.
| services/api/apiConstants.js and services/socket/socket.service.js read
| from here, so they cannot drift apart again the way they once did.
|
| THE HARDCODED LAN IP IS GONE
|
| The previous version fell back to a literal "http://192.168.1.127:5000".
| Two things were wrong with that:
|
|   IT GOES STALE. A router reboot, a different wifi, a laptop that picked
|   up a new lease - and every screen fails with a network error while the
|   code still looks correct. It had already drifted once before.
|
|   IT LEAKED INTO RELEASE BUILDS. `expo run:android --variant release`
|   does NOT read eas.json, so EXPO_PUBLIC_API_HOST was unset and the
|   release APK was compiled pointing at a laptop on a home network. It
|   installs, it opens, and every request fails for everyone - with nothing
|   on screen explaining why.
|
| Now the dev host is discovered at runtime and the production fallback is
| the deployed server, so the dangerous default is the safe one.
|
| ─────────────────────────────────────────────────────────────────────────
|
| HOW TO SWITCH, IN ORDER OF PRECEDENCE
|
| 1. EXPO_PUBLIC_API_HOST - wins over everything.
|
|    Set per build profile in eas.json (already done for preview and
|    production), or for a local session in a .env file next to
|    package.json:
|
|        EXPO_PUBLIC_API_HOST=https://cricin-node-backend-module.onrender.com
|
|    Expo INLINES this at bundle time, not runtime - so after changing
|    .env you must restart Metro, and use --clear or the old value stays
|    in the transform cache:
|
|        npx expo start --clear
|
| 2. USE_REMOTE_IN_DEV below - flip to true to point the dev app at Render
|    without touching .env. Useful when a tester is running the app and
|    your local server is not up.
|
| 3. Automatic. In development the app asks Expo where Metro is running -
|    that IS your laptop - and talks to port 5000 on the same machine. No
|    IP to maintain, and it follows you between networks.
|
| 4. Production fallback: the deployed server.
|
*/

/* The deployed backend. */
const REMOTE_API_HOST = "https://cricin-node-backend-module.onrender.com";

/* The port your local Express server listens on. */
const LOCAL_API_PORT = 5000;

/*
| Flip to true to use the deployed backend while developing. Left as a
| plain constant rather than a .env value on purpose: it is a thing you
| toggle several times a day, and editing one boolean is faster than
| editing .env and restarting with --clear.
*/
const USE_REMOTE_IN_DEV = false;

/*
|--------------------------------------------------------------------------
| Finding The Development Machine
|--------------------------------------------------------------------------
|
| When you run `expo start`, the app is loaded FROM your laptop - so it
| already knows that address. `hostUri` is where Metro is serving from,
| e.g. "192.168.1.127:8081". The IP half is the machine your backend is
| almost certainly running on too.
|
| expo-constants is already a dependency, so this needs no new package and
| no rebuild.
|
| Two shapes are checked because Expo has moved this field between SDK
| versions and between Expo Go and a dev build. Anything unrecognised
| simply returns null and the caller falls through to the remote host.
*/

const metroHost = () => {
  try {
    const candidates = [
      Constants?.expoConfig?.hostUri,
      Constants?.expoGoConfig?.debuggerHost,
      Constants?.manifest2?.extra?.expoGo?.debuggerHost,
      Constants?.manifest?.debuggerHost,
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;

      const host = String(candidate).split(":")[0];

      /* Guard against "localhost" - on a phone that means the phone. */
      if (host && host !== "localhost" && host !== "127.0.0.1") return host;
    }

    return null;
  } catch {
    return null;
  }
};

const resolveHost = () => {
  /* 1. An explicit build-time value always wins. */
  if (process.env.EXPO_PUBLIC_API_HOST) {
    return process.env.EXPO_PUBLIC_API_HOST;
  }

  /* 2 & 3. Development. */
  if (__DEV__) {
    if (USE_REMOTE_IN_DEV) return REMOTE_API_HOST;

    const lanIp = metroHost();

    if (lanIp) return `http://${lanIp}:${LOCAL_API_PORT}`;

    /*
    | Metro's address could not be read - a rare case, but falling back to
    | the deployed server beats failing every request against a host we had
    | to guess.
    */
    return REMOTE_API_HOST;
  }

  /*
  | 4. A release build with no EXPO_PUBLIC_API_HOST. This is the case that
  | used to point at a laptop; the deployed server is the only defensible
  | answer.
  */

  return REMOTE_API_HOST;
};

const API_HOST = resolveHost();

const IS_REMOTE = API_HOST === REMOTE_API_HOST;

/*
| Ninety seconds against Render's free tier, thirty against a local server.
|
| The free instance sleeps after about fifteen minutes idle and takes up to
| fifty to wake, so at a thirty-second timeout the FIRST request after any
| quiet period was guaranteed to abort while the server was still starting -
| the app showed a network error and the server came up healthy twenty
| seconds later with nobody watching.
|
| A long timeout is a real cost though: a genuine network failure hangs for
| a minute and a half before the user is told anything. So it is only paid
| when talking to the sleepy host - a local server that has not answered in
| thirty seconds is not going to.
|
| Drop the 90000 to 30000 when Render moves off the free plan.
*/

const REQUEST_TIMEOUT = IS_REMOTE ? 90000 : 30000;

export const ENV = {
  API_HOST,

  API_BASE_URL: `${API_HOST}/api`,

  /* Socket.IO attaches at the root - no "/api" prefix. */
  SOCKET_URL: API_HOST,

  REQUEST_TIMEOUT,

  IS_REMOTE,

  /* True when the host was discovered rather than configured. Handy in a
     debug banner: "connected to your laptop" vs "connected to Render". */
  IS_AUTODETECTED:
    !process.env.EXPO_PUBLIC_API_HOST && !USE_REMOTE_IN_DEV && !IS_REMOTE,
};

/*
| One line at startup saying which backend this build is talking to. This
| is the single most useful log line in the app - "why is nothing loading"
| is answered here nine times out of ten - and it is dev-only, so it never
| reaches a user's device.
*/

if (__DEV__) {
  console.log(
    `[env] API → ${API_HOST}${ENV.IS_AUTODETECTED ? " (auto-detected)" : ""}`,
  );
}

export default ENV;
