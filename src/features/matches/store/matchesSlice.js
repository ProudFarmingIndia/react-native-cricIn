import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getLiveMatchesApi,
  getUpcomingMatchesApi,
  getRecentMatchesApi,
  getMatchByIdApi,
} from "../services/matches.services";

/*
|--------------------------------------------------------------------------
| Matches Slice
|--------------------------------------------------------------------------
|
| This file was 0 bytes - scaffolding the folder template stamped out and
| nobody filled in. Every match screen fetches through
| services/matches.services.js into its own useState instead, which works
| and is not being changed here.
|
| ADDITIVE ONLY
|
| Nothing reads this state yet. Adding it changes no screen's behaviour: it
| introduces a `matches` key that starts empty and stays empty until a
| screen opts in. Adopt it one screen at a time - see the note at the
| bottom of this file for what that looks like - and if it never gets
| adopted, it costs a few bytes of store and nothing else.
|
| WHAT IT IS FOR
|
| The one real cost of per-screen state is duplicate fetching. HomeScreen
| and MatchesTab both pull live/upcoming/recent, so moving between them
| refetches all three; LiveScoringScreen and MatchDetailsScreen both fetch
| the same match by id. This slice is where that gets fixed when it is
| worth fixing.
|
| TWO DELIBERATE CHOICES
|
|   PER-LIST LOADING, NOT ONE SHARED FLAG. A single `loading` shared by
|   every thunk is a bug waiting to happen - the scoring slice had exactly
|   that, and one screen's slow request silently disabled a button on
|   another. Live, upcoming, recent and by-id each own their status.
|
|   BY-ID IS A MAP, NOT A "currentMatch". Two screens can hold two
|   different matches at once (the scoring pad and a details screen behind
|   it). A single current-match field makes the second load overwrite the
|   first, which is how a screen ends up showing another match's score.
|
*/

/*
| Thunks return the raw API payload. matches.services.js has already
| unwrapped { success, data }, so what arrives here is the array or object
| itself.
|
| rejectWithValue gets a STRING, not the whole error object: the reducers
| store it and a screen renders it, and rendering an object as a message is
| how you get "[object Object]" in an alert.
*/

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const fetchLiveMatches = createAsyncThunk(
  "matches/fetchLive",
  async (_, thunkAPI) => {
    try {
      return await getLiveMatchesApi();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        errorMessage(error, "Could not load live matches."),
      );
    }
  },
);

export const fetchUpcomingMatches = createAsyncThunk(
  "matches/fetchUpcoming",
  async (_, thunkAPI) => {
    try {
      return await getUpcomingMatchesApi();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        errorMessage(error, "Could not load upcoming matches."),
      );
    }
  },
);

export const fetchRecentMatches = createAsyncThunk(
  "matches/fetchRecent",
  async (limit = 20, thunkAPI) => {
    try {
      return await getRecentMatchesApi(limit);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        errorMessage(error, "Could not load recent matches."),
      );
    }
  },
);

/*
| The match id travels through meta.arg so the reducers know WHICH match a
| pending/rejected action belongs to. Without it there is no way to clear
| the right entry's loading flag, and a failed load for match A would clear
| match B's spinner.
*/

export const fetchMatchById = createAsyncThunk(
  "matches/fetchById",
  async (matchId, thunkAPI) => {
    try {
      return await getMatchByIdApi(matchId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        errorMessage(error, "Could not load the match."),
      );
    }
  },
);

const emptyList = () => ({
  items: [],
  loading: false,
  error: null,

  /*
  | When this list was last successfully loaded, as epoch milliseconds.
  |
  | Nothing acts on it yet - there is no automatic invalidation here on
  | purpose, because a stale live score is worse than a slow one and
  | guessing a TTL is how you get both. It is recorded so a caller can ask
  | "is what I have fresh enough" and decide for itself.
  */
  lastFetchedAt: null,
});

