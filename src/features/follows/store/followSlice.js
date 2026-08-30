import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  followApi,
  unfollowApi,
  getFollowStatsApi,
  getFollowersApi,
  getMyFollowingApi,
} from "../services/follow.service";

/*
|--------------------------------------------------------------------------
| Follow Slice
|--------------------------------------------------------------------------
|
| The shape here is driven by one requirement: a search result list can
| show twenty Follow buttons at once, and tapping one must not re-render or
| re-fetch the other nineteen.
|
| So state is keyed by "TYPE:id" rather than held as a list:
|
|   byTarget   - { isFollowing, followers, following } per target
|   pending    - which targets have a request in flight, so only that one
|                button shows a spinner and can be disabled
|
| OPTIMISTIC UPDATES
| The toggle flips byTarget immediately and rolls back if the request
| fails. Waiting for the round trip made the button feel broken on a slow
| connection - you tap, nothing happens, you tap again, and the second tap
| unfollows what the first one followed.
|
*/

export const targetKey = (targetType, targetId) =>
  `${targetType}:${targetId}`;

const initialState = {
  byTarget: {},

  pending: {},

  followers: [],

  followersLoading: false,

  following: {
    players: [],

    teams: [],
  },

  followingLoading: false,

  error: null,
};

/*
|--------------------------------------------------------------------------
| Follow
|--------------------------------------------------------------------------
*/

