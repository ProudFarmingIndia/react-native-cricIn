import { useCallback, useEffect, useState } from "react";

import { getGroundOptionsApi } from "../services/ground.service";

import {
  FALLBACK_DISTANCES,
  FALLBACK_SORTS,
  FALLBACK_PITCH_TYPES,
} from "../constants/groundConstants";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| useGroundOptions.js
|
| Description:
| The facility list, pitch types, sorts, distance buckets and policy
| defaults - fetched once per app run and shared.
|
| WHY IT IS CACHED IN A MODULE VARIABLE AND NOT IN REDUX
|
| Four screens need it: discovery's filter sheet, the ground detail badges,
| the add-ground form and the policies form. It never changes while the app
| is open, and it is the same for every user.
|
| Redux would work and would cost a slice, an action and a selector to
| express "fetch this once". A module-level variable says the same thing in
| one line, and because the module is a singleton every screen after the
| first gets it synchronously - no spinner on the filter sheet, which is
| the whole point.
|
| The in-flight promise is cached too, not just the result. Without that,
| two screens mounting together fire two requests and the second one is
| pure waste.
|
|--------------------------------------------------------------------------
*/

let cache = null;

let inFlight = null;

const FALLBACK = {
  facilities: [],
  pitchTypes: FALLBACK_PITCH_TYPES,
  sorts: FALLBACK_SORTS,
  distances: FALLBACK_DISTANCES,
  unitTypes: ["match", "net"],
  defaults: {
    bufferMatchMinutes: 30,
    bufferNetMinutes: 5,
    graceMinutes: 15,
    overtimeMultiplier: 1.5,
    cancellationCutoffHours: 6,
    requestExpiryHours: 12,
  },
};

const fetchOptions = async () => {
  if (cache) return cache;

  if (!inFlight) {
    inFlight = getGroundOptionsApi()
      .then((data) => {
        /*
        | Merged over the fallback rather than replacing it, so a server
        | that starts sending one fewer key does not blank a filter bar.
        */
        cache = { ...FALLBACK, ...(data || {}) };

        return cache;
      })
      .catch(() => {
        /*
        | Deliberately NOT cached on failure. The next screen should try
        | again - a single offline moment at app start should not leave the
        | filter bar empty for the rest of the session.
        */
        inFlight = null;

        return FALLBACK;
      });
  }

  return inFlight;
};

export default function useGroundOptions() {
  const [options, setOptions] = useState(cache || FALLBACK);

  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let alive = true;

    if (cache) {
      setOptions(cache);

      setLoading(false);

      return () => {
        alive = false;
      };
    }

    fetchOptions().then((data) => {
      if (!alive) return;

      setOptions(data);

      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  /*
  | Facility key -> { label, icon }. Built here rather than in each screen
  | because three of them need to render a stored key as a readable badge,
  | and a Map built once beats three .find() calls per card.
  */

  const facilityMap = useCallback(
    (key) =>
      (options.facilities || []).find((f) => f.key === key) || {
        key,
        label: key,
        icon: "ellipse-outline",
      },
    [options.facilities],
  );

  return { options, loading, facilityMap };
}

/* For non-component code that needs the same data. */

export const primeGroundOptions = fetchOptions;
