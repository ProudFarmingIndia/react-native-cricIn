import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Grounds
|
| File:
| groundConstants.js
|
| Description:
| Labels, colours and formatters the grounds screens share.
|
| WHAT IS *NOT* HERE, ON PURPOSE
|
| The facility list, pitch types, sort options and distance buckets all
| come from GET /grounds/options at runtime. Keeping a second copy here
| would mean the day somebody adds "shower" to the server, the filter bar
| silently does not offer it - and worse, a hardcoded list can offer
| something the schema rejects, which fails at save time with a validation
| error the user cannot act on.
|
| The FALLBACK_* values below exist only for the first render before that
| request lands, and for a cold start with no network. They are deliberately
| short - enough that the screen is not empty, not a mirror of the server.
|
|--------------------------------------------------------------------------
*/

export const FALLBACK_DISTANCES = [5, 10, 25, 50];

export const FALLBACK_SORTS = [
  { key: "distance", label: "Nearest" },
  { key: "price", label: "Cheapest" },
  { key: "rating", label: "Top rated" },
  { key: "hygiene", label: "Cleanest" },
  { key: "reliability", label: "Most reliable" },
];

export const FALLBACK_PITCH_TYPES = [
  { key: "turf", label: "Turf" },
  { key: "matting", label: "Matting" },
  { key: "cement", label: "Cement" },
  { key: "astro_turf", label: "Astro turf" },
  { key: "mud", label: "Mud" },
];

/*
|--------------------------------------------------------------------------
| Booking status, as a person reads it
|--------------------------------------------------------------------------
|
| Two labels per status, because the same row means different things to the
| two sides. A "requested" booking is "Waiting for owner" to the team and
| "Needs your answer" to the owner - and the second one is the whole reason
| a ground owner opens this app.
|
| One shared map rather than two, so a new status cannot be added to one
| side and forgotten on the other.
*/

export const BOOKING_STATUS_META = {
  requested: {
    player: "Waiting for owner",
    owner: "Needs your answer",
    bg: COLORS.surfaceContainerHigh,
    fg: COLORS.onSurfaceVariant,
    icon: "time-outline",
  },

  countered: {
    player: "New time offered",
    owner: "Offer sent",
    bg: "#fff1d6",
    fg: "#8f4e00",
    icon: "swap-horizontal-outline",
  },

  confirmed: {
    player: "Confirmed",
    owner: "Confirmed",
    bg: "#d9f2da",
    fg: "#1b5e20",
    icon: "checkmark-circle-outline",
  },

  rejected: {
    player: "Declined",
    owner: "You declined",
    bg: COLORS.errorContainer,
    fg: COLORS.onErrorContainer,
    icon: "close-circle-outline",
  },

  cancelled: {
    player: "Cancelled",
    owner: "Cancelled",
    bg: COLORS.errorContainer,
    fg: COLORS.onErrorContainer,
    icon: "close-circle-outline",
  },

  expired: {
    player: "No answer - expired",
    owner: "Expired unanswered",
    bg: COLORS.surfaceContainerHigh,
    fg: COLORS.outline,
    icon: "hourglass-outline",
  },

  completed: {
    player: "Played",
    owner: "Completed",
    bg: COLORS.surfaceContainerHigh,
    fg: COLORS.onSurfaceVariant,
    icon: "flag-outline",
  },

  no_show: {
    player: "Marked no-show",
    owner: "No show",
    bg: COLORS.errorContainer,
    fg: COLORS.onErrorContainer,
    icon: "alert-circle-outline",
  },
};

export const statusMeta = (status, asOwner = false) => {
  const meta = BOOKING_STATUS_META[status] || BOOKING_STATUS_META.requested;

  return { ...meta, label: asOwner ? meta.owner : meta.player };
};

/*
| Slot colours. "booked" and "blocked" look the same to a thumb but not to
| a reader - the reason line tells them apart, so the swatch does not have
| to.
*/

export const SLOT_STATUS_META = {
  available: {
    bg: COLORS.surfaceContainerLowest,
    border: COLORS.primary,
    fg: COLORS.onSurface,
  },

  booked: {
    bg: COLORS.surfaceContainerHigh,
    border: COLORS.outlineVariant,
    fg: COLORS.outline,
  },

  blocked: {
    bg: COLORS.errorContainer,
    border: COLORS.errorContainer,
    fg: COLORS.onErrorContainer,
  },

  past: {
    bg: COLORS.surfaceContainer,
    border: COLORS.surfaceContainer,
    fg: COLORS.outline,
  },
};

