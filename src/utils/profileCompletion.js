/*
|--------------------------------------------------------------------------
| Profile Completion
|--------------------------------------------------------------------------
|
| The single source of truth for "how complete is this player profile".
|
| Both HomeScreen and ProfileScreen used to show a hardcoded number -
| HomeScreen said 75% (in the text AND in progressFill's width), and
| HeroSection read player.profileCompletion, a schema field the backend
| never writes, so it was permanently 0. Two screens, two different
| wrong answers for the same question.
|
| Computed on the client rather than the server because every field it
| checks is already in the profile payload, so it stays correct the
| instant the user saves - no extra request, and nothing to keep in sync.
|
| Every check is worth the same. That keeps the number predictable and
| easy to explain: "18 of 20 things filled in" is honest in a way that
| weighted scoring isn't.
|
| Covers exactly what the profile surfaces: the header images, the
| Overview fields (personal, cricket, favourites), Gallery, and Highlights.
|
*/

const filled = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const hasItems = (value) => Array.isArray(value) && value.length > 0;

/*
|--------------------------------------------------------------------------
| Checks
|--------------------------------------------------------------------------
|
| `label` is written as the action still to take, so the list of missing
| items reads as a to-do rather than a scolding.
|
*/

export const COMPLETION_CHECKS = [
  // Personal
  {
    key: "profileImage",
    section: "Personal",
    label: "Add a profile photo",
    isDone: (p) => filled(p?.profileImage?.url),
  },
  {
    key: "coverPhoto",
    section: "Personal",
    label: "Add a cover photo",
    isDone: (p) => filled(p?.coverPhoto?.url),
  },
  {
    key: "playerName",
    section: "Personal",
    label: "Add your name",
    isDone: (p) => filled(p?.playerName),
  },
  {
    key: "dob",
    section: "Personal",
    label: "Add your date of birth",
    isDone: (p) => filled(p?.dob),
  },
  {
    key: "gender",
    section: "Personal",
    label: "Add your gender",
    isDone: (p) => filled(p?.gender),
  },
  {
    key: "bio",
    section: "Personal",
    label: "Write a short bio",
    isDone: (p) => filled(p?.bio),
  },
  {
    key: "city",
    section: "Personal",
    label: "Add your city",
    isDone: (p) => filled(p?.city),
  },
  {
    key: "state",
    section: "Personal",
    label: "Add your state",
    isDone: (p) => filled(p?.state),
  },
  {
    key: "country",
    section: "Personal",
    label: "Add your country",
    isDone: (p) => filled(p?.country),
  },

  // Cricket
  {
    key: "playerType",
    section: "Cricket",
    label: "Choose your player type",
    isDone: (p) => filled(p?.playerType),
  },
  {
    key: "battingStyle",
    section: "Cricket",
    label: "Add your batting style",
    isDone: (p) => filled(p?.battingStyle),
  },
  {
    key: "bowlingStyle",
    section: "Cricket",
    label: "Add your bowling style",
    isDone: (p) => filled(p?.bowlingStyle),
  },
  {
    key: "jerseyNumber",
    section: "Cricket",
    label: "Pick a jersey number",
    isDone: (p) => filled(p?.jerseyNumber),
  },

  // Favourites
  {
    key: "favoriteTeam",
    section: "Favourites",
    label: "Add your favourite team",
    isDone: (p) => filled(p?.favoriteTeam),
  },
  {
    key: "favoriteCricketer",
    section: "Favourites",
    label: "Add your favourite cricketer",
    isDone: (p) => filled(p?.favoriteCricketer),
  },
  {
    key: "favoriteShot",
    section: "Favourites",
    label: "Add your favourite shot",
    isDone: (p) => filled(p?.favoriteShot),
  },
  {
    key: "favoriteBall",
    section: "Favourites",
    label: "Add your favourite delivery",
    isDone: (p) => filled(p?.favoriteBall),
  },

  // Gallery & Highlights
  {
    key: "gallery",
    section: "Gallery",
    label: "Upload a photo or video",
    isDone: (p) => hasItems(p?.gallery),
  },
  {
    key: "highlights",
    section: "Highlights",
    label: "Add a career highlight",
    isDone: (p) => hasItems(p?.highlights),
  },
  {
    key: "achievements",
    section: "Highlights",
    label: "Add an achievement",
    isDone: (p) => hasItems(p?.achievements),
  },
];

/*
|--------------------------------------------------------------------------
| Headline
|--------------------------------------------------------------------------
|
| HomeScreen shows a line of encouragement above the bar. It used to be
| the fixed string "Almost there, Champ!" regardless of the real state,
| which read as sarcasm on an empty profile.
|
*/

const headlineFor = (percent) => {
  if (percent >= 100) return "Your profile is complete";
  if (percent >= 75) return "Almost there, Champ!";
  if (percent >= 40) return "Good start - keep going";
  if (percent > 0) return "Let's finish your profile";
  return "Let's set up your profile";
};

/*
|--------------------------------------------------------------------------
| getProfileCompletion
|--------------------------------------------------------------------------
|
| Returns:
|   percent    - 0-100, rounded
|   completed  - how many checks passed
|   total      - how many checks there are
|   missing    - [{ key, section, label }] still to do, in display order
|   isComplete - percent === 100
|   headline   - short encouragement line
|
| A null/undefined profile returns a valid zeroed result rather than
| throwing, so callers can render before the profile has loaded.
|
*/

export function getProfileCompletion(profile) {
  const total = COMPLETION_CHECKS.length;

  if (!profile) {
    return {
      percent: 0,
      completed: 0,
      total,
      missing: COMPLETION_CHECKS.map(({ key, section, label }) => ({
        key,
        section,
        label,
      })),
      isComplete: false,
      headline: headlineFor(0),
    };
  }

  const missing = [];

  let completed = 0;

  COMPLETION_CHECKS.forEach(({ key, section, label, isDone }) => {
    if (isDone(profile)) {
      completed += 1;
      return;
    }

    missing.push({ key, section, label });
  });

  const percent = Math.round((completed / total) * 100);

  return {
    percent,
    completed,
    total,
    missing,
    isComplete: percent === 100,
    headline: headlineFor(percent),
  };
}

export default getProfileCompletion;
