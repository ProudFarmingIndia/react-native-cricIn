import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOtpApi, verifyOtpApi } from "../services/auth.services";

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

      // Save to AsyncStorage so interceptor picks it up on next launch
      if (token) {
        await AsyncStorage.setItem("accessToken", token);
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
    // Called by AppNavigator on launch to restore persisted token
    restoreToken(state, action) {
      state.token = action.payload;
    },

    logout(state) {
      state.token = null;
      state.user = null;
      state.phone = null;
      AsyncStorage.removeItem("accessToken");
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
        state.user = action.payload?.data?.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { restoreToken, logout, clearError } = authSlice.actions;

export default authSlice.reducer;