import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {
  getDashboardApi,
} from '../services/home.services';

export const getDashboard =
  createAsyncThunk(
    'home/getDashboard',
    async (_, thunkAPI) => {
      try {
        const response =
          await getDashboardApi();

        return response.data;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          error?.response?.data,
        );
      }
    },
  );

const initialState = {
  dashboard: null,
  loading: false,
  error: null,
};

const homeSlice = createSlice({
  name: 'home',

  initialState,

  reducers: {},

  extraReducers: builder => {
    builder

      .addCase(
        getDashboard.pending,
        state => {
          state.loading = true;
        },
      )

      .addCase(
        getDashboard.fulfilled,
        (
          state,
          action,
        ) => {
          state.loading =
            false;

          state.dashboard =
            action.payload;
        },
      )

      .addCase(
        getDashboard.rejected,
        (
          state,
          action,
        ) => {
          state.loading =
            false;

          state.error =
            action.payload;
        },
      );
  },
});

export default homeSlice.reducer;