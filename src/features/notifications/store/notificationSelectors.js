import { createSelector } from "@reduxjs/toolkit";

/*
|--------------------------------------------------------------------------
| Base Selector
|--------------------------------------------------------------------------
*/

const notificationState = (state) => state.notifications;

/*
|--------------------------------------------------------------------------
| All Notifications
|--------------------------------------------------------------------------
*/

export const selectNotifications = createSelector(
  [notificationState],
  (notification) => notification.notifications
);

/*
|--------------------------------------------------------------------------
| Loading
|--------------------------------------------------------------------------
*/

export const selectNotificationLoading = createSelector(
  [notificationState],
  (notification) => notification.loading
);

/*
|--------------------------------------------------------------------------
| Error
|--------------------------------------------------------------------------
*/

export const selectNotificationError = createSelector(
  [notificationState],
  (notification) => notification.error
);

/*
|--------------------------------------------------------------------------
| Success
|--------------------------------------------------------------------------
*/

export const selectNotificationSuccess = createSelector(
  [notificationState],
  (notification) => notification.success
);

/*
|--------------------------------------------------------------------------
| Selected Filter
|--------------------------------------------------------------------------
*/

export const selectNotificationFilter = createSelector(
  [notificationState],
  (notification) => notification.filter
);

/*
|--------------------------------------------------------------------------
| Unread Count
|--------------------------------------------------------------------------
*/

export const selectUnreadCount = createSelector(
  [notificationState],
  (notification) => notification.unreadCount
);

/*
|--------------------------------------------------------------------------
| Unread Notifications
|--------------------------------------------------------------------------
*/

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) =>
    notifications.filter(
      (item) => !item.isRead
    )
);

/*
|--------------------------------------------------------------------------
| Invitation Notifications
|--------------------------------------------------------------------------
*/

export const selectInvitationNotifications =
  createSelector(
    [selectNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.category === "INVITATION"
      )
  );

/*
|--------------------------------------------------------------------------
| Team Notifications
|--------------------------------------------------------------------------
*/

export const selectTeamNotifications =
  createSelector(
    [selectNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.category === "TEAM"
      )
  );

/*
|--------------------------------------------------------------------------
| Match Notifications
|--------------------------------------------------------------------------
*/

export const selectMatchNotifications =
  createSelector(
    [selectNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.category === "MATCH"
      )
  );

/*
|--------------------------------------------------------------------------
| Ground Notifications
|--------------------------------------------------------------------------
*/

export const selectGroundNotifications =
  createSelector(
    [selectNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.category === "GROUND"
      )
  );

/*
|--------------------------------------------------------------------------
| Tournament Notifications
|--------------------------------------------------------------------------
*/

export const selectTournamentNotifications =
  createSelector(
    [selectNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.category === "TOURNAMENT"
      )
  );

/*
|--------------------------------------------------------------------------
| System Notifications
|--------------------------------------------------------------------------
*/

export const selectSystemNotifications =
  createSelector(
    [selectNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.category === "SYSTEM"
      )
  );

/*
|--------------------------------------------------------------------------
| Pending Invitations
|--------------------------------------------------------------------------
*/

export const selectPendingInvitations =
  createSelector(
    [selectInvitationNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.status === "PENDING"
      )
  );

/*
|--------------------------------------------------------------------------
| Accepted Invitations
|--------------------------------------------------------------------------
*/

export const selectAcceptedInvitations =
  createSelector(
    [selectInvitationNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.status === "ACCEPTED"
      )
  );

/*
|--------------------------------------------------------------------------
| Rejected Invitations
|--------------------------------------------------------------------------
*/

export const selectRejectedInvitations =
  createSelector(
    [selectInvitationNotifications],
    (notifications) =>
      notifications.filter(
        (item) =>
          item.status === "REJECTED"
      )
  );