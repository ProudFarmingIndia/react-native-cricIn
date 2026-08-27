import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createInningsApi,
  getInningsByIdApi,
  endInningsApi,
  addBallApi,
  setNextBatsmanApi,
  setNextBowlerApi,
  undoLastBallApi,
  getInningsScorecardApi,
} from "../services/scoring.service";

const initialState = {
  currentInnings: null,
  balls: [],
  loading: false,
  error: null,
  success: false,
};

export const createInnings = createAsyncThunk(
  "scoring/createInnings",
  async (payload, thunkAPI) => {
    try {
      return await createInningsApi(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getInningsById = createAsyncThunk(
  "scoring/getInningsById",
  async (inningsId, thunkAPI) => {
    try {
      return await getInningsByIdApi(inningsId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const endInnings = createAsyncThunk(
  "scoring/endInnings",
  async (inningsId, thunkAPI) => {
    try {
      return await endInningsApi(inningsId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const addBall = createAsyncThunk(
  "scoring/addBall",
  async (payload, thunkAPI) => {
    try {
      return await addBallApi(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const setNextBatsman = createAsyncThunk(
  "scoring/setNextBatsman",
  async ({ inningsId, playerId }, thunkAPI) => {
    try {
      return await setNextBatsmanApi(inningsId, playerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const setNextBowler = createAsyncThunk(
  "scoring/setNextBowler",
  async ({ inningsId, playerId }, thunkAPI) => {
    try {
      return await setNextBowlerApi(inningsId, playerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const undoLastBall = createAsyncThunk(
  "scoring/undoLastBall",
  async (inningsId, thunkAPI) => {
    try {
      return await undoLastBallApi(inningsId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getInningsScorecard = createAsyncThunk(
  "scoring/getInningsScorecard",
  async (inningsId, thunkAPI) => {
    try {
      return await getInningsScorecardApi(inningsId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const scoringSlice = createSlice({
  name: "scoring",
  initialState,
  reducers: {
    clearScoringError(state) {
      state.error = null;
    },
    resetScoringState(state) {
      state.currentInnings = null;
      state.balls = [];
      state.loading = false;
      state.error = null;
      state.success = false;
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
      .addCase(createInnings.pending, pendingReducer)
      .addCase(getInningsById.pending, pendingReducer)
      .addCase(endInnings.pending, pendingReducer)
      .addCase(addBall.pending, pendingReducer)
      .addCase(setNextBatsman.pending, pendingReducer)
      .addCase(setNextBowler.pending, pendingReducer)
      .addCase(undoLastBall.pending, pendingReducer)
      .addCase(getInningsScorecard.pending, pendingReducer)

      .addCase(createInnings.rejected, rejectedReducer)
      .addCase(getInningsById.rejected, rejectedReducer)
      .addCase(endInnings.rejected, rejectedReducer)
      .addCase(addBall.rejected, rejectedReducer)
      .addCase(setNextBatsman.rejected, rejectedReducer)
      .addCase(setNextBowler.rejected, rejectedReducer)
      .addCase(undoLastBall.rejected, rejectedReducer)
      .addCase(getInningsScorecard.rejected, rejectedReducer)

      .addCase(createInnings.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentInnings = action.payload;
        state.balls = [];
      })
      .addCase(getInningsById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentInnings = action.payload;
      })
      .addCase(endInnings.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentInnings = action.payload;
      })
      .addCase(addBall.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const { ball, innings } = action.payload || {};
        if (innings) state.currentInnings = innings;
        if (ball) {
          const exists = state.balls.some((b) => b._id === ball._id);
          if (!exists) state.balls.push(ball); // chronological
        }
      })
      .addCase(setNextBatsman.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentInnings = action.payload;
      })
      .addCase(setNextBowler.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentInnings = action.payload;
      })
      .addCase(undoLastBall.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const { innings, undoneBall, ball } = action.payload || {};
        const removed = undoneBall || ball;

        if (innings) {
          state.currentInnings = innings;
        } else if (action.payload && action.payload.totalRuns !== undefined) {
          state.currentInnings = action.payload;
        }

        // Remove undone ball from local state array
        if (removed && removed._id) {
          state.balls = state.balls.filter((b) => b._id !== removed._id);
        } else {
          state.balls.shift(); // Remove top delivery
        }
      })
      .addCase(getInningsScorecard.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentInnings = action.payload?.innings || action.payload;
        state.balls = action.payload?.balls || [];
      });
  },
});

export const { clearScoringError, resetScoringState } = scoringSlice.actions;
export default scoringSlice.reducer;
