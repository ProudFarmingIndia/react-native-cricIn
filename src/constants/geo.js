import DATA from "./geo.data.json";

/*
|--------------------------------------------------------------------------
| Geography - Countries, States, Cities
|--------------------------------------------------------------------------
|
| One source for every place picker in the app: Create Team, Edit Team,
| Edit Profile, Grounds.
|
| The data is BUNDLED, not fetched, and that is a deliberate choice:
|
|   IT IS SMALL. 219 KB raw, 68 KB gzipped in the APK - about one photo.
|
|   IT IS STATIC. Country and state lists change roughly once a decade.
|   There is no freshness to gain by asking a server.
|
|   IT WORKS OFFLINE. Users fill these in at grounds, on bad signal.
|
|   IT OPENS INSTANTLY. The backend is on Render's free tier, which sleeps
|   after ~15 minutes idle and takes up to 50 seconds to wake. A dropdown
|   that can spin for fifty seconds is not a dropdown.
|
| Regenerate with `node scripts/generate-geo.js` after changing the source
| list. See that file for how to add a country's cities.
|
| ─────────────────────────────────────────────────────────────────────────
|
| STORE CODES, NOT NAMES.
|
| Everything here speaks ISO codes - "IN", "UP" - and resolves them to
| display names only for rendering. That matters because of what the codes
| are FOR: ranking players and teams city-wise, state-wise and
| country-wise. Those are group-by queries, and free text does not group -
| "UP", "Uttar Pradesh", "uttar pradesh" and "U.P." are four groups.
|
| Cities have no ISO codes anywhere in the world, so those are stored as
| names. Constraining them to this list is what keeps them consistent.
*/

export const GEO_VERSION = DATA.version;

export const COUNTRIES = DATA.countries;

export const DEFAULT_COUNTRY = "IN";

/*
| Lookup maps built once at import. The alternative - Array.find on every
| render - is 250 comparisons per keystroke in a search field.
*/

const COUNTRY_BY_CODE = new Map(DATA.countries.map((c) => [c.c, c]));

const STATE_BY_CODE = new Map(
  Object.entries(DATA.states).map(([country, list]) => [
    country,
    new Map(list.map((s) => [s.c, s])),
  ]),
);

/* ── Countries ─────────────────────────────────────────────────────── */

export const findCountry = (code) => COUNTRY_BY_CODE.get(code) || null;

export const countryName = (code) => findCountry(code)?.n || "";

/* ── States ────────────────────────────────────────────────────────── */

/*
| 53 countries have no subdivisions in this dataset (Aruba, Anguilla,
| Gibraltar, the Vatican - Singapore and Monaco DO have them, so do not
| guess which). The generator omits them entirely rather than storing an empty
| array, so an empty result here means "this country genuinely has none" -
| and the UI should skip the state step rather than show an empty list.
*/

export const getStates = (countryCode) => DATA.states[countryCode] || [];

export const hasStates = (countryCode) => getStates(countryCode).length > 0;

export const findState = (countryCode, stateCode) =>
  STATE_BY_CODE.get(countryCode)?.get(stateCode) || null;

export const stateName = (countryCode, stateCode) =>
  findState(countryCode, stateCode)?.n || "";

/* ── Cities ────────────────────────────────────────────────────────── */

/*
| Cities are bundled only for the countries in DATA.cityCountries - India
| today. Everywhere else the city is free text, which is correct rather
| than a compromise: bundling all 148,038 cities worldwide would add 5.4 MB
| to serve users who cannot currently receive an OTP anyway.
*/

export const hasCities = (countryCode) =>
  DATA.cityCountries.includes(countryCode);

export const getCities = (countryCode, stateCode) =>
  DATA.cities[countryCode]?.[stateCode] || [];

/* ── Cascade validity ──────────────────────────────────────────────── */

/*
| The bug this exists to prevent: pick India / Uttar Pradesh / Lucknow,
| then change the country to Australia. Without a reset the payload still
| carries state "UP" and city "Lucknow" - both now meaningless, both
| silently saved, and both poisoning the state-wise rankings later.
|
| Callers pass the whole value through this on every change rather than
| trying to remember which fields to clear.
*/

export const normaliseLocation = ({ country, state, city } = {}) => {
  const nextCountry = findCountry(country) ? country : "";

  if (!nextCountry) return { country: "", state: "", city: "" };

  const nextState = findState(nextCountry, state) ? state : "";

  if (!nextState) return { country: nextCountry, state: "", city: "" };

  /*
  | A free-text city in a country with no bundled list is kept as typed.
  | A city in a country that HAS a list must be in it.
  */
  const nextCity = !hasCities(nextCountry)
    ? city || ""
    : getCities(nextCountry, nextState).includes(city)
      ? city
      : "";

  return { country: nextCountry, state: nextState, city: nextCity };
};

/* ── Display ───────────────────────────────────────────────────────── */

/*
| "Lucknow, Uttar Pradesh, India" - skipping whatever is missing, so a
| half-filled location still reads correctly instead of ", , India".
*/

export const formatLocation = ({ country, state, city } = {}) =>
  [city, stateName(country, state), countryName(country)]
    .filter(Boolean)
    .join(", ");

/* ── Search ────────────────────────────────────────────────────────── */

/*
| Matches a prefix on any word, not a bare substring: typing "car" should
| surface "Carlisle" and "North Carolina", not "Nicaragua". Substring
| search on 250 countries or 624 cities buries the obvious answer.
*/

export const matches = (text, query) => {
  const q = String(query || "").trim().toLowerCase();

  if (!q) return true;

  const value = String(text || "").toLowerCase();

  if (value.startsWith(q)) return true;

  return value.split(/[\s,()-]+/).some((word) => word.startsWith(q));
};

/* ── Legacy values ─────────────────────────────────────────────────── */

/*
| Rows written before this file existed hold display names - Team.country
| defaulted to the string "India". They must keep working, and they must
| be upgradeable to codes without a migration running first.
|
| Exact name match only, deliberately: guessing at "Bharat" or "U.P." is
| how you get a wrong country silently saved to a real user's profile.
| Anything unrecognised comes back empty and the user picks again.
*/

const COUNTRY_BY_NAME = new Map(
  DATA.countries.map((c) => [c.n.toLowerCase(), c.c]),
);

export const toCountryCode = (value) => {
  const raw = String(value || "").trim();

  if (!raw) return "";
  if (COUNTRY_BY_CODE.has(raw)) return raw;

  return COUNTRY_BY_NAME.get(raw.toLowerCase()) || "";
};

export const toStateCode = (countryCode, value) => {
  const raw = String(value || "").trim();

  if (!raw) return "";
  if (findState(countryCode, raw)) return raw;

  const found = getStates(countryCode).find(
    (s) => s.n.toLowerCase() === raw.toLowerCase(),
  );

  return found?.c || "";
};

/*
| Read a { country, state, city } that may be in either format and return
| it in codes. Use this when loading an existing team or profile into a
| form, so old rows open with their values selected rather than blank.
*/

export const fromStoredLocation = (stored = {}) => {
  const country = toCountryCode(stored.country) || DEFAULT_COUNTRY;

  return normaliseLocation({
    country,
    state: toStateCode(country, stored.state),
    city: stored.city || "",
  });
};

export default {
  GEO_VERSION,
  COUNTRIES,
  DEFAULT_COUNTRY,
  findCountry,
  countryName,
  getStates,
  hasStates,
  findState,
  stateName,
  hasCities,
  getCities,
  normaliseLocation,
  formatLocation,
  matches,
  toCountryCode,
  toStateCode,
  fromStoredLocation,
};