/*
|--------------------------------------------------------------------------
| Flexibility
|--------------------------------------------------------------------------
|
| The single highest-leverage field on the booking form, and the one a user
| will skip unless the copy explains what it buys them. So each option says
| what happens, not just how many minutes it is.
*/

export const FLEXIBILITY_OPTIONS = [
  {
    value: 0,
    label: "Exact time only",
    hint: "Owner sirf accept ya reject kar sakta hai",
  },
  {
    value: 30,
    label: "Up to 30 min",
    hint: "Owner thoda aage-peeche kar sakta hai",
  },
  {
    value: 60,
    label: "Up to 1 hour",
    hint: "Sabse zyada chance ki booking mil jaaye",
  },
];

export const PURPOSES = [
  { key: "match", label: "Match", icon: "trophy-outline" },
  { key: "practice", label: "Practice", icon: "fitness-outline" },
  { key: "net", label: "Net session", icon: "grid-outline" },
];

export const CANCEL_REASONS = [
  "Team ready nahi hai",
  "Mausam kharab hai",
  "Doosra ground mil gaya",
  "Match postpone ho gaya",
];

export const REJECT_REASONS = [
  "Ye slot pehle se book hai",
  "Maintenance chal raha hai",
  "Ground us din band hai",
  "Tournament chal raha hai",
];

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
|
| Every screen in the feature prints dates and money, and they have to
| match. "Rs 1,200" on one screen and "₹1200" on the next reads like two
| different apps.
*/

export const money = (value) => {
  const n = Number(value);

  if (!Number.isFinite(n)) return "—";

  return `₹${n.toLocaleString("en-IN")}`;
};

export const fmtDate = (value) => {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export const fmtTime = (value) => {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const fmtSlot = (start, end) => {
  if (!start) return "";

  return `${fmtDate(start)} · ${fmtTime(start)} – ${fmtTime(end)}`;
};

/* "06:00" -> "6:00 AM", for the owner's block editor and the unit hours. */

export const fmtHHMM = (hhmm) => {
  if (!hhmm) return "";

  const [h, m] = String(hhmm).split(":");

  const hour = Number(h);

  if (!Number.isFinite(hour)) return hhmm;

  const suffix = hour >= 12 ? "PM" : "AM";

  const display = hour % 12 === 0 ? 12 : hour % 12;

  return `${display}:${m || "00"} ${suffix}`;
};

/*
| A YYYY-MM-DD string in LOCAL time, which is what the server's `date`
| parameter expects. toISOString() would be wrong - it converts to UTC
| first, so anything before 5:30 AM in India comes out as the previous day
| and the user sees yesterday's slots.
*/

export const toDateParam = (date) => {
  const d = new Date(date);

  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* The next N days, for the horizontal date strip on the slot picker. */

export const nextDays = (count = 14, from = new Date()) => {
  const base = new Date(from);

  base.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);

    d.setDate(base.getDate() + i);

    return {
      date: d,
      param: toDateParam(d),
      day: DAY_LABELS[d.getDay()],
      num: d.getDate(),
      isToday: i === 0,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });
};

/*
|--------------------------------------------------------------------------
| Reliability, as one sentence
|--------------------------------------------------------------------------
|
| The server sends responseRate, onTimeRate and promiseScore. Three
| percentages on a card is noise; the point is whether to trust this ground,
| so they are turned into one line and a colour.
|
| A ground with too little history gets "New" rather than a made-up number.
| Nothing is more corrosive to a rating system than a confident percentage
| computed from two bookings.
*/

export const reliabilityLabel = (ground) => {
  const stats = ground?.stats || {};

  const completed = Number(stats.completedBookings || 0);

  const received = Number(stats.requestsReceived || 0);

  if (completed < 3 && received < 3) {
    return { label: "New ground", tone: COLORS.outline };
  }

  const answered = received ? stats.requestsAnswered / received : 1;

  const onTime = completed ? 1 - stats.lateStarts / completed : 1;

  const score = Math.round((answered * 0.5 + onTime * 0.5) * 100);

  if (score >= 90) return { label: "Very reliable", tone: COLORS.success };

  if (score >= 70) return { label: "Usually on time", tone: COLORS.secondary };

  return { label: "Mixed record", tone: COLORS.error };
};
