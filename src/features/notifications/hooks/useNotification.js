import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  acceptInvitation,
  rejectInvitation,
  setNotificationFilter,
  fetchUnreadCount,
  markManyAsRead,
  deleteManyNotifications,
  setUnreadOnly,
  toggleSelected,
  selectAll,
  clearSelection,
  setSelecting,
  clearNotificationError,
  clearNotificationSuccess,
  clearNotifications,
  resetNotificationState,
} from "../store/notificationSlice";

export default function useNotification() {
  const dispatch = useDispatch();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const {
    notifications,
    unreadCount,
    loading,
    success,
    error,
    filter,
    unreadOnly,
    selecting,
    selectedIds,
  } = useSelector((state) => state.notifications);

  /*
  |--------------------------------------------------------------------------
  | Fetch Notifications
  |--------------------------------------------------------------------------
  */

  const getNotifications = useCallback(async () => {
    const result = await dispatch(fetchNotifications());

    if (fetchNotifications.fulfilled.match(result)) {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: result.payload,
    };
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Mark As Read
  |--------------------------------------------------------------------------
  */

  const readNotification = useCallback(
    async (notificationId) => {
      const result = await dispatch(markNotificationAsRead(notificationId));

      if (markNotificationAsRead.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch],
  );

  /*
  |--------------------------------------------------------------------------
  | Mark All As Read
  |--------------------------------------------------------------------------
  */

  const readAllNotifications = useCallback(async () => {
    const result = await dispatch(markAllNotificationsAsRead());

    if (markAllNotificationsAsRead.fulfilled.match(result)) {
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: result.payload,
    };
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Delete Notification
  |--------------------------------------------------------------------------
  */

  const removeNotification = useCallback(
    async (notificationId) => {
      const result = await dispatch(deleteNotification(notificationId));

      if (deleteNotification.fulfilled.match(result)) {
        return {
          success: true,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch],
  );

  /*
  |--------------------------------------------------------------------------
  | Accept Invitation
  |--------------------------------------------------------------------------
  */

  const acceptInvitationRequest = useCallback(
    async (invitationId) => {
      const result = await dispatch(acceptInvitation(invitationId));

      if (acceptInvitation.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch],
  );

  /*
  |--------------------------------------------------------------------------
  | Reject Invitation
  |--------------------------------------------------------------------------
  */

  const rejectInvitationRequest = useCallback(
    async (invitationId) => {
      const result = await dispatch(rejectInvitation(invitationId));

      if (rejectInvitation.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch],
  );

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    notifications,

    unreadCount,

    loading,

    success,

    error,

    filter,

    unreadOnly,

    selecting,

    selectedIds,

    /*
    |--------------------------------------------------------------------------
    | APIs
    |--------------------------------------------------------------------------
    */

    getNotifications,

    /*
    | Count only - for the header badge, on screens that never load the
    | full list.
    */
    getUnreadCount: () => dispatch(fetchUnreadCount()),

    markManyAsRead: (ids) => dispatch(markManyAsRead(ids)),

    deleteMany: (ids) => dispatch(deleteManyNotifications(ids)),

    /*
    |--------------------------------------------------------------------------
    | Selection & View
    |--------------------------------------------------------------------------
    */

    setUnreadOnly: (value) => dispatch(setUnreadOnly(value)),

    toggleSelected: (id) => dispatch(toggleSelected(id)),

    selectAll: (ids) => dispatch(selectAll(ids)),

    clearSelection: () => dispatch(clearSelection()),

    setSelecting: (value) => dispatch(setSelecting(value)),

    markAsRead: readNotification,

    markAllAsRead: readAllNotifications,

    deleteNotification: removeNotification,

    acceptInvitation: acceptInvitationRequest,

    rejectInvitation: rejectInvitationRequest,

    /*
    |--------------------------------------------------------------------------
    | Local Actions
    |--------------------------------------------------------------------------
    */

    setFilter: useCallback(
      (nextFilter) => dispatch(setNotificationFilter(nextFilter)),
      [dispatch],
    ),

    clearNotificationError: useCallback(
      () => dispatch(clearNotificationError()),
      [dispatch],
    ),

    clearNotificationSuccess: useCallback(
      () => dispatch(clearNotificationSuccess()),
      [dispatch],
    ),

    clearNotifications: useCallback(
      () => dispatch(clearNotifications()),
      [dispatch],
    ),

    resetNotificationState: useCallback(
      () => dispatch(resetNotificationState()),
      [dispatch],
    ),
  };
}
