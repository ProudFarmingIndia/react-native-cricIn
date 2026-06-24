// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// import { getProfileApi, updateProfileApi } from "../services/profile.services";

// export const getProfile = createAsyncThunk(
//   "profile/getProfile",
//   async (_, thunkAPI) => {
//     try {
//       const response = await getProfileApi();

//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data);
//     }
//   },
// );

// export const updateProfile = createAsyncThunk(
//   "profile/updateProfile",
//   async (payload, thunkAPI) => {
//     try {
//       const response = await updateProfileApi(payload);

//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data);
//     }
//   },
// );

// const profileSlice = createSlice({
//   name: "profile",

//   initialState: {
//     loading: false,
//     profile: null,
//     error: null,
//   },

//   reducers: {},

//   extraReducers: (builder) => {
//     builder

//       .addCase(getProfile.pending, (state) => {
//         state.loading = true;
//       })

//       .addCase(getProfile.fulfilled, (state, action) => {
//         state.loading = false;

//         state.profile = action.payload.data;
//       })

//       .addCase(updateProfile.fulfilled, (state, action) => {
//         state.profile = action.payload.data;
//       });
//   },
// });

// export default profileSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getProfileApi,
  updateProfileApi,
  createPlayerProfileApi,
} from "../services/profile.services";

// ─── GET /api/players/me ─────────────────────────────────────────────────────
export const getProfile = createAsyncThunk(
  "profile/getProfile",
  async (_, thunkAPI) => {
    try {
      const response = await getProfileApi();
      return response.data; // { success, data: playerObject }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── PUT /api/players/me ─────────────────────────────────────────────────────
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (payload, thunkAPI) => {
    try {
      const response = await updateProfileApi(payload);
      return response.data; // { success, data: updatedPlayerObject }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── POST /api/players ───────────────────────────────────────────────────────
// Called once when user first sets up their player profile
export const createPlayerProfile = createAsyncThunk(
  "profile/createPlayerProfile",
  async (payload, thunkAPI) => {
    try {
      const response = await createPlayerProfileApi(payload);
      return response.data; // { success, data: newPlayerObject }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const profileSlice = createSlice({
  name: "profile",

  initialState: {
    loading: false,
    profile: null,      // Player object from DB
    error: null,
    isCreated: false,   // true once player profile exists
  },

  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    resetProfile(state) {
      state.profile = null;
      state.isCreated = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── getProfile ──────────────────────────────────────────────────────
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.isCreated = !!action.payload.data;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // null profile means not created yet — that's okay
        state.profile = null;
        state.isCreated = false;
      })

      // ── updateProfile ───────────────────────────────────────────────────
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── createPlayerProfile ─────────────────────────────────────────────
      .addCase(createPlayerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlayerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
        state.isCreated = true;
      })
      .addCase(createPlayerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, resetProfile } = profileSlice.actions;

export default profileSlice.reducer;
