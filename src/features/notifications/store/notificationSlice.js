import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
  acceptInvitationApi,
  rejectInvitationApi,
  acceptViceCaptainProposalApi,
  rejectViceCaptainProposalApi,
  acceptChallengeNotifApi,
  rejectChallengeNotifApi,
  confirmMatchNotifApi,
  rejectMatchConfirmationNotifApi,
} from "../services/notification.service";

/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  actionLoading: {}, // { [notificationId]: true } — per-item loading
  success: false,
  error: null,
  filter: "ALL",
};

/*
|--------------------------------------------------------------------------
| Fetch Notifications
|--------------------------------------------------------------------------
*/
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await getNotificationsApi();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load notifications.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Mark As Read
|--------------------------------------------------------------------------
*/
export const markNotificationAsRead = createAsyncThunk(
  "notifications/read",
  async (notificationId, { rejectWithValue }) => {
    try {
      return await markNotificationAsReadApi(notificationId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark notification.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Mark All As Read
|--------------------------------------------------------------------------
*/
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/readAll",
  async (_, { rejectWithValue }) => {
    try {
      return await markAllNotificationsAsReadApi();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update notifications.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (notificationId, { rejectWithValue }) => {
    try {
      await deleteNotificationApi(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete notification.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Team Invitation Actions
|--------------------------------------------------------------------------
*/
export const acceptInvitation = createAsyncThunk(
  "notifications/acceptInvitation",
  async (invitationId, { rejectWithValue }) => {
    try {
      return await acceptInvitationApi(invitationId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to accept invitation.");
    }
  },
);

export const rejectInvitation = createAsyncThunk(
  "notifications/rejectInvitation",
  async (invitationId, { rejectWithValue }) => {
    try {
      return await rejectInvitationApi(invitationId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to reject invitation.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Vice-Captain Proposal Actions  (Batch 6)
|--------------------------------------------------------------------------
*/
export const acceptViceCaptainProposal = createAsyncThunk(
  "notifications/acceptViceCaptain",
  async (proposalId, { rejectWithValue }) => {
    try {
      return await acceptViceCaptainProposalApi(proposalId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to accept proposal.");
    }
  },
);

export const rejectViceCaptainProposal = createAsyncThunk(
  "notifications/rejectViceCaptain",
  async (proposalId, { rejectWithValue }) => {
    try {
      return await rejectViceCaptainProposalApi(proposalId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to reject proposal.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Match Challenge Actions  (Batch 6)
|--------------------------------------------------------------------------
*/
export const acceptChallenge = createAsyncThunk(
  "notifications/acceptChallenge",
  async (challengeId, { rejectWithValue }) => {
    try {
      return await acceptChallengeNotifApi(challengeId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to accept challenge.");
    }
  },
);

export const rejectChallenge = createAsyncThunk(
  "notifications/rejectChallenge",
  async ({ challengeId, reason }, { rejectWithValue }) => {
    try {
      return await rejectChallengeNotifApi(challengeId, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to reject challenge.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Match Confirmation Actions  (Batch 6)
|--------------------------------------------------------------------------
*/
export const confirmMatchConfirmation = createAsyncThunk(
  "notifications/confirmMatch",
  async (matchId, { rejectWithValue }) => {
    try {
      return await confirmMatchNotifApi(matchId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to confirm match.");
    }
  },
);

export const rejectMatchConfirmation = createAsyncThunk(
  "notifications/rejectMatchConfirmation",
  async (matchId, { rejectWithValue }) => {
    try {
      return await rejectMatchConfirmationNotifApi(matchId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unable to decline match.");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/** Update the status field on all notifications carrying a given entityId key */
const updateStatusByEntityId = (notifications, idKey, idValue, newStatus) =>
  notifications.map((n) =>
    n.data?.[idKey] === idValue ? { ...n, status: newStatus, isRead: true } : n,
  );

const recomputeUnread = (notifications) =>
  notifications.filter((n) => !n.isRead).length;

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/
const notificationSlice = createSlice({
  name: "notifications",
  initialState,

  reducers: {
    setNotificationFilter(state, action) {
      state.filter = action.payload;
    },
    clearNotificationError(state) {
      state.error = null;
    },
    clearNotificationSuccess(state) {
      state.success = false;
    },
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
    resetNotificationState(state) {
      Object.assign(state, initialState);
    },
  },

  extraReducers: (builder) => {
    // ── Generic pending/rejected helpers ──────────────────────────────────

    const markLoading = (state) => {
      state.loading = true;
      state.error = null;
    };

    const markError = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    // ── Fetch ─────────────────────────────────────────────────────────────

    builder
      .addCase(fetchNotifications.pending, markLoading)
      .addCase(fetchNotifications.rejected, markError)
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.notifications = action.payload || [];
        state.unreadCount = recomputeUnread(state.notifications);
      })

      // ── Mark Read ─────────────────────────────────────────────────────

      .addCase(markNotificationAsRead.pending, markLoading)
      .addCase(markNotificationAsRead.rejected, markError)
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) state.notifications[idx] = action.payload;
        state.unreadCount = recomputeUnread(state.notifications);
      })

      // ── Mark All Read ─────────────────────────────────────────────────

      .addCase(markAllNotificationsAsRead.pending, markLoading)
      .addCase(markAllNotificationsAsRead.rejected, markError)
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })

      // ── Delete ────────────────────────────────────────────────────────

      .addCase(deleteNotification.pending, markLoading)
      .addCase(deleteNotification.rejected, markError)
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.filter((n) => n._id !== action.payload);
        state.unreadCount = recomputeUnread(state.notifications);
      })

      // ── Team Invitation ───────────────────────────────────────────────

      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "invitationId", action.meta.arg, "ACCEPTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(rejectInvitation.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "invitationId", action.meta.arg, "REJECTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(acceptInvitation.rejected, markError)
      .addCase(rejectInvitation.rejected, markError)

      // ── Vice Captain (Batch 6) ────────────────────────────────────────

      .addCase(acceptViceCaptainProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "proposalId", action.meta.arg, "ACCEPTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(rejectViceCaptainProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "proposalId", action.meta.arg, "REJECTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(acceptViceCaptainProposal.rejected, markError)
      .addCase(rejectViceCaptainProposal.rejected, markError)

      // ── Match Challenge (Batch 6) ─────────────────────────────────────

      .addCase(acceptChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "challengeId", action.meta.arg, "ACCEPTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(rejectChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "challengeId", action.meta.arg?.challengeId, "REJECTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(acceptChallenge.rejected, markError)
      .addCase(rejectChallenge.rejected, markError)

      // ── Match Confirmation (Batch 6) ──────────────────────────────────

      .addCase(confirmMatchConfirmation.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "matchId", action.meta.arg, "ACCEPTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(rejectMatchConfirmation.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = updateStatusByEntityId(
          state.notifications, "matchId", action.meta.arg, "REJECTED",
        );
        state.unreadCount = recomputeUnread(state.notifications);
      })
      .addCase(confirmMatchConfirmation.rejected, markError)
      .addCase(rejectMatchConfirmation.rejected, markError);
  },
});

export const {
  setNotificationFilter,
  clearNotificationError,
  clearNotificationSuccess,
  clearNotifications,
  resetNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;