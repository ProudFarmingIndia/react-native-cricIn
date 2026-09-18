/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| streamConstants.js
|
|--------------------------------------------------------------------------
*/

/*
| The two camera positions. These strings are the API contract - the
| server validates against exactly these, so they are not display labels
| and must not be prettied up here.
*/

export const ANGLES = ["front", "third"];

export const ANGLE_LABEL = {
  front: "Front",
  third: "Third Umpire",
};

export const ANGLE_HINT = {
  front: "Bowler's arm — the main broadcast angle",
  third: "Side on — run-outs, stumpings, the line",
};

export const ANGLE_ICON = {
  front: "videocam-outline",
  third: "camera-reverse-outline",
};

/*
|--------------------------------------------------------------------------
| Fallback Copy
|--------------------------------------------------------------------------
|
| WHY THIS EXISTS AT ALL
| A video player with a dead URL and nothing else on screen is the worst
| thing a viewer can be handed: they assume the app is broken and close
| it. Every one of these states is normal - the camera has not connected
| yet, the phone dropped signal, the match finished - and each one has an
| honest sentence.
|
| The server sends the same copy in its `message` field, and that is what
| gets rendered when it is present. This map is the fallback for an older
| server, or a `reason` this build has not seen. Keeping both means a new
| state on the server shows sensible text on an old app instead of a
| blank space.
|
*/

export const FALLBACK_COPY = {
  no_stream: "Is match ki live streaming set nahi hui hai.",

  waiting: "Camera connect ho raha hai. Match abhi shuru hone wala hai.",

  reconnecting: "Network slow hai, stream wapas aa rahi hai...",

  ended: "Live streaming khatam ho gayi.",

  replay_ready: "Match khatam — replay dekh sakte ho.",

  live: "",
};

export const FALLBACK_TITLE = {
  no_stream: "No live stream",
  waiting: "Starting soon",
  reconnecting: "Reconnecting",
  ended: "Stream ended",
  replay_ready: "Replay available",
  live: "Live",
};

/*
| Icons chosen so the three states a viewer will actually hit look
| different at a glance: nothing set up, waiting, and a temporary drop.
*/

export const FALLBACK_ICON = {
  no_stream: "videocam-off-outline",
  waiting: "time-outline",
  reconnecting: "cloud-offline-outline",
  ended: "stop-circle-outline",
  replay_ready: "play-circle-outline",
  live: "radio-outline",
};

/*
| "reconnecting" is the one state worth re-polling hard - a phone that
| dropped twenty seconds ago is usually back within a minute, and a viewer
| who has to pull-to-refresh to find that out has already left.
*/

export const POLL_MS = {
  live: 15000,
  reconnecting: 5000,
  waiting: 8000,
  default: 20000,
};

/*
|--------------------------------------------------------------------------
| Overlay Cadence
|--------------------------------------------------------------------------
|
| The overlay asks the server what the score was at the moment currently
| on screen. Once a second is enough - a ball takes longer than that, and
| anything faster is a request per frame for no visible gain.
|
*/

export const OVERLAY_TICK_MS = 1000;

/*
| How long a player card (new batsman / new bowler / wicket) stays up. The
| server sends showForMs; this is the fallback.
*/

export const CARD_MS = 6000;