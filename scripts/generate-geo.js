#!/usr/bin/env node
/*
|==========================================================================
| GEO DATA GENERATOR
|==========================================================================
|
| Run:   npm i -D country-state-city
|        node scripts/generate-geo.js
|
| Writes src/constants/geo.data.json.
|
| WHY A GENERATOR AND NOT A RUNTIME DEPENDENCY
|
| `country-state-city` is 17 MB installed, and its city.json alone is
| 7.7 MB. Importing the package from app code puts that whole blob in the
| bundle - Metro will not tree-shake a JSON import, and the 143,000 cities
| outside India are dead weight in an app whose OTP only reaches India.
|
| So the package is a DEV dependency. This script runs once, emits a
| trimmed snapshot, and the app imports that. Measured output:
|
|     250 countries              12 KB
|     4,963 states (197 countries)  201 KB
|     4,242 Indian cities         109 KB
|     ---------------------------------
|     total                      ~219 KB   (68 KB gzipped in the APK)
|
| ADDING A COUNTRY'S CITIES
|
| Put its ISO-2 code in CITY_COUNTRIES below and rerun. Do it at the same
| time you set `otpSupported: true` for that country in the app's
| src/constants/countries.js and the server's shared/constants/phone.ts -
| a country whose users cannot sign up does not need a city list.
|
| Rough cost per country, so you can decide before committing: India's
| 4,242 cities are 109 KB, so budget ~25 KB per 1,000 cities. All 148,038
| cities worldwide would be 5.4 MB - at that point stop bundling and serve
| cities from the backend instead.
|
| The `version` below is bumped automatically from the previous file, so a
| future background-refresh mechanism has something to compare.
*/

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

let csc;

try {
  csc = require("country-state-city");
} catch {
  console.error(
    "\ncountry-state-city is not installed. It is a dev dependency:\n\n" +
      "    npm i -D country-state-city\n",
  );
  process.exit(1);
}

/* Countries whose cities are bundled. See the note above before adding. */
const CITY_COUNTRIES = ["IN"];

const OUT = path.resolve(__dirname, "..", "src", "constants", "geo.data.json");

const byName = (a, b) => a.n.localeCompare(b.n);

/* ── Countries ─────────────────────────────────────────────────────── */

const countries = csc.Country.getAllCountries()
  .map((x) => ({
    c: x.isoCode,
    n: x.name,
    d: `+${x.phonecode}`,
    f: x.flag,
  }))
  .sort(byName);

/* ── States, grouped by country ────────────────────────────────────── */

const states = {};

for (const country of countries) {
  const list = csc.State.getStatesOfCountry(country.c)
    .map((s) => ({ c: s.isoCode, n: s.name }))
    .sort(byName);

  /* 53 countries have no subdivisions at all - omit the key entirely so
     the UI can tell "no states" from "not loaded". */
  if (list.length) states[country.c] = list;
}

/* ── Cities, only for the chosen countries ─────────────────────────── */

const cities = {};

for (const code of CITY_COUNTRIES) {
  if (!states[code]) {
    console.warn(`  ! ${code} has no states - skipping its cities`);
    continue;
  }

  cities[code] = {};

  for (const state of states[code]) {
    /*
    | The source data contains duplicates within a state (the same town
    | listed twice under different districts). Deduped here rather than in
    | the app, so the picker never shows the same name twice.
    */
    const list = [
      ...new Set(
        csc.City.getCitiesOfState(code, state.c).map((x) => x.name),
      ),
    ].sort();

    if (list.length) cities[code][state.c] = list;
  }
}

/* ── Version ───────────────────────────────────────────────────────── */

let version = 1;

try {
  version = (JSON.parse(fs.readFileSync(OUT, "utf8")).version || 0) + 1;
} catch {
  /* First run. */
}

const payload = {
  version,
  generatedAt: new Date().toISOString().slice(0, 10),
  cityCountries: CITY_COUNTRIES,
  countries,
  states,
  cities,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload));

const json = JSON.stringify(payload);

console.log(`\n  geo.data.json v${version}\n`);
console.log(`  countries      ${countries.length}`);
console.log(
  `  states         ${Object.values(states).flat().length} across ${Object.keys(states).length} countries`,
);

for (const code of CITY_COUNTRIES) {
  console.log(
    `  cities (${code})    ${Object.values(cities[code] || {}).flat().length}`,
  );
}

console.log(
  `\n  size           ${Math.round(json.length / 1024)} KB raw, ` +
    `${Math.round(zlib.gzipSync(Buffer.from(json)).length / 1024)} KB gzipped\n`,
);