const initialState = {
  live: emptyList(),
  upcoming: emptyList(),
  recent: emptyList(),

  /*
  | Individual matches, keyed by id: { [matchId]: match }.
  | byIdStatus holds { loading, error } per id, separately, so the match
  | data itself is never replaced by a status object.
  */
  byId: {},
  byIdStatus: {},
};

const asArray = (value) => (Array.isArray(value) ? value : []);

/*
| One pair of handlers per list, rather than three copies of the same eight
| lines. `key` picks which list the action belongs to.
*/

const listHandlers = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].loading = true;
      state[key].error = null;
    })

    .addCase(thunk.fulfilled, (state, action) => {
      state[key].loading = false;

      /*
      | asArray, because a failed unwrap or an unexpected response shape
      | would otherwise put a non-array in `items` and every consumer's
      | .map would throw.
      */
      state[key].items = asArray(action.payload);

      state[key].lastFetchedAt = Date.now();
    })

    .addCase(thunk.rejected, (state, action) => {
      state[key].loading = false;

      state[key].error = action.payload || "Something went wrong.";

      /*
      | The previous items are KEPT on failure. A refresh that fails should
      | leave the last good list on screen with an error beside it, not
      | blank the screen.
      */
    });
};

const matchesSlice = createSlice({
  name: "matches",

  initialState,

  reducers: {
    /*
    | Drop one match from the cache - use after an action that makes the
    | held copy wrong (starting it, ending it, changing the squad) so the
    | next read refetches.
    */
    invalidateMatch(state, action) {
      const id = String(action.payload || "");

      if (!id) return;

      delete state.byId[id];
      delete state.byIdStatus[id];
    },

    // Forces every list to refetch on next request.
    invalidateMatchLists(state) {
      state.live.lastFetchedAt = null;
      state.upcoming.lastFetchedAt = null;
      state.recent.lastFetchedAt = null;
    },

    clearMatchesError(state) {
      state.live.error = null;
      state.upcoming.error = null;
      state.recent.error = null;
    },

    // On sign-out. Match data is per-user; leaving it behind leaks it.
    resetMatchesState() {
      return {
        live: emptyList(),
        upcoming: emptyList(),
        recent: emptyList(),
        byId: {},
        byIdStatus: {},
      };
    },
  },

  extraReducers: (builder) => {
    listHandlers(builder, fetchLiveMatches, "live");
    listHandlers(builder, fetchUpcomingMatches, "upcoming");
    listHandlers(builder, fetchRecentMatches, "recent");

    builder
      .addCase(fetchMatchById.pending, (state, action) => {
        const id = String(action.meta.arg || "");

        if (!id) return;

        state.byIdStatus[id] = { loading: true, error: null };
      })

      .addCase(fetchMatchById.fulfilled, (state, action) => {
        const id = String(action.meta.arg || "");

        if (!id) return;

        state.byIdStatus[id] = { loading: false, error: null };

        // A null payload would poison the cache; only store a real match.
        if (action.payload) {
          state.byId[id] = action.payload;
        }
      })

      .addCase(fetchMatchById.rejected, (state, action) => {
        const id = String(action.meta.arg || "");

        if (!id) return;

        state.byIdStatus[id] = {
          loading: false,
          error: action.payload || "Could not load the match.",
        };

        // Any previously cached copy is left alone, as above.
      });
  },
});

export const {
  invalidateMatch,
  invalidateMatchLists,
  clearMatchesError,
  resetMatchesState,
} = matchesSlice.actions;

export default matchesSlice.reducer;

/*
|--------------------------------------------------------------------------
| Adopting This In A Screen
|--------------------------------------------------------------------------
|
| Nothing is required. When a screen is ready to move off local state:
|
|   const dispatch = useDispatch();
|   const live = useSelector(selectLiveMatches);
|   const loading = useSelector(selectLiveLoading);
|
|   useFocusEffect(
|     useCallback(() => {
|       dispatch(fetchLiveMatches());
|     }, [dispatch]),
|   );
|
| Move ONE screen, run it, then move the next. Converting HomeScreen and
| MatchesTab in the same change is how a shared-state bug gets introduced
| and then hides, because there is no longer a working screen to compare
| against.
|
*/