export const followTarget = createAsyncThunk(
  "follow/followTarget",
  async ({ targetType, targetId }, { rejectWithValue }) => {
    try {
      await followApi(targetType, targetId);

      return { targetType, targetId };
    } catch (error) {
      return rejectWithValue({
        targetType,

        targetId,

        message:
          error.response?.data?.message ||
          error.message ||
          "Could not follow. Please try again.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| Unfollow
|--------------------------------------------------------------------------
*/

export const unfollowTarget = createAsyncThunk(
  "follow/unfollowTarget",
  async ({ targetType, targetId }, { rejectWithValue }) => {
    try {
      await unfollowApi(targetType, targetId);

      return { targetType, targetId };
    } catch (error) {
      return rejectWithValue({
        targetType,

        targetId,

        message:
          error.response?.data?.message ||
          error.message ||
          "Could not unfollow. Please try again.",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| Stats
|--------------------------------------------------------------------------
*/

export const fetchFollowStats = createAsyncThunk(
  "follow/fetchFollowStats",
  async ({ targetType, targetId }, { rejectWithValue }) => {
    try {
      const data = await getFollowStatsApi(targetType, targetId);

      return { targetType, targetId, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Could not load follow stats.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Lists
|--------------------------------------------------------------------------
*/

export const fetchFollowers = createAsyncThunk(
  "follow/fetchFollowers",
  async ({ targetType, targetId }, { rejectWithValue }) => {
    try {
      return await getFollowersApi(targetType, targetId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Could not load followers.",
      );
    }
  },
);

export const fetchMyFollowing = createAsyncThunk(
  "follow/fetchMyFollowing",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyFollowingApi();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Could not load who you follow.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const followSlice = createSlice({
  name: "follow",

  initialState,

  reducers: {
    /*
    | Seeds follow state straight from a payload that already carries it -
    | search results arrive with isFollowing and followerCount stamped on
    | each row, so the buttons render correctly on first paint instead of
    | flashing "Follow" and then correcting themselves.
    */

    hydrateFollowState(state, action) {
      const entries = action.payload || [];

      entries.forEach((entry) => {
        if (!entry?.targetType || !entry?.targetId) {
          return;
        }

        const key = targetKey(entry.targetType, entry.targetId);

        /*
        | An in-flight toggle must win over hydration. Without this, a
        | search refresh landing mid-request would snap the button back to
        | its old state and then flip again when the request returned.
        */

        if (state.pending[key]) {
          return;
        }

        state.byTarget[key] = {
          isFollowing: !!entry.isFollowing,

          followers: Math.max(0, entry.followerCount || 0),

          following: state.byTarget[key]?.following ?? 0,
        };
      });
    },

    clearFollowError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | Optimistic Follow
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(followTarget.pending, (state, action) => {
        const { targetType, targetId } = action.meta.arg;

        const key = targetKey(targetType, targetId);

        state.pending[key] = true;

        const current = state.byTarget[key] || {
          isFollowing: false,
          followers: 0,
          following: 0,
        };

        state.byTarget[key] = {
          ...current,

          isFollowing: true,

          followers: current.followers + 1,
        };
      })

      .addCase(followTarget.fulfilled, (state, action) => {
        const { targetType, targetId } = action.payload;

        delete state.pending[targetKey(targetType, targetId)];
      })

      .addCase(followTarget.rejected, (state, action) => {
        const { targetType, targetId, message } = action.payload || {};

        if (!targetType) {
          state.error = "Could not follow. Please try again.";

          return;
        }

        const key = targetKey(targetType, targetId);

        delete state.pending[key];

        // Roll back the optimistic flip.
        const current = state.byTarget[key];

        if (current) {
          state.byTarget[key] = {
            ...current,

            isFollowing: false,

            followers: Math.max(0, current.followers - 1),
          };
        }

        state.error = message;
      })

      /*
      |--------------------------------------------------------------------------
      | Optimistic Unfollow
      |--------------------------------------------------------------------------
      */

      .addCase(unfollowTarget.pending, (state, action) => {
        const { targetType, targetId } = action.meta.arg;

        const key = targetKey(targetType, targetId);

        state.pending[key] = true;

        const current = state.byTarget[key] || {
          isFollowing: true,
          followers: 1,
          following: 0,
        };

        state.byTarget[key] = {
          ...current,

          isFollowing: false,

          followers: Math.max(0, current.followers - 1),
        };
      })

      .addCase(unfollowTarget.fulfilled, (state, action) => {
        const { targetType, targetId } = action.payload;

        delete state.pending[targetKey(targetType, targetId)];
      })

      .addCase(unfollowTarget.rejected, (state, action) => {
        const { targetType, targetId, message } = action.payload || {};

        if (!targetType) {
          state.error = "Could not unfollow. Please try again.";

          return;
        }

        const key = targetKey(targetType, targetId);

        delete state.pending[key];

        const current = state.byTarget[key];

        if (current) {
          state.byTarget[key] = {
            ...current,

            isFollowing: true,

            followers: current.followers + 1,
          };
        }

        state.error = message;
      })

      /*
      |--------------------------------------------------------------------------
      | Stats
      |--------------------------------------------------------------------------
      */

      .addCase(fetchFollowStats.fulfilled, (state, action) => {
        const { targetType, targetId, data } = action.payload;

        const key = targetKey(targetType, targetId);

        /*
        | Server truth, but never applied over an in-flight toggle - the
        | request that is still running is newer than this response.
        */

        if (state.pending[key]) {
          return;
        }

        state.byTarget[key] = {
          isFollowing: !!data?.isFollowing,

          followers: Math.max(0, data?.followers || 0),

          following: Math.max(0, data?.following || 0),
        };
      })

      /*
      |--------------------------------------------------------------------------
      | Lists
      |--------------------------------------------------------------------------
      */

      .addCase(fetchFollowers.pending, (state) => {
        state.followersLoading = true;

        state.error = null;
      })

      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followersLoading = false;

        state.followers = action.payload || [];
      })

      .addCase(fetchFollowers.rejected, (state, action) => {
        state.followersLoading = false;

        state.error = action.payload;
      })

      .addCase(fetchMyFollowing.pending, (state) => {
        state.followingLoading = true;

        state.error = null;
      })

      .addCase(fetchMyFollowing.fulfilled, (state, action) => {
        state.followingLoading = false;

        state.following = {
          players: action.payload?.players || [],

          teams: action.payload?.teams || [],
        };
      })

      .addCase(fetchMyFollowing.rejected, (state, action) => {
        state.followingLoading = false;

        state.error = action.payload;
      });
  },
});

export const { hydrateFollowState, clearFollowError } = followSlice.actions;

export default followSlice.reducer;
