import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';

import {
  getPlayersApi,
} from '../services/players.services';

export const getPlayers =
  createAsyncThunk(
    'players/getPlayers',
    async (_, thunkAPI) => {
      try {

        const response =
          await getPlayersApi();

        return response.data;

      } catch (error) {

        return thunkAPI.rejectWithValue(
          error?.response?.data ||
          error.message
        );

      }
    }
  );

const initialState = {
  players: [],
  selectedPlayer: null,
  loading: false,
  error: null,
};

const playersSlice =
  createSlice({
    name: 'players',

    initialState,

    reducers: {

      clearPlayersError:
        state => {
          state.error = null;
        },

      setSelectedPlayer:
        (state, action) => {
          state.selectedPlayer =
            action.payload;
        },

      clearSelectedPlayer:
        state => {
          state.selectedPlayer =
            null;
        },

    },

    extraReducers:
      builder => {

        builder

          .addCase(
            getPlayers.pending,
            state => {

              state.loading =
                true;

              state.error =
                null;

            }
          )

          .addCase(
            getPlayers.fulfilled,
            (
              state,
              action
            ) => {

              state.loading =
                false;

              state.players =
                action.payload?.data ||
                [];

            }
          )

          .addCase(
            getPlayers.rejected,
            (
              state,
              action
            ) => {

              state.loading =
                false;

              state.error =
                action.payload;

            }
          );

      },
  });

export const {
  clearPlayersError,
  setSelectedPlayer,
  clearSelectedPlayer,
} =
  playersSlice.actions;

export default
  playersSlice.reducer;