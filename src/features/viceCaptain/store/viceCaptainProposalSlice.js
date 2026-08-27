import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  proposeViceCaptainApi,
  getMyProposalsApi,
  getTeamProposalApi,
  acceptProposalApi,
  rejectProposalApi,
  cancelProposalApi,
} from "../services/viceCaptainProposal.service";

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  myProposals: [],
  teamProposal: null, // the pending proposal captain/owner sent for the currently open team, if any
  loading: false,
  success: false,
  error: null,
};

/*
|--------------------------------------------------------------------------
| Propose Vice-Captain
|--------------------------------------------------------------------------
*/

export const proposeViceCaptain = createAsyncThunk(
  "viceCaptainProposal/propose",
  async ({ teamId, playerId }, thunkAPI) => {
    try {
      return await proposeViceCaptainApi(teamId, playerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| My Proposals
|--------------------------------------------------------------------------
*/

export const getMyProposals = createAsyncThunk(
  "viceCaptainProposal/getMy",
  async (_, thunkAPI) => {
    try {
      return await getMyProposalsApi();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Get Team's Pending Proposal
|--------------------------------------------------------------------------
*/

export const getTeamProposal = createAsyncThunk(
  "viceCaptainProposal/getForTeam",
  async (teamId, thunkAPI) => {
    try {
      return await getTeamProposalApi(teamId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Accept Proposal
|--------------------------------------------------------------------------
*/

export const acceptProposal = createAsyncThunk(
  "viceCaptainProposal/accept",
  async (proposalId, thunkAPI) => {
    try {
      return await acceptProposalApi(proposalId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Reject Proposal
|--------------------------------------------------------------------------
*/

export const rejectProposal = createAsyncThunk(
  "viceCaptainProposal/reject",
  async (proposalId, thunkAPI) => {
    try {
      return await rejectProposalApi(proposalId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Cancel Proposal
|--------------------------------------------------------------------------
*/

export const cancelProposal = createAsyncThunk(
  "viceCaptainProposal/cancel",
  async (proposalId, thunkAPI) => {
    try {
      await cancelProposalApi(proposalId);
      return proposalId;
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

const viceCaptainProposalSlice = createSlice({
  name: "viceCaptainProposal",

  initialState,

  reducers: {
    clearProposalError(state) {
      state.error = null;
    },

    clearProposalSuccess(state) {
      state.success = false;
    },

    resetTeamProposal(state) {
      state.teamProposal = null;
    },

    resetProposalState(state) {
      state.myProposals = [];
      state.teamProposal = null;
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
      .addCase(proposeViceCaptain.pending, pendingReducer)
      .addCase(getMyProposals.pending, pendingReducer)
      .addCase(getTeamProposal.pending, pendingReducer)
      .addCase(acceptProposal.pending, pendingReducer)
      .addCase(rejectProposal.pending, pendingReducer)
      .addCase(cancelProposal.pending, pendingReducer)

      .addCase(proposeViceCaptain.rejected, rejectedReducer)
      .addCase(getMyProposals.rejected, rejectedReducer)
      .addCase(getTeamProposal.rejected, rejectedReducer)
      .addCase(acceptProposal.rejected, rejectedReducer)
      .addCase(rejectProposal.rejected, rejectedReducer)
      .addCase(cancelProposal.rejected, rejectedReducer)

      .addCase(proposeViceCaptain.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.teamProposal = action.payload;
      })

      .addCase(getMyProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.myProposals = action.payload || [];
      })

      .addCase(getTeamProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.teamProposal = action.payload || null;
      })

      .addCase(acceptProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.myProposals = state.myProposals.filter(
          (proposal) => proposal._id !== action.payload?._id,
        );
      })

      .addCase(rejectProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.myProposals = state.myProposals.filter(
          (proposal) => proposal._id !== action.payload?._id,
        );
      })

      .addCase(cancelProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        if (state.teamProposal?._id === action.payload) {
          state.teamProposal = null;
        }
      });
  },
});

export const {
  clearProposalError,
  clearProposalSuccess,
  resetTeamProposal,
  resetProposalState,
} = viceCaptainProposalSlice.actions;

export default viceCaptainProposalSlice.reducer;
