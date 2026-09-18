import { useMemo } from "react";

import {
  DEFAULT_COUNTRY,
  SUPPORTED_COUNTRIES,
  findCountry,
} from "../../../constants/countries";

/*
|--------------------------------------------------------------------------
| Guessing The User's Country - Without Asking For Location
|--------------------------------------------------------------------------
|
| A location permission prompt on the very first screen, before the user has
| seen anything the app does, is the fastest way to get uninstalled. It is
| also the wrong tool: we want the country the user's phone is SET UP for,
| not the GPS coordinates of the room they are standing in.
|
| WHAT THIS USES
|
| The device's own timezone, read from Intl - which is built into Hermes, so
| there is no dependency to install and no native rebuild. `Asia/Kolkata`
| means the phone is configured for India. No permission, no network call,
| no prompt, works offline, resolves instantly.
|
| WHAT IT DELIBERATELY DOES NOT USE
|
|   GPS - needs a permission the user has no reason to grant yet.
|
|   IP geolocation (ipapi, ipinfo) - a network round trip before the first
|   paint, wrong for anyone on a VPN, another vendor to depend on, and it
|   means shipping your users' IP addresses to a third party. For a field we
|   can pre-fill correctly almost every time by writing "+91".
|
| WHEN TO REPLACE THIS
|
| `expo-localization` gives the region directly and correctly:
|
|     import * as Localization from "expo-localization";
|     Localization.getLocales()[0]?.regionCode   // "IN"
|
| That is strictly better - it reads the region the user actually chose,
| rather than inferring it from a timezone. It is a native module, so it
| needs a prebuild and a fresh binary. Worth adding on the next build that
| is happening anyway; not worth a build of its own while only one country
| is supported.
|
| THE HONEST CAVEAT
|
| While SUPPORTED_COUNTRIES has one entry, all of this resolves to India no
| matter what it detects. It is here so that adding the second country is a
| data change rather than a rewrite.
|
*/

/*
| Timezone -> country, for the countries CricIn cares about. Not exhaustive
| and does not need to be: anything unrecognised falls back to the default,
| which is the correct answer for the overwhelming majority of users.
*/

const TIMEZONE_COUNTRY = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Dubai": "AE",
  "Europe/London": "GB",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
};

export const detectCountryCode = () => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return TIMEZONE_COUNTRY[zone] || DEFAULT_COUNTRY.code;
  } catch {
    /*
    | Intl is present in Hermes, but this must never be the reason a user
    | cannot reach the login form. Any failure is simply the default.
    */

    return DEFAULT_COUNTRY.code;
  }
};

export default function useCountryCode() {
  return useMemo(() => {
    const detected = findCountry(detectCountryCode());

    /*
    | Detected but not deliverable - a user in London still has to sign up
    | with an Indian number today, because that is the only number CricIn
    | can send an OTP to. Showing them "+44" would be a lie the SMS then
    | contradicts.
    */

    const isSupported = SUPPORTED_COUNTRIES.some(
      (country) => country.code === detected.code,
    );

    return {
      country: isSupported ? detected : DEFAULT_COUNTRY,

      /* True when we had to override the detection - useful if you ever
         want to explain why the picker is not showing their country. */
      detectionOverridden: !isSupported,

      detectedCode: detected.code,
    };
  }, []);
}
