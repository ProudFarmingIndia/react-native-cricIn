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

/*
|--------------------------------------------------------------------------
| Argument Shape
|--------------------------------------------------------------------------
|
| These thunks used to take a bare phone string. They now need a country
| alongside it, and rather than break every existing caller they accept
| BOTH shapes:
|
|     sendOtp("9876543210")
|     sendOtp({ phone: "9876543210", countryCode: "IN" })
|
| This matters more than it looks. `sendOtp.fulfilled` reducer read
| `action.meta.arg` directly to set state.phone - so switching the argument
| to an object without this would have quietly stored "[object Object]" as
| the user's phone number, and every screen reading state.auth.phone would
| have shown it.
|
*/

const normaliseArgs = (input, fallbackOtp) => {
  if (input && typeof input === "object") {
    return {
      phone: String(input.phone ?? input.mobile ?? ""),
      countryCode: input.countryCode || "IN",
      otp: input.otp ?? fallbackOtp,
    };
  }

  return {
    phone: String(input ?? ""),
    countryCode: "IN",
    otp: fallbackOtp,
  };
};

// ─── Send OTP ─────────────────────────────────────────────────────────────────
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (input, thunkAPI) => {
    const { phone, countryCode } = normaliseArgs(input);

    try {
      const response = await sendOtpApi(phone, countryCode);

      return response.data;
    } catch (error) {
      /*
      | The server's own message is what reaches the screen - "Please check
      | the number", "Too many OTP requests, try again in 12 minutes". The
      | generic fallback is only for a network drop, which has no body.
      */

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (input, thunkAPI) => {
    const { phone, countryCode, otp } = normaliseArgs(input);

    try {
      const response = await verifyOtpApi(phone, otp, countryCode);

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
        error.response?.data || { message: error.message },
      );
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  loading: false,
  token: null,
  user: null,
  error: null,
  phone: null,
  countryCode: "IN",
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

        /*
        | Normalised, not action.meta.arg. The argument can now be an
        | object, and storing it raw would put "[object Object]" into
        | state.auth.phone.
        */

        const { phone, countryCode } = normaliseArgs(action.meta.arg);

        state.phone = phone;
        state.countryCode = countryCode;
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
