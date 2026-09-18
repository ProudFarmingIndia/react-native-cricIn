/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| useLiveStream.js
|
| Description:
| One match's stream state: which angles exist, which are live, what to
| say when none of them are, and the scorer's control block.
|
| Also owns the socket subscription. The LIVE badge has to come from the
| webhook - Mux telling us a broadcaster actually connected - and not from
| polling, because a phone that dropped ten seconds ago should say
| "reconnecting" immediately, not on the next 20-second poll.
|
|--------------------------------------------------------------------------
*/

import { useCallback, useEffect, useRef, useState } from "react";

import { getStreamsApi } from "../services/liveStream.service";

import { getSocket } from "../../../services/socket/socket.service";

import { POLL_MS } from "../constants/streamConstants";

export default function useLiveStream(matchId, { poll = true } = {}) {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const timer = useRef(null);

  const load = useCallback(
    async (silent = false) => {
      if (!matchId) {
        setLoading(false);

        return null;
      }

      if (!silent) setLoading(true);

      try {
        const result = await getStreamsApi(matchId);

        setData(result);

        setError(null);

        return result;
      } catch (err) {
        setError(
          err?.response?.data?.message || "Could not load the live stream.",
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [matchId],
  );

  /*
  |--------------------------------------------------------------------------
  | Polling
  |--------------------------------------------------------------------------
  |
  | The interval is chosen by what the stream is currently doing, not by a
  | fixed number:
  |
  |   reconnecting - 5s. A dropped phone is usually back inside a minute,
  |   and a viewer who has to pull-to-refresh to discover that has already
  |   left.
  |
  |   waiting - 8s. Somebody is standing at the ground about to press
  |   start; this is the one moment the viewer is actively waiting.
  |
  |   live - 15s. The socket carries the real changes; this is only a
  |   backstop for a socket that quietly died.
  |
  | Rescheduled after every response rather than set once, so the cadence
  | follows the state instead of being fixed at whatever it was when the
  | screen opened.
  |
  */

  useEffect(() => {
    if (!poll || !matchId) return undefined;

    let cancelled = false;

    const schedule = (result) => {
      if (cancelled) return;

      const reason = result?.reason;

      const delay = POLL_MS[reason] ?? POLL_MS.default;

      timer.current = setTimeout(async () => {
        const next = await load(true);

        schedule(next);
      }, delay);
    };

    load().then(schedule);

    return () => {
      cancelled = true;

      if (timer.current) clearTimeout(timer.current);
    };
  }, [matchId, poll, load]);

  /*
  |--------------------------------------------------------------------------
  | Socket
  |--------------------------------------------------------------------------
  |
  | `match:join` puts this device in the match's room; the server emits
  | stream:status from the Mux webhook, so the badge changes at the moment
  | the camera actually connects or drops.
  |
  | Leaving the room on unmount matters - without it, a user who opens ten
  | matches in a session is subscribed to ten rooms and gets events for
  | matches they closed.
  |
  */

  useEffect(() => {
    if (!matchId) return undefined;

    const socket = getSocket();

    if (!socket) return undefined;

    socket.emit("match:join", matchId);

    const onStatus = () => {
      /*
      | Refetch rather than patch the local copy. The event says an angle
      | changed; the derived fields - reason, message, control.summary -
      | are all computed on the server, and recomputing them here would
      | be a second implementation to keep in step.
      */

      load(true);
    };

    socket.on("stream:status", onStatus);

    socket.on("stream:ending", onStatus);

    return () => {
      socket.off("stream:status", onStatus);

      socket.off("stream:ending", onStatus);

      socket.emit("match:leave", matchId);
    };
  }, [matchId, load]);

  const angles = data?.angles || [];

  return {
    data,

    loading,

    error,

    reload: load,

    /*
    | Convenience reads, so screens do not each re-derive the same three
    | things from the payload.
    */

    isLive: !!data?.isLive,

    reason: data?.reason || "no_stream",

    message: data?.message || "",

    match: data?.match || null,

    angles,

    liveAngles: angles.filter((a) => a.live),

    /*
    | Present only for the scorer / match creator. Its absence is what the
    | UI switches on to decide whether to show the control panel at all.
    */

    control: data?.control || null,

    myAngle: data?.myAngle || null,

    signed: !!data?.signed,

    viewerCount: data?.viewerCount ?? 0,
  };
}