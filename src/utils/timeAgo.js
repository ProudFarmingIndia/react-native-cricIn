/*
|--------------------------------------------------------------------------
| timeAgo
|--------------------------------------------------------------------------
|
| Notification cards were rendering `createdAt` straight from the API -
| a raw ISO string like "2026-08-28T05:12:50.996Z" - which is unreadable
| at a glance and takes more room than the message it sits under.
|
| Deliberately no dependency: date-fns/dayjs would be a whole package for
| one function, and the app has no date library today.
|
*/

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

export function timeAgo(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  // Clock skew, or a server timestamp a second in the future.
  if (seconds < 0) return "Just now";

  if (seconds < 45) return "Just now";

  if (seconds < HOUR) {
    const minutes = Math.floor(seconds / MINUTE);
    return `${minutes}m ago`;
  }

  if (seconds < DAY) {
    const hours = Math.floor(seconds / HOUR);
    return `${hours}h ago`;
  }

  if (seconds < WEEK) {
    const days = Math.floor(seconds / DAY);
    return days === 1 ? "Yesterday" : `${days}d ago`;
  }

  /*
  | Past a week, a relative figure stops being useful ("6w ago" tells you
  | less than a date does), so switch to an absolute one - and add the
  | year once it isn't the current one.
  */

  const sameYear = date.getFullYear() === new Date().getFullYear();

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/*
|--------------------------------------------------------------------------
| formatDateTime
|--------------------------------------------------------------------------
|
| Full timestamp for the detail screen, where the exact moment matters
| more than "how long ago".
|
*/

export function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default timeAgo;
