/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| tournamentConstants.js
|
| Description:
| Display-side constants. The server owns the real list of formats and
| playoff shapes (see /tournaments/options); everything here is how they
| are DRAWN - labels, colours, icons, and the copy for empty states.
|
| Keeping the two apart means adding a playoff shape on the server shows up
| in the picker immediately, and only its icon has to be added here.
|
|--------------------------------------------------------------------------
*/

import { COLORS } from "../../../constants/colors";

export const FORMAT_LABEL = {
  League: "League",
  Knockout: "Knockout",
  "League+Knockout": "League + Knockout",
};

export const FORMAT_HINT = {
  League: "Har team har team se khelegi. Points table se winner.",
  Knockout: "Haare toh bahar. Sabse kam matches.",
  "League+Knockout": "Pehle league, phir top teams playoff mein.",
};

export const FORMAT_ICON = {
  League: "grid-outline",
  Knockout: "git-branch-outline",
  "League+Knockout": "trophy-outline",
};

/*
| Status is shown as a pill everywhere - list card, detail hero, home
| section - so its colour and label live in one place.
*/

export const STATUS_META = {
  draft: { label: "DRAFT", bg: COLORS.surfaceContainer, fg: COLORS.onSurfaceVariant },
  published: { label: "OPEN", bg: "#E2EDE0", fg: COLORS.primary },
  registration_closed: {
    label: "STARTING SOON",
    bg: "#FFF3E0",
    fg: COLORS.secondary,
  },
  live: { label: "LIVE", bg: COLORS.error, fg: "#ffffff" },
  completed: { label: "COMPLETED", bg: COLORS.surfaceContainer, fg: COLORS.outline },
  cancelled: { label: "CANCELLED", bg: "#FEE2E2", fg: COLORS.error },
};

export const BALL_TYPES = ["Leather", "Tennis", "Other"];

/*
|--------------------------------------------------------------------------
| Play days
|--------------------------------------------------------------------------
|
| JavaScript's getDay() order, Sunday first - the same order the server's
| scheduler walks. Presets exist because "weekends only" is what almost
| every local tournament actually wants, and making the organizer tap two
| chips for the common case is worse than one button.
|
*/

export const DAYS = [
  { value: 0, short: "Sun" },
  { value: 1, short: "Mon" },
  { value: 2, short: "Tue" },
  { value: 3, short: "Wed" },
  { value: 4, short: "Thu" },
  { value: 5, short: "Fri" },
  { value: 6, short: "Sat" },
];

export const DAY_PRESETS = [
  { key: "weekend", label: "Weekends only", days: [0, 6] },
  { key: "all", label: "Any day", days: [0, 1, 2, 3, 4, 5, 6] },
];

/*
| Prize rows the create form starts with. The organizer can delete these,
| edit them, or add a tenth - `position` is just a number they control.
*/

export const DEFAULT_PRIZE_ROWS = [
  { position: 1, label: "Winner", amount: 0, description: "" },
  { position: 2, label: "Runner Up", amount: 0, description: "" },
];

export const positionSuffix = (n) => {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
};

/*
| Indian-format money, because that is who is reading it. 25000 becomes
| "25,000" and not "25.0K" - a prize is a number people quote exactly.
*/

export const formatMoney = (amount) => {
  const n = Number(amount || 0);

  if (!n) return "";

  return `₹${n.toLocaleString("en-IN")}`;
};

/*
|--------------------------------------------------------------------------
| Awards
|--------------------------------------------------------------------------
|
| The catalogue itself comes from the server (/tournaments/options ->
| awardMetrics), carrying each award's label, hint, unit and whether the
| app can count it. Only the ICON lives here, because an icon name is a
| frontend concern and shipping "flame" from a Node server would tie the
| API to whichever icon set the app happens to use this year.
|
| A metric with no entry falls back to the trophy, so adding an award on
| the server works immediately and only looks generic until its icon is
| added below.
|
*/

