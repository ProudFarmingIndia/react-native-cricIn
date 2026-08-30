import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getMyTeamsApi,
  getAllTeamsApi,
  getTeamByIdApi,
  createTeamApi,
  updateTeamApi,
  deleteTeamApi,
  addPlayerToTeamApi,
  removePlayerFromTeamApi,
  leaveTeamApi,
  setTeamCaptainApi,
  revokeViceCaptainApi,
  updateViceCaptainRightsApi,
  updateTeamStatsApi,
  createLocalPlayerApi,
} from "../services/team.service";

import { syncTeam } from "../helper/teamHelper";

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  myTeams: [],
  allTeams: [],
  currentTeam: null,

  loading: false,
  success: false,
  error: null,
};

/*
|--------------------------------------------------------------------------
| Get My Teams
|--------------------------------------------------------------------------
*/

export const getMyTeams = createAsyncThunk(
  "team/getMyTeams",
  async (_, thunkAPI) => {
    try {
      return await getMyTeamsApi();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Get All Teams
|--------------------------------------------------------------------------
*/

export const getAllTeams = createAsyncThunk(
  "team/getAllTeams",
  async (_, thunkAPI) => {
    try {
      return await getAllTeamsApi();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Get Team By Id
|--------------------------------------------------------------------------
*/

export const getTeamById = createAsyncThunk(
  "team/getTeamById",
  async (teamId, thunkAPI) => {
    try {
      return await getTeamByIdApi(teamId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Create Team
|--------------------------------------------------------------------------
*/

export const createTeam = createAsyncThunk(
  "team/createTeam",
  async (payload, thunkAPI) => {
    try {
      return await createTeamApi(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update Team
|--------------------------------------------------------------------------
*/

export const updateTeam = createAsyncThunk(
  "team/updateTeam",
  async ({ teamId, payload }, thunkAPI) => {
    try {
      return await updateTeamApi(teamId, payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Delete Team
|--------------------------------------------------------------------------
*/

export const deleteTeam = createAsyncThunk(
  "team/deleteTeam",
  async (teamId, thunkAPI) => {
    try {
      await deleteTeamApi(teamId);

      return teamId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Leave Team
|--------------------------------------------------------------------------
*/

export const leaveTeam = createAsyncThunk(
  "team/leaveTeam",
  async (teamId, thunkAPI) => {
    try {
      await leaveTeamApi(teamId);

      return teamId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Add Player
|--------------------------------------------------------------------------
*/

export const addPlayerToTeam = createAsyncThunk(
  "team/addPlayerToTeam",
  async ({ teamId, playerId }, thunkAPI) => {
    try {
      return await addPlayerToTeamApi(teamId, playerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Remove Player
|--------------------------------------------------------------------------
*/

export const removePlayerFromTeam = createAsyncThunk(
  "team/removePlayerFromTeam",
  async ({ teamId, playerId }, thunkAPI) => {
    try {
      return await removePlayerFromTeamApi(teamId, playerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Set Captain
|--------------------------------------------------------------------------
*/

export const setCaptain = createAsyncThunk(
  "team/setCaptain",
  async ({ teamId, captainId }, thunkAPI) => {
    try {
      return await setTeamCaptainApi(teamId, captainId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Set Vice Captain
|--------------------------------------------------------------------------
*/

/*
| There is deliberately no setViceCaptain thunk. This used to import
| setViceCaptainApi, which team.service.js never exported - so the import
| resolved to undefined and the thunk threw the moment it ran.
|
| Assigning a vice-captain is not a direct write anyway: it goes through
| viceCaptainProposal.service.js, because the candidate has to accept.
| Only the two operations below are direct, and both have real endpoints.
*/

export const revokeViceCaptain = createAsyncThunk(
  "team/revokeViceCaptain",
  async (teamId, thunkAPI) => {
    try {
      return await revokeViceCaptainApi(teamId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const updateViceCaptainRights = createAsyncThunk(
  "team/updateViceCaptainRights",
  async ({ teamId, rights }, thunkAPI) => {
    try {
      return await updateViceCaptainRightsApi(teamId, rights);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update Team Stats
|--------------------------------------------------------------------------
*/

export const updateTeamStats = createAsyncThunk(
  "team/updateTeamStats",
  async (teamId, thunkAPI) => {
    try {
      return await updateTeamStatsApi(teamId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Create Local Player
|--------------------------------------------------------------------------
*/

export const createLocalPlayer = createAsyncThunk(
  "team/createLocalPlayer",
  async ({ teamId, payload }, thunkAPI) => {
    try {
      return await createLocalPlayerApi(teamId, payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/
const teamSlice = createSlice({
  name: "team",

  initialState,

  reducers: {
    clearTeamError(state) {
      state.error = null;
    },

    clearTeamSuccess(state) {
      state.success = false;
    },

    resetCurrentTeam(state) {
      state.currentTeam = null;
      state.success = false;
      state.error = null;
    },

    resetTeamState(state) {
      state.myTeams = [];
      state.allTeams = [];
      state.currentTeam = null;

      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    const pendingReducer = (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    };

    const rejectedReducer = (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload || "Something went wrong.";
    };

    builder

      /*
      |--------------------------------------------------------------------------
      | Pending
      |--------------------------------------------------------------------------
      */

      .addCase(getMyTeams.pending, pendingReducer)
      .addCase(getAllTeams.pending, pendingReducer)
      .addCase(getTeamById.pending, pendingReducer)
      .addCase(createTeam.pending, pendingReducer)
      .addCase(updateTeam.pending, pendingReducer)
      .addCase(deleteTeam.pending, pendingReducer)
      .addCase(leaveTeam.pending, pendingReducer)
      .addCase(addPlayerToTeam.pending, pendingReducer)
      .addCase(removePlayerFromTeam.pending, pendingReducer)
      .addCase(setCaptain.pending, pendingReducer)
      .addCase(revokeViceCaptain.pending, pendingReducer)
      .addCase(updateViceCaptainRights.pending, pendingReducer)
      .addCase(updateTeamStats.pending, pendingReducer)
      .addCase(createLocalPlayer.pending, pendingReducer)

      /*
      |--------------------------------------------------------------------------
      | Rejected
      |--------------------------------------------------------------------------
      */

      .addCase(getMyTeams.rejected, rejectedReducer)
      .addCase(getAllTeams.rejected, rejectedReducer)
      .addCase(getTeamById.rejected, rejectedReducer)
      .addCase(createTeam.rejected, rejectedReducer)
      .addCase(updateTeam.rejected, rejectedReducer)
      .addCase(deleteTeam.rejected, rejectedReducer)
      .addCase(leaveTeam.rejected, rejectedReducer)
      .addCase(addPlayerToTeam.rejected, rejectedReducer)
      .addCase(removePlayerFromTeam.rejected, rejectedReducer)
      .addCase(setCaptain.rejected, rejectedReducer)
      .addCase(revokeViceCaptain.rejected, rejectedReducer)
      .addCase(updateViceCaptainRights.rejected, rejectedReducer)
      .addCase(updateTeamStats.rejected, rejectedReducer)
      .addCase(createLocalPlayer.rejected, rejectedReducer)

      /*
      |--------------------------------------------------------------------------
      | Fulfilled
      |--------------------------------------------------------------------------
      */

      .addCase(getMyTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.myTeams = action.payload || [];

        /*
    |--------------------------------------------------------------------------
    | Keep current team in sync
    |--------------------------------------------------------------------------
    */

        if (state.currentTeam) {
          const updatedTeam = state.myTeams.find(
            (team) => team._id === state.currentTeam._id,
          );

          if (updatedTeam) {
            state.currentTeam = updatedTeam;
          }
        }
      })

      .addCase(getAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.allTeams = action.payload || [];
      })

      .addCase(getTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const team = action.payload;

        if (!team) return;

        syncTeam(state, team);
      })

      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.myTeams = state.myTeams.filter(
          (team) => team._id !== action.payload,
        );

        state.allTeams = state.allTeams.filter(
          (team) => team._id !== action.payload,
        );

        if (state.currentTeam?._id === action.payload) {
          state.currentTeam = null;
        }
      })

      .addCase(leaveTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.myTeams = state.myTeams.filter(
          (team) => team._id !== action.payload,
        );

        if (state.currentTeam?._id === action.payload) {
          state.currentTeam = null;
        }
      })

      .addCase(addPlayerToTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(removePlayerFromTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(setCaptain.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(revokeViceCaptain.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(updateViceCaptainRights.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(updateTeamStats.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      })

      .addCase(createLocalPlayer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (!action.payload) return;

        syncTeam(state, action.payload);
      });
  },
});

/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

export const {
  clearTeamError,
  clearTeamSuccess,
  resetCurrentTeam,
  resetTeamState,
} = teamSlice.actions;

/*
|--------------------------------------------------------------------------
| Reducer
|--------------------------------------------------------------------------
*/

export default teamSlice.reducer;
