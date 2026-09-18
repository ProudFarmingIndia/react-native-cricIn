/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| seriesConstants.js
|
| Description:
| Display-side constants for series. The server owns the real lengths and
| the award catalogue; this is how they are DRAWN.
|
| Award icons, board titles and money formatting are imported from the
| tournament constants rather than copied. They describe the same things -
| an award is an award - and two copies would drift until "Most Sixes"
| looked different in a series than in a tournament.
|
|--------------------------------------------------------------------------
*/

import { COLORS } from "../../../constants/colors";

export {
  AWARD_ICON,
  awardIcon,
  BOARD_TITLE,
  BOARD_ORDER,
  DAYS,
  DAY_PRESETS,
  BALL_TYPES,
  formatMoney,
  positionSuffix,
  DEFAULT_PRIZE_ROWS,
  FALLBACK_AWARD_METRICS,
} from "../../tournaments/constants/tournamentConstants";

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
|
| Six states, one more than a tournament has an equivalent for:
| "scheduled" is the gap between the opponent accepting and the first ball,
| which a tournament calls registration_closed. Different word because
| there is no registration in a series - one team was asked and said yes.
|
*/

export const SERIES_STATUS_META = {
  draft: {
    label: "DRAFT",
    bg: COLORS.surfaceContainer,
    fg: COLORS.onSurfaceVariant,
  },
  published: { label: "OPEN", bg: "#E2EDE0", fg: COLORS.primary },
  scheduled: { label: "SCHEDULED", bg: "#FFF3E0", fg: COLORS.secondary },
  live: { label: "LIVE", bg: COLORS.error, fg: "#ffffff" },
  completed: {
    label: "COMPLETED",
    bg: COLORS.surfaceContainer,
    fg: COLORS.outline,
  },
  cancelled: { label: "CANCELLED", bg: "#FEE2E2", fg: COLORS.error },
};

export const OPPONENT_STATUS_META = {
  pending: { label: "JAWAB KA INTEZAAR", fg: COLORS.secondary },
  accepted: { label: "CONFIRMED", fg: COLORS.primary },
  declined: { label: "DECLINED", fg: COLORS.error },
};

/*
|--------------------------------------------------------------------------
| Length presets
|--------------------------------------------------------------------------
|
| The organizer picks a NUMBER OF MATCHES, not a "best of".
|
| Best-of is a stopping rule - a best-of-5 ends at 3-0 and the last two
| are never played - and local cricket does not work that way. The ground
| is booked, both teams turned up, they play the dead rubber. So every
| match is scheduled, and the app says "series won, dead rubber to come"
| instead of cancelling fixtures.
|
| Odd numbers first because an even-length series can end level, which is
| a real outcome but rarely the one anybody wants.
|
*/

export const LENGTH_PRESETS = [
  { matches: 1, label: "One-off", hint: "Ek match ka mukabla." },
  { matches: 3, label: "3 matches", hint: "Sabse common. Do weekend." },
  { matches: 5, label: "5 matches", hint: "Lamba series, teen weekend." },
  { matches: 7, label: "7 matches", hint: "Poora season jaisa." },
];

export const MATCH_TYPES = ["T10", "T20", "ODI", "Test", "Other"];

/*
| Ordinals for the fixture labels - "1st T20", "2nd T20". Kept here as
| well as on the server because the app builds the same label when it is
| showing a fixture that has not been generated yet.
*/

export const ordinal = (n) => {
  if (n === 1) return "1st";

  if (n === 2) return "2nd";

  if (n === 3) return "3rd";

  return `${n}th`;
};

/*
| The one-line summary a card shows under the scoreline.
|
| It reads the state rather than the numbers alone, because "2-1" means
| something different depending on whether the series is over: mid-series
| it is a lead, at the end it is a result.
*/

export const scorelineSummary = (series) => {
  if (!series) return "";

  const a = series.teamAWins ?? 0;

  const b = series.teamBWins ?? 0;

  const total = series.totalMatches ?? 0;

  const played = a + b + (series.drawnMatches ?? 0);

  if (series.status === "cancelled") return "Series cancel ho gaya.";

  if (series.opponentStatus === "pending") {
    return "Opponent ke jawab ka intezaar hai.";
  }

  if (!played) return `${total} match ka series.`;

  if (series.status === "completed") {
    if (a === b) return `Series ${a}-${b} barabar rahi.`;

    return `Series ${Math.max(a, b)}-${Math.min(a, b)} se jeeti.`;
  }

  if (series.decidedAt) {
    return `Series decide ho chuki — ${Math.max(a, b)}-${Math.min(a, b)}.`;
  }

  if (a === b) return `${a}-${b} barabar, ${total - played} match baaki.`;

  return `${Math.max(a, b)}-${Math.min(a, b)}, ${total - played} match baaki.`;
};
