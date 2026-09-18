/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Live Stream
|
| File:
| useOverlayState.js
|
| Description:
| Keeps the score overlay in step with the PICTURE, not with the clock.
|
| THE PROBLEM THIS SOLVES
| The video is 12-20 seconds behind reality. If the overlay showed the
| current score, the viewer would read "OUT" while the screen still shows
| the bowler halfway through his run-up. The app would spoil every wicket,
| every six, every match - and it would look like a bug in the video, not
| in the score.
|
| So nothing here reads the current state. Every tick asks the server one
| question: "what was the score at the moment this frame was recorded?"
|
| HOW WE KNOW WHAT MOMENT THAT IS
| Mux writes EXT-X-PROGRAM-DATE-TIME into the HLS manifest - a wall-clock
| stamp on the media itself. expo-video surfaces it as
| `currentLiveTimestamp` (ms since epoch). That is the anchor.
|
| When the player cannot give us one - the very first seconds, a
| non-live asset, an older player build - we fall back to
| (now - ASSUMED_LAG). It is an estimate and it is wrong by a few seconds,
| but it is wrong in the SAFE direction: slightly behind the picture
| rather than ahead of it. Being early is what spoils the match; being a
| touch late is invisible.
|
|--------------------------------------------------------------------------
*/

import { useCallback, useEffect, useRef, useState } from "react";

import { getOverlayStateApi } from "../services/liveStream.service";

import { OVERLAY_TICK_MS, CARD_MS } from "../constants/streamConstants";

/*
| Used only when the player has no PROGRAM-DATE-TIME to give. Sits at the
| slow end of Mux's reduced-latency range on purpose - see the note above
| about which direction it is safe to be wrong in.
*/

const ASSUMED_LAG_MS = 18000;

export default function useOverlayState(matchId, { enabled = true } = {}) {
  const [state, setState] = useState(null);

  const [card, setCard] = useState(null);

  /*
  | The video's own idea of "now", written by the player on every frame
  | callback. A ref rather than state: it changes constantly and nothing
  | should re-render because of it.
  */

  const videoTimeRef = useRef(null);

  /*
  | Which card is currently on screen, so the same wicket is not
  | re-triggered on every one-second poll for the six seconds it is up.
  | Keyed by type + over, which is unique per event.
  */

  const shownCardKey = useRef(null);

  const cardTimer = useRef(null);

  /*
  | Guards against overlapping requests on a slow connection. Without it,
  | a 3-second response on a 1-second poll builds a queue that arrives out
  | of order and makes the score jump backwards.
  */

  const inFlight = useRef(false);

  const setVideoTime = useCallback((ms) => {
    if (typeof ms === "number" && Number.isFinite(ms) && ms > 0) {
      videoTimeRef.current = ms;
    }
  }, []);

  const tick = useCallback(async () => {
    if (!matchId || inFlight.current) return;

    inFlight.current = true;

    try {
      const at = new Date(
        videoTimeRef.current ?? Date.now() - ASSUMED_LAG_MS,
      ).toISOString();

      const data = await getOverlayStateApi(matchId, at);

      setState(data);

      /*
      |--------------------------------------------------------------------------
      | Card
      |--------------------------------------------------------------------------
      |
      | The server decides WHICH card (wicket beats new batsman - see
      | overlay.service). This only decides how long it stays up, and
      | makes sure one event produces one appearance rather than six.
      |
      */

      const next = data?.card;

      const key = next ? `${next.type}:${next.over ?? ""}` : null;

      if (key && key !== shownCardKey.current) {
        shownCardKey.current = key;

        setCard(next);

        if (cardTimer.current) clearTimeout(cardTimer.current);

        cardTimer.current = setTimeout(() => {
          setCard(null);
        }, next.showForMs || CARD_MS);
      }
    } catch {
      /*
      | Swallowed on purpose. This runs once a second on a ground
      | connection; a dropped request is normal and the next tick fixes
      | it. Surfacing it would put an error toast over the video every
      | time someone walked behind the router.
      */
    } finally {
      inFlight.current = false;
    }
  }, [matchId]);

  useEffect(() => {
    if (!enabled || !matchId) return undefined;

    tick();

    const id = setInterval(tick, OVERLAY_TICK_MS);

    return () => {
      clearInterval(id);

      if (cardTimer.current) clearTimeout(cardTimer.current);
    };
  }, [enabled, matchId, tick]);

  /*
  | Reset when the match changes, so a card from the previous match
  | cannot linger over the new one.
  */

  useEffect(() => {
    shownCardKey.current = null;

    videoTimeRef.current = null;

    setCard(null);

    setState(null);
  }, [matchId]);

  return {
    state,

    card,

    /*
    | Called by the player on every progress update with
    | `currentLiveTimestamp`. This is the only input this hook needs from
    | the video.
    */

    setVideoTime,
  };
}