import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  searchPlayersApi,
  searchPlayerByMobileApi,
  searchTeamsApi,
  searchGroundsApi,
  searchTournamentsApi,
  globalSearchApi,
} from "../services/search.service";

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  players: [],

  teams: [],

  grounds: [],

  tournaments: [],

  globalResults: [],

  loading: false,

  success: false,

  error: null,
};

/*
|--------------------------------------------------------------------------
| Search Players
|--------------------------------------------------------------------------
*/

export const searchPlayers = createAsyncThunk(
  "search/searchPlayers",
  async (keyword, { rejectWithValue }) => {
    try {
      return await searchPlayersApi(keyword);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search players.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Search Teams
|--------------------------------------------------------------------------
*/

export const searchTeams = createAsyncThunk(
  "search/searchTeams",
  async (keyword, { rejectWithValue }) => {
    try {
      return await searchTeamsApi(keyword);
    } catch (error) {
      console.log("==================================");
      console.log("SEARCH PLAYER API ERROR");
      console.log("Status :", error.response?.status);
      console.log("Response :", error.response?.data);
      console.log("Message :", error.message);
      console.log("==================================");

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to search players.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Search Grounds
|--------------------------------------------------------------------------
*/

export const searchGrounds = createAsyncThunk(
  "search/searchGrounds",
  async (keyword, { rejectWithValue }) => {
    try {
      return await searchGroundsApi(keyword);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search grounds.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Search Tournaments
|--------------------------------------------------------------------------
*/

export const searchTournaments = createAsyncThunk(
  "search/searchTournaments",
  async (keyword, { rejectWithValue }) => {
    try {
      return await searchTournamentsApi(keyword);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search tournaments.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Global Search
|--------------------------------------------------------------------------
*/

export const globalSearch = createAsyncThunk(
  "search/globalSearch",
  async (keyword, { rejectWithValue }) => {
    try {
      return await globalSearchApi(keyword);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Search Player By Mobile
|--------------------------------------------------------------------------
*/

export const searchPlayerByMobile = createAsyncThunk(
  "search/searchPlayerByMobile",
  async (mobile, { rejectWithValue }) => {
    try {
      return await searchPlayerByMobileApi(mobile);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search player.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Search Slice
|--------------------------------------------------------------------------
*/

const searchSlice = createSlice({
  name: "search",

  initialState,

  reducers: {
    /*
    |--------------------------------------------------------------------------
    | Clear Error
    |--------------------------------------------------------------------------
    */

    clearSearchError(state) {
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | Clear Success
    |--------------------------------------------------------------------------
    */

    clearSearchSuccess(state) {
      state.success = false;
    },

    /*
    |--------------------------------------------------------------------------
    | Clear Search Results
    |--------------------------------------------------------------------------
    */

    clearSearchResults(state) {
      state.players = [];
      state.teams = [];
      state.grounds = [];
      state.tournaments = [];
      state.globalResults = [];
    },

    /*
    |--------------------------------------------------------------------------
    | Reset Search State
    |--------------------------------------------------------------------------
    */

    resetSearchState(state) {
      state.players = [];
      state.teams = [];
      state.grounds = [];
      state.tournaments = [];
      state.globalResults = [];

      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | Pending Reducer
    |--------------------------------------------------------------------------
    */

    const pendingReducer = (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    };

    /*
    |--------------------------------------------------------------------------
    | Rejected Reducer
    |--------------------------------------------------------------------------
    */

    const rejectedReducer = (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    };

    builder

      /*
      |--------------------------------------------------------------------------
      | Pending
      |--------------------------------------------------------------------------
      */

      .addCase(searchPlayers.pending, pendingReducer)

      .addCase(searchTeams.pending, pendingReducer)

      .addCase(searchGrounds.pending, pendingReducer)

      .addCase(searchTournaments.pending, pendingReducer)

      .addCase(globalSearch.pending, pendingReducer)

      .addCase(searchPlayerByMobile.pending, pendingReducer)

      /*
      |--------------------------------------------------------------------------
      | Rejected
      |--------------------------------------------------------------------------
      */

      .addCase(searchPlayers.rejected, rejectedReducer)

      .addCase(searchTeams.rejected, rejectedReducer)

      .addCase(searchGrounds.rejected, rejectedReducer)

      .addCase(searchTournaments.rejected, rejectedReducer)

      .addCase(globalSearch.rejected, rejectedReducer)

      .addCase(searchPlayerByMobile.rejected, rejectedReducer)

      /*
      |--------------------------------------------------------------------------
      | Fulfilled
      |--------------------------------------------------------------------------
      */

      .addCase(searchPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.players = action.payload || [];
      })

      .addCase(searchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.teams = action.payload || [];
      })

      .addCase(searchGrounds.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.grounds = action.payload || [];
      })

      .addCase(searchTournaments.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.tournaments = action.payload || [];
      })

      .addCase(searchPlayerByMobile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.players = action.payload?.player ? [action.payload.player] : [];
      })

      .addCase(globalSearch.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.globalResults = action.payload || [];
      });
  },
});

/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

export const {
  clearSearchError,

  clearSearchSuccess,

  clearSearchResults,

  resetSearchState,
} = searchSlice.actions;

/*
|--------------------------------------------------------------------------
| Reducer
|--------------------------------------------------------------------------
*/

export default searchSlice.reducer;
