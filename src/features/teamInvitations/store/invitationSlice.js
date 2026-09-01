import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  sendInvitationApi,
  getMyInvitationsApi,
  acceptInvitationApi,
  rejectInvitationApi,
  cancelInvitationApi,
} from "../services/invitation.service";
import { syncInvitation } from "../helper/syncInvitation";

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  invitations: [],

  currentInvitation: null,

  loading: false,

  success: false,

  error: null,
};

/*
|--------------------------------------------------------------------------
| Send Invitation
|--------------------------------------------------------------------------
*/

export const sendInvitation = createAsyncThunk(
  "invitation/sendInvitation",
  async (payload, { rejectWithValue }) => {
    try {
      console.log("==================================");
      console.log("INVITATION THUNK START");
      console.log("Payload =>", payload);

      const response = await sendInvitationApi(payload);

      console.log("INVITATION API SUCCESS");
      console.log(response);
      console.log("==================================");

      return response;
    } catch (error) {
      console.log("==================================");
      console.log("INVITATION API FAILED");
      console.log("Status =>", error?.response?.status);
      console.log("Response =>", error?.response?.data);
      console.log("Message =>", error?.message);
      console.log("==================================");

      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to send invitation."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get My Invitations
|--------------------------------------------------------------------------
*/

export const getMyInvitations =
  createAsyncThunk(
    "invitation/getMyInvitations",
    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        return await getMyInvitationsApi();
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to load invitations."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| Accept Invitation
|--------------------------------------------------------------------------
*/

export const acceptInvitation =
  createAsyncThunk(
    "invitation/acceptInvitation",
    async (
      invitationId,
      { rejectWithValue }
    ) => {
      try {
        return await acceptInvitationApi(
          invitationId
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to accept invitation."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| Reject Invitation
|--------------------------------------------------------------------------
*/

export const rejectInvitation =
  createAsyncThunk(
    "invitation/rejectInvitation",
    async (
      invitationId,
      { rejectWithValue }
    ) => {
      try {
        return await rejectInvitationApi(
          invitationId
        );
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to reject invitation."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| Cancel Invitation
|--------------------------------------------------------------------------
*/

export const cancelInvitation =
  createAsyncThunk(
    "invitation/cancelInvitation",
    async (
      invitationId,
      { rejectWithValue }
    ) => {
      try {
        await cancelInvitationApi(
          invitationId
        );

        return invitationId;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message ||
            "Failed to cancel invitation."
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| Invitation Slice
|--------------------------------------------------------------------------
*/

const invitationSlice = createSlice({
  name: "invitation",

  initialState,

  reducers: {
    /*
    |--------------------------------------------------------------------------
    | Clear Error
    |--------------------------------------------------------------------------
    */

    clearInvitationError(state) {
      state.error = null;
    },

    /*
    |--------------------------------------------------------------------------
    | Clear Success
    |--------------------------------------------------------------------------
    */

    clearInvitationSuccess(state) {
      state.success = false;
    },

    /*
    |--------------------------------------------------------------------------
    | Reset Current Invitation
    |--------------------------------------------------------------------------
    */

    resetCurrentInvitation(state) {
      state.currentInvitation = null;
    },

    /*
    |--------------------------------------------------------------------------
    | Reset Invitation State
    |--------------------------------------------------------------------------
    */

    resetInvitationState(state) {
      state.invitations = [];

      state.currentInvitation = null;

      state.loading = false;

      state.success = false;

      state.error = null;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | Pending Reducer
    |--------------------------------------------------------------------------
    */

    const pendingReducer = (state) => {
      state.loading = true;

      state.success = false;

      state.error = null;
    };

    /*
    |--------------------------------------------------------------------------
    | Rejected Reducer
    |--------------------------------------------------------------------------
    */

    const rejectedReducer = (
      state,
      action
    ) => {
      state.loading = false;

      state.success = false;

      state.error = action.payload;
    };

    builder

      /*
      |--------------------------------------------------------------------------
      | Pending
      |--------------------------------------------------------------------------
      */

      .addCase(
        sendInvitation.pending,
        pendingReducer
      )

      .addCase(
        getMyInvitations.pending,
        pendingReducer
      )

      .addCase(
        acceptInvitation.pending,
        pendingReducer
      )

      .addCase(
        rejectInvitation.pending,
        pendingReducer
      )

      .addCase(
        cancelInvitation.pending,
        pendingReducer
      )

      /*
      |--------------------------------------------------------------------------
      | Rejected
      |--------------------------------------------------------------------------
      */

      .addCase(
        sendInvitation.rejected,
        rejectedReducer
      )

      .addCase(
        getMyInvitations.rejected,
        rejectedReducer
      )

      .addCase(
        acceptInvitation.rejected,
        rejectedReducer
      )

      .addCase(
        rejectInvitation.rejected,
        rejectedReducer
      )

      .addCase(
        cancelInvitation.rejected,
        rejectedReducer
      )

      /*
      |--------------------------------------------------------------------------
      | Fulfilled
      |--------------------------------------------------------------------------
      */

      .addCase(
        getMyInvitations.fulfilled,
        (state, action) => {
          state.loading = false;

          state.success = true;

          state.invitations =
            action.payload || [];
        }
      )

      .addCase(
        sendInvitation.fulfilled,
        (state, action) => {
          state.loading = false;

          state.success = true;

          state.currentInvitation =
            action.payload;

          state.invitations.unshift(
            action.payload
          );
        }
      )

      .addCase(
        acceptInvitation.fulfilled,
        (state, action) => {
          state.loading = false;

          state.success = true;

          if (!action.payload) return;

          syncInvitation(
            state,
            action.payload
          );
        }
      )

      .addCase(
        rejectInvitation.fulfilled,
        (state, action) => {
          state.loading = false;

          state.success = true;

          if (!action.payload) return;

          syncInvitation(
            state,
            action.payload
          );
        }
      )

            .addCase(
        cancelInvitation.fulfilled,
        (state, action) => {
          state.loading = false;

          state.success = true;

          state.invitations =
            state.invitations.filter(
              (invitation) =>
                invitation._id !==
                action.payload
            );

          if (
            state.currentInvitation?._id ===
            action.payload
          ) {
            state.currentInvitation = null;
          }
        }
      );
  },
});

/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

export const {
  clearInvitationError,

  clearInvitationSuccess,

  resetCurrentInvitation,

  resetInvitationState,
} = invitationSlice.actions;

/*
|--------------------------------------------------------------------------
| Reducer
|--------------------------------------------------------------------------
*/

export default invitationSlice.reducer;