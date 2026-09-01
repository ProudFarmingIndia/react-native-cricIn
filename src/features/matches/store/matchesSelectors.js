import { createSelector } from "@reduxjs/toolkit";

/*
|--------------------------------------------------------------------------
| Matches Selectors
|--------------------------------------------------------------------------
|
| Every read of state.matches goes through here, so a change to the slice's
| shape is a change to this file and not to a dozen screens.
|
| DEFENSIVE ROOT
|
| selectMatchesState falls back to an empty shape rather than reading
| state.matches directly. The slice is newly registered, and a screen built
| against a store that predates it - an older bundle, a test harness, a
| persisted state from before the key existed - would otherwise crash on
| `undefined.live`. This is exactly the failure the note in rootReducer.js
| describes: an absent reducer does not throw at the store, it throws in
| whichever component selects it.
|
| MEMOISED WHERE IT DERIVES
|
| Plain field reads are plain functions - wrapping those in createSelector
| buys nothing. The sorted lists ARE memoised, because sort() produces a
| new array every call, and a selector returning a new array on every run
| re-renders its component on every store change, however unrelated.
|
*/

const EMPTY_LIST = { items: [], loading: false, error: null, lastFetchedAt: null };

const EMPTY_STATE = {
  live: EMPTY_LIST,
  upcoming: EMPTY_LIST,
  recent: EMPTY_LIST,
  byId: {},
  byIdStatus: {},
};

export const selectMatchesState = (state) => state?.matches || EMPTY_STATE;

const selectList = (key) => (state) => selectMatchesState(state)[key] || EMPTY_LIST;

// ── Raw lists, in whatever order the server sent ──────────────────────────

export const selectLiveMatches = (state) => selectList("live")(state).items;
export const selectUpcomingMatches = (state) => selectList("upcoming")(state).items;
export const selectRecentMatches = (state) => selectList("recent")(state).items;

// ── Per-list status ───────────────────────────────────────────────────────

export const selectLiveLoading = (state) => selectList("live")(state).loading;
export const selectUpcomingLoading = (state) => selectList("upcoming")(state).loading;
export const selectRecentLoading = (state) => selectList("recent")(state).loading;

export const selectLiveError = (state) => selectList("live")(state).error;
export const selectUpcomingError = (state) => selectList("upcoming")(state).error;
export const selectRecentError = (state) => selectList("recent")(state).error;

export const selectLiveLastFetchedAt = (state) =>
  selectList("live")(state).lastFetchedAt;

export const selectUpcomingLastFetchedAt = (state) =>
  selectList("upcoming")(state).lastFetchedAt;

export const selectRecentLastFetchedAt = (state) =>
  selectList("recent")(state).lastFetchedAt;

// True when any of the three lists is in flight.
export const selectAnyMatchListLoading = (state) =>
  selectLiveLoading(state) ||
  selectUpcomingLoading(state) ||
  selectRecentLoading(state);

// ── One match, by id ──────────────────────────────────────────────────────

/*
| These take the id as an argument, so they are called as
| useSelector((s) => selectMatchById(s, matchId)) rather than
| useSelector(selectMatchById).
*/

export const selectMatchById = (state, matchId) =>
  selectMatchesState(state).byId[String(matchId || "")] || null;

const EMPTY_STATUS = { loading: false, error: null };

export const selectMatchStatusById = (state, matchId) =>
  selectMatchesState(state).byIdStatus[String(matchId || "")] || EMPTY_STATUS;

export const selectMatchLoadingById = (state, matchId) =>
  selectMatchStatusById(state, matchId).loading;

export const selectMatchErrorById = (state, matchId) =>
  selectMatchStatusById(state, matchId).error;

/*
|--------------------------------------------------------------------------
| Sorted Lists
|--------------------------------------------------------------------------
|
| The same ordering the screens apply today, in one place so Home and the
| Matches tab cannot drift apart.
|
| Upcoming is SOONEST FIRST. The API returns it unordered, so a fixture
| three weeks out could sit above one starting this afternoon - the exact
| opposite of what an "Upcoming" list is for. Fixtures with no date sort
| last: they are real and should not vanish, but they cannot claim a place
| in a queue ordered by time.
*/

const startTime = (match) =>
  new Date(match?.scheduledStartTime || match?.startTime || 0).getTime();

const endTime = (match) =>
  new Date(match?.endTime || match?.startTime || 0).getTime();

export const selectUpcomingMatchesSorted = createSelector(
  [selectUpcomingMatches],
  (items) =>
    [...items].sort((a, b) => {
      const at = startTime(a);
      const bt = startTime(b);

      const aValid = at > 0;
      const bValid = bt > 0;

      if (!aValid && !bValid) return 0;
      if (!aValid) return 1;
      if (!bValid) return -1;

      return at - bt;
    }),
);

// Most recent first - the opposite question to the one above.
export const selectRecentMatchesSorted = createSelector(
  [selectRecentMatches],
  (items) => [...items].sort((a, b) => endTime(b) - endTime(a)),
);

/*
| Live matches this user is scoring, as opposed to live matches involving
| a team they manage. The sidebar's Live Scoring list wants the first set;
| the Matches tab wants the second.
|
| Takes the user id rather than reading auth state, so it stays a pure
| function of the arguments and cannot be broken by a change to the auth
| slice's shape.
*/

export const selectLiveMatchesScoredBy = (state, userId) => {
  const me = String(userId || "");

  if (!me) return [];

  return selectLiveMatches(state).filter(
    (match) =>
      String(match?.scorerUserId || "") === me ||
      String(match?.inviteSenderUserId || "") === me ||
      String(match?.userId || "") === me,
  );
};
