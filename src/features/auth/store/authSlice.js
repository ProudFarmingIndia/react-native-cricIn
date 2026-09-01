import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOtpApi, verifyOtpApi } from "../services/auth.services";

/*
|--------------------------------------------------------------------------
| Persisted Session Keys
|--------------------------------------------------------------------------
|
| The token alone is not enough. state.auth.user carries the User _id that
| every ownership check compares against - team.userId, match.userId - and
| it was only ever set by verifyOtp.fulfilled. After a reload it was null,
| so isOwner evaluated false for the actual owner: Team Settings showed
| "Leave Team" instead of "Delete Team", and the owner lost owner-only
| controls until they logged in again.
|
*/

export const TOKEN_KEY = "accessToken";

export const USER_KEY = "authUser";

// ─── Send OTP ─────────────────────────────────────────────────────────────────
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (mobile, thunkAPI) => {
    try {
      const response = await sendOtpApi(mobile);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ mobile, otp }, thunkAPI) => {
    try {
      const response = await verifyOtpApi(mobile, otp);

      const token = response.data?.data?.token;

      const user = response.data?.data?.user;

      // Persisted so the interceptor and the ownership checks both survive
      // a relaunch.
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }

      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  loading: false,
  token: null,
  user: null,
  error: null,
  phone: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /*
    | Called by AppNavigator on launch. Accepts either a bare token string
    | (the old shape, kept so nothing breaks) or { token, user }.
    */
    restoreToken(state, action) {
      const payload = action.payload;

      if (payload && typeof payload === "object") {
        state.token = payload.token ?? null;
        state.user = payload.user ?? null;
        return;
      }

      state.token = payload;
    },

    logout(state) {
      state.token = null;
      state.user = null;
      state.phone = null;

      AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ── sendOtp ──────────────────────────────────────────────────────────
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.phone = action.meta.arg;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── verifyOtp ────────────────────────────────────────────────────────
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.data?.token;
        state.user = action.payload?.data?.user ?? null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { restoreToken, logout, clearError } = authSlice.actions;

export default authSlice.reducer;