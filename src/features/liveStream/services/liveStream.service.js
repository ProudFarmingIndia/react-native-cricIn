/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| liveStream.service.js
|
| Description:
| Every call the live-streaming feature makes. Same shape as
| matches.services.js - thin wrappers that unwrap { success, data } and
| let the caller deal with errors.
|
|--------------------------------------------------------------------------
*/

import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| Discovery
|--------------------------------------------------------------------------
*/

export const getLiveStreamingFeedApi = async (limit = 30) => {
  const response = await apiClient.get(
    `${ENDPOINTS.LIVE_STREAM.LIVE_FEED}?limit=${limit}`,
  );

  return unwrap(response);
};

/*
| Matches somebody has asked this user to film. Drives the "You're
| filming today" card on Home.
*/

export const getMyBroadcastAssignmentsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.LIVE_STREAM.MY_ASSIGNMENTS);

  /*
  | The server returns { count, assignments: [...] }. Flattened to the
  | array here so every caller does not have to remember the wrapper -
  | and so a screen that renders `.map` on the response cannot silently
  | show nothing.
  */

  const data = unwrap(response);

  return Array.isArray(data?.assignments) ? data.assignments : [];
};

/*
|--------------------------------------------------------------------------
| Watching
|--------------------------------------------------------------------------
*/

export const getStreamsApi = async (matchId) => {
  const response = await apiClient.get(ENDPOINTS.LIVE_STREAM.GET(matchId));

  return unwrap(response);
};

/*
| The overlay call.
|
| `at` is the wall-clock moment the VIDEO is currently showing, which is
| 12-20 seconds behind real time. Passing the real clock here is the one
| mistake that breaks this whole feature: the overlay would announce a
| wicket while the screen still shows the bowler running in.
*/

export const getOverlayStateApi = async (matchId, at) => {
  const response = await apiClient.get(ENDPOINTS.LIVE_STREAM.STATE(matchId), {
    params: at ? { at } : undefined,
  });

  return unwrap(response);
};

/*
| A signed playback URL for one angle. Also where the concurrent-viewer
| cap is enforced, so this can legitimately fail with 429 on a busy match -
| the caller shows that message rather than a black player.
*/

export const getPlaybackTokenApi = async (matchId, angle) => {
  const response = await apiClient.get(
    ENDPOINTS.LIVE_STREAM.PLAYBACK_TOKEN(matchId, angle),
  );

  return unwrap(response);
};

/*
| Best-effort. Frees the viewer slot immediately instead of waiting for
| the lease to expire, so an open-and-close does not hold a slot for the
| next forty minutes.
*/

export const leaveStreamApi = async (matchId) => {
  try {
    const response = await apiClient.put(
      ENDPOINTS.LIVE_STREAM.LEAVE(matchId),
    );

    return unwrap(response);
  } catch {
    return null;
  }
};

export const getVideoHighlightsApi = async (matchId, playerId) => {
  const response = await apiClient.get(
    ENDPOINTS.LIVE_STREAM.HIGHLIGHTS(matchId),
    { params: playerId ? { playerId } : undefined },
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Going Live
|--------------------------------------------------------------------------
*/

export const createStreamApi = async (matchId, angle) => {
  const response = await apiClient.post(
    ENDPOINTS.LIVE_STREAM.CREATE(matchId),
    { angle },
  );

  return unwrap(response);
};

/*
| "Go Live" pressed before a match exists. The server creates a draft
| match first so the stream is never orphaned, and returns its matchId -
| which the app then uses to collect the fixture details.
*/

export const quickStartStreamApi = async (angle = "front") => {
  const response = await apiClient.post(ENDPOINTS.LIVE_STREAM.QUICK_START, {
    angle,
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Scorer Controls
|--------------------------------------------------------------------------
*/

/*
| userId: null clears the assignment - which is how a camera is taken off
| someone who has left the ground. The server rotates the Mux key whenever
| the holder changes, so the old key stops working the moment this
| returns.
*/

export const assignBroadcasterApi = async (matchId, angle, userId) => {
  const response = await apiClient.put(ENDPOINTS.LIVE_STREAM.ASSIGN(matchId), {
    angle,
    userId,
  });

  return unwrap(response);
};

export const respondToBroadcastApi = async (matchId, angle, accept) => {
  const response = await apiClient.put(
    ENDPOINTS.LIVE_STREAM.RESPOND(matchId),
    { angle, accept },
  );

  return unwrap(response);
};

/*
| Only reachable by the assigned broadcaster AFTER they have accepted.
| The key is fetched once, deliberately, on the setup screen.
*/

export const getStreamKeyApi = async (matchId, angle) => {
  const response = await apiClient.get(
    ENDPOINTS.LIVE_STREAM.KEY(matchId, angle),
  );

  return unwrap(response);
};

export const stopStreamApi = async (matchId, angle) => {
  const response = await apiClient.put(
    ENDPOINTS.LIVE_STREAM.STOP(matchId, angle),
  );

  return unwrap(response);
};

export const resumeStreamApi = async (matchId, angle) => {
  const response = await apiClient.put(
    ENDPOINTS.LIVE_STREAM.RESUME(matchId, angle),
  );

  return unwrap(response);
};

/*
| The answer to "still going?" during a rain break. Without it, a
| stoppage is indistinguishable from a phone left in a bag, and the
| server ends the stream.
*/

export const keepStreamAliveApi = async (matchId, angle) => {
  const response = await apiClient.put(
    ENDPOINTS.LIVE_STREAM.KEEP_ALIVE(matchId, angle),
  );

  return unwrap(response);
};

export const deleteStreamApi = async (matchId, angle) => {
  const response = await apiClient.delete(
    ENDPOINTS.LIVE_STREAM.DELETE(matchId, angle),
  );

  return unwrap(response);
};