export const AWARD_ICON = {
  most_runs: "flame",
  most_wickets: "disc",
  most_sixes: "rocket",
  most_fours: "flash",
  most_catches: "hand-left",
  highest_score: "trending-up",
  best_bowling: "medal",
  best_strike_rate: "speedometer",
  best_economy: "shield-checkmark",
  most_potm: "star",

  man_of_the_series: "trophy",
  best_fielder: "hand-right",
  emerging_player: "sparkles",
  best_captain: "ribbon",
  fair_play: "happy",
  custom: "add-circle",
};

export const awardIcon = (metric) => AWARD_ICON[metric] || "trophy";

/*
| The two awards a new tournament starts with. Both countable, both at
| zero - the organizer adds amounts and more awards, or deletes these.
|
| Starting empty makes awards feel optional; starting with all fifteen
| makes the create form look like homework. Two is enough to show what the
| section is for.
*/

export const DEFAULT_AWARD_ROWS = [
  { metric: "most_runs", label: "Most Runs", amount: 0, description: "" },
  { metric: "most_wickets", label: "Most Wickets", amount: 0, description: "" },
];

/*
| Used ONLY while /tournaments/options is still in flight, or if it fails.
| The server is the real catalogue - this is a copy of it so that an
| organizer on a slow connection does not open the Rules step to an empty
| picker and conclude their tournament cannot have awards.
|
| It will drift from the server eventually. That is acceptable for a
| fallback that is visible for about 400ms; anything added on the server
| appears here the moment the real list arrives.
*/

export const FALLBACK_AWARD_METRICS = [
  { key: "most_runs", label: "Most Runs", computed: true, unit: "runs" },
  { key: "most_wickets", label: "Most Wickets", computed: true, unit: "wickets" },
  { key: "most_sixes", label: "Most Sixes", computed: true, unit: "sixes" },
  { key: "most_fours", label: "Most Fours", computed: true, unit: "fours" },
  { key: "most_catches", label: "Most Catches", computed: true, unit: "catches" },
  { key: "highest_score", label: "Highest Individual Score", computed: true },
  { key: "best_bowling", label: "Best Bowling Figures", computed: true },
  { key: "best_strike_rate", label: "Best Strike Rate", computed: true },
  { key: "best_economy", label: "Best Economy", computed: true },
  { key: "most_potm", label: "Most Player of the Match Awards", computed: true },

  { key: "man_of_the_series", label: "Man of the Series", computed: false },
  { key: "best_fielder", label: "Best Fielder", computed: false },
  { key: "emerging_player", label: "Emerging Player", computed: false },
  { key: "best_captain", label: "Best Captain", computed: false },
  { key: "fair_play", label: "Fair Play Award", computed: false },
  { key: "custom", label: "Custom Award", computed: false },
];

/*
| Board titles for the Stats tab. Keyed by the same metric names, so a new
| computed metric on the server shows up here the moment it is added.
*/

export const BOARD_TITLE = {
  most_runs: "Most Runs",
  most_wickets: "Most Wickets",
  most_sixes: "Most Sixes",
  most_fours: "Most Fours",
  most_catches: "Most Catches",
  highest_score: "Highest Score",
  best_bowling: "Best Bowling",
  best_strike_rate: "Best Strike Rate",
  best_economy: "Best Economy",
  most_potm: "Most POTM Awards",
};

/*
| The order the Stats tab draws them in - runs and wickets first because
| that is what anyone opening a stats page came for.
*/

export const BOARD_ORDER = [
  "most_runs",
  "most_wickets",
  "most_sixes",
  "most_fours",
  "most_catches",
  "highest_score",
  "best_bowling",
  "best_strike_rate",
  "best_economy",
  "most_potm",
];

export const SQUAD_HINT =
  "Kam se kam 15, zyada se zyada 20. Is tournament mein sirf yahi players khel sakte hain.";
