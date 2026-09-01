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
  getUnreadCountApi,
  markManyAsReadApi,
  deleteManyApi,
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

  // Show only unread, combinable with `filter`.
  unreadOnly: false,

  // Multi-select mode for bulk mark-read / delete.
  selecting: false,
  selectedIds: [],
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
| Unread Count
|--------------------------------------------------------------------------
|
| The badge in the header needs the count WITHOUT pulling the full list -
| every screen shows the bell, and refetching every notification on each
| screen focus to derive a number would be wasteful.
|
| getUnreadCountApi existed but had no thunk, so nothing ever called it.
|
*/
export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUnreadCountApi();
      return data?.unreadCount ?? 0;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load unread count.",
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Bulk Actions
|--------------------------------------------------------------------------
*/
export const markManyAsRead = createAsyncThunk(
  "notifications/readMany",
  async (ids, { rejectWithValue }) => {
    try {
      await markManyAsReadApi(ids);
      return ids;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update notifications.",
      );
    }
  },
);

export const deleteManyNotifications = createAsyncThunk(
  "notifications/deleteMany",
  async (ids, { rejectWithValue }) => {
    try {
      await deleteManyApi(ids);
      return ids;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notifications.",
      );
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

    /*
    | A notification arrived over the socket. The server emits the whole
    | document, so it can be inserted directly - refetching the entire
    | list to learn about one new row would be wasteful and would also
    | wipe any in-flight selection.
    |
    | Guarded against duplicates: a push and a socket event can both land
    | for the same notification.
    */
    notificationReceived(state, action) {
      const incoming = action.payload;

      if (!incoming?._id) return;

      const exists = state.notifications.some(
        (notification) => notification._id === incoming._id,
      );

      if (exists) return;

      state.notifications.unshift(incoming);

      if (!incoming.isRead) {
        state.unreadCount += 1;
      }
    },

    /*
    | Show-unread-only toggle, independent of the category filter so the
    | two can be combined ("unread Invitations").
    */
    setUnreadOnly(state, action) {
      state.unreadOnly = !!action.payload;
    },

    /*
    | Multi-select. Kept in the store rather than screen state so the
    | selection survives a refetch triggered by an accept/reject.
    */
    toggleSelected(state, action) {
      const id = action.payload;

      state.selectedIds = state.selectedIds.includes(id)
        ? state.selectedIds.filter((selected) => selected !== id)
        : [...state.selectedIds, id];
    },

    selectAll(state, action) {
      state.selectedIds = action.payload || [];
    },

    clearSelection(state) {
      state.selectedIds = [];
      state.selecting = false;
    },

    setSelecting(state, action) {
      state.selecting = !!action.payload;

      if (!action.payload) {
        state.selectedIds = [];
      }
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

        // Drop selections whose rows no longer exist after a refetch.
        const ids = new Set(state.notifications.map((n) => n._id));
        state.selectedIds = state.selectedIds.filter((id) => ids.has(id));
      })

      /*
      | Unread count comes straight from the server and is NOT recomputed
      | from `notifications` - the header needs it on screens that have
      | never loaded the list.
      */
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload ?? 0;
      })

      // ── Bulk ──────────────────────────────────────────────────────────

      .addCase(markManyAsRead.pending, markLoading)
      .addCase(markManyAsRead.rejected, markError)
      .addCase(markManyAsRead.fulfilled, (state, action) => {
        state.loading = false;

        const ids = new Set(action.payload || []);

        state.notifications.forEach((notification) => {
          if (ids.has(notification._id)) notification.isRead = true;
        });

        state.unreadCount = recomputeUnread(state.notifications);
        state.selectedIds = [];
        state.selecting = false;
      })

      .addCase(deleteManyNotifications.pending, markLoading)
      .addCase(deleteManyNotifications.rejected, markError)
      .addCase(deleteManyNotifications.fulfilled, (state, action) => {
        state.loading = false;

        const ids = new Set(action.payload || []);

        state.notifications = state.notifications.filter(
          (notification) => !ids.has(notification._id),
        );

        state.unreadCount = recomputeUnread(state.notifications);
        state.selectedIds = [];
        state.selecting = false;
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
  notificationReceived,
  setUnreadOnly,
  toggleSelected,
  selectAll,
  clearSelection,
  setSelecting,
  setNotificationFilter,
  clearNotificationError,
  clearNotificationSuccess,
  clearNotifications,
  resetNotificationState,
} = notificationSlice.actions;

export default notificationSlice.reducer;