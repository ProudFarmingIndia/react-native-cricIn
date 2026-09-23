import { useCallback, useEffect, useState } from "react";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| useUserLocation.js
|
| Description:
| Where the user is, if they are willing to say.
|
| WHY THE REFUSAL PATH IS FIRST-CLASS AND NOT AN ERROR
|
| "Grounds within 5 km" needs a coordinate, and a meaningful number of
| people will decline the permission - some on principle, some because the
| prompt arrived at a bad moment. An app that treats that as a failure shows
| them an empty screen and loses them.
|
| So `denied` is a normal outcome with its own path: discovery falls back to
| a city and area search, the distance chips disappear, and "Nearest"
| silently becomes "Top rated" because there is nothing to measure from.
| Everything else works.
|
| expo-location IS A REQUIRED DEPENDENCY - INSTALL IT
|
|     npx expo install expo-location
|
| The require below sits inside a try/catch, which protects against the
| module throwing at RUNTIME - location services switched off at the OS
| level, a timeout, a permission revoked mid-session. It does NOT make the
| package optional: Metro resolves every require statically when it bundles,
| so if expo-location is not in package.json the BUILD fails with "Unable to
| resolve module expo-location" and no APK comes out at all.
|
| It is required lazily rather than imported at the top so that a runtime
| failure inside the native module lands in the catch below - in the same
| place as a declined permission, which is exactly where it belongs - rather
| than taking the whole screen down with a red box at import time.
|
| iOS also needs a usage string in app.json, or the permission prompt is
| refused by the OS without ever reaching the user:
|
|     "ios": { "infoPlist": {
|       "NSLocationWhenInUseUsageDescription":
|         "CricIn uses your location to show grounds near you."
|     }}
|
|--------------------------------------------------------------------------
*/

export default function useUserLocation({ auto = true } = {}) {
  const [coords, setCoords] = useState(null);

  const [status, setStatus] = useState("idle");

  const request = useCallback(async () => {
    setStatus("asking");

    try {
      // eslint-disable-next-line global-require
      const Location = require("expo-location");

      const { status: permission } =
        await Location.requestForegroundPermissionsAsync();

      if (permission !== "granted") {
        setStatus("denied");

        return null;
      }

      /*
      | Balanced accuracy, not High. A ground search does not need three
      | metres of precision, and High keeps the GPS awake long enough to be
      | noticeable on the battery and slow enough to be noticeable on the
      | screen.
      */
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCoords(next);

      setStatus("granted");

      return next;
    } catch {
      /*
      | Missing module, location services switched off at the OS level, a
      | timeout - all the same thing from here: no coordinate. The screen
      | has one fallback and it handles all of them.
      */
      setStatus("unavailable");

      return null;
    }
  }, []);

  useEffect(() => {
    if (auto) request();
  }, [auto, request]);

  return {
    coords,

    status,

    request,

    hasCoords: !!coords,

    /* True once we know we are not getting one - the cue to show the city picker. */
    needsManualArea: status === "denied" || status === "unavailable",
  };
}
