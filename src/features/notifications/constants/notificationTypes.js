/*
|--------------------------------------------------------------------------
| Notification Categories
|--------------------------------------------------------------------------
*/

export const NOTIFICATION_FILTERS = [
  {
    value: "ALL",

    label: "All",
  },

  {
    value: "INVITATION",

    label: "Invitations",
  },

  {
    value: "TEAM",

    label: "Teams",
  },

  {
    value: "MATCH",

    label: "Matches",
  },

  {
    value: "GROUND",

    label: "Grounds",
  },

  {
    value: "TOURNAMENT",

    label: "Tournament",
  },

  {
    value: "SYSTEM",

    label: "System",
  },
];

/*
|--------------------------------------------------------------------------
| Notification Types
|--------------------------------------------------------------------------
|
| IMPORTANT
| These values MUST exactly match backend/src/modules/notifications/
| notification.types.ts - that file is the single source of truth.
| A mismatch here means icons AND the accept/reject action buttons
| silently stop working, with no error anywhere.
|
*/

export const NOTIFICATION_TYPES = {
  /*
  |--------------------------------------------------------------------------
  | Team
  |--------------------------------------------------------------------------
  */
 
  TEAM_CREATED: "TEAM_CREATED",
 
  TEAM_UPDATED: "TEAM_UPDATED",
 
  TEAM_DELETED: "TEAM_DELETED",
 
  PLAYER_JOINED_TEAM: "PLAYER_JOINED_TEAM",
 
  PLAYER_LEFT_TEAM: "PLAYER_LEFT_TEAM",
 
  CAPTAIN_ASSIGNED: "CAPTAIN_ASSIGNED",
 
  VICE_CAPTAIN_PROPOSED: "VICE_CAPTAIN_PROPOSED",
 
  VICE_CAPTAIN_ASSIGNED: "VICE_CAPTAIN_ASSIGNED",
 
  VICE_CAPTAIN_REJECTED: "VICE_CAPTAIN_REJECTED",
 
  VICE_CAPTAIN_CANCELLED: "VICE_CAPTAIN_CANCELLED",
 
  /*
  |--------------------------------------------------------------------------
  | Team Invitations
  |--------------------------------------------------------------------------
  */
 
  TEAM_INVITATION_RECEIVED: "TEAM_INVITATION_RECEIVED",
 
  TEAM_INVITATION_ACCEPTED: "TEAM_INVITATION_ACCEPTED",
 
  TEAM_INVITATION_REJECTED: "TEAM_INVITATION_REJECTED",
 
  TEAM_INVITATION_CANCELLED: "TEAM_INVITATION_CANCELLED",
 
  TEAM_INVITATION_EXPIRED: "TEAM_INVITATION_EXPIRED",
 
  /*
  |--------------------------------------------------------------------------
  | Match
  |--------------------------------------------------------------------------
  */
 
  MATCH_CREATED: "MATCH_CREATED",
 
  MATCH_REMINDER: "MATCH_REMINDER",
 
  MATCH_STARTED: "MATCH_STARTED",
 
  MATCH_COMPLETED: "MATCH_COMPLETED",
 
  MATCH_RESULT: "MATCH_RESULT",
 
  MATCH_CANCELLED: "MATCH_CANCELLED",
 
  MATCH_CONFIRMATION_REQUIRED: "MATCH_CONFIRMATION_REQUIRED",
 
  MATCH_CONFIRMED: "MATCH_CONFIRMED",
 
  MATCH_CONFIRMATION_REJECTED: "MATCH_CONFIRMATION_REJECTED",
 
  /*
  |--------------------------------------------------------------------------
  | Match Challenges
  |--------------------------------------------------------------------------
  */
 
  MATCH_CHALLENGE_RECEIVED: "MATCH_CHALLENGE_RECEIVED",
 
  MATCH_CHALLENGE_ACCEPTED: "MATCH_CHALLENGE_ACCEPTED",
 
  MATCH_CHALLENGE_REJECTED: "MATCH_CHALLENGE_REJECTED",
 
  MATCH_CHALLENGE_CANCELLED: "MATCH_CHALLENGE_CANCELLED",
 
  MATCH_CHALLENGE_MODIFIED: "MATCH_CHALLENGE_MODIFIED",
 
  /*
  |--------------------------------------------------------------------------
  | Team Reviews
  |--------------------------------------------------------------------------
  */
 
  TEAM_REVIEW_RECEIVED: "TEAM_REVIEW_RECEIVED",
 
  /*
  |--------------------------------------------------------------------------
  | Tournament
  |--------------------------------------------------------------------------
  */
 
  TOURNAMENT_CREATED: "TOURNAMENT_CREATED",
 
  TOURNAMENT_INVITATION: "TOURNAMENT_INVITATION",
 
  TOURNAMENT_STARTED: "TOURNAMENT_STARTED",
 
  TOURNAMENT_COMPLETED: "TOURNAMENT_COMPLETED",
 
  /*
  |--------------------------------------------------------------------------
  | Ground
  |--------------------------------------------------------------------------
  */
 
  GROUND_BOOKING_CREATED: "GROUND_BOOKING_CREATED",
 
  GROUND_BOOKING_APPROVED: "GROUND_BOOKING_APPROVED",
 
  GROUND_BOOKING_REJECTED: "GROUND_BOOKING_REJECTED",
 
  GROUND_BOOKING_CANCELLED: "GROUND_BOOKING_CANCELLED",
 
  /*
  |--------------------------------------------------------------------------
  | Chat
  |--------------------------------------------------------------------------
  */
 
  CHAT_MESSAGE: "CHAT_MESSAGE",
 
  /*
  |--------------------------------------------------------------------------
  | Social
  |--------------------------------------------------------------------------
  */
 
  FOLLOW_REQUEST: "FOLLOW_REQUEST",
 
  FOLLOW_ACCEPTED: "FOLLOW_ACCEPTED",
 
  FOLLOW_REJECTED: "FOLLOW_REJECTED",
 
  /*
  |--------------------------------------------------------------------------
  | System
  |--------------------------------------------------------------------------
  */
 
  PROFILE_COMPLETED: "PROFILE_COMPLETED",
 
  ACCOUNT_VERIFIED: "ACCOUNT_VERIFIED",
 
  SYSTEM: "SYSTEM",
 
  APP_UPDATE: "APP_UPDATE",
 
};

/*
|--------------------------------------------------------------------------
| Notification Status
|--------------------------------------------------------------------------
|
| Mirrors TeamInvitation.status on the backend. This is attached to a
| notification at fetch time (see notification.service.ts getNotifications)
| for any notification carrying data.invitationId - it is NOT a field
| stored on the Notification document itself.
|
*/

export const NOTIFICATION_STATUS = {
  PENDING: "PENDING",

  ACCEPTED: "ACCEPTED",

  REJECTED: "REJECTED",

  CANCELLED: "CANCELLED",

  EXPIRED: "EXPIRED",

  READ: "READ",

  UNREAD: "UNREAD",
};

export const FILTERS = NOTIFICATION_FILTERS;

export const NOTIFICATION_CATEGORY_MAP = {
  /*
  |--------------------------------------------------------------------------
  | Invitation
  |--------------------------------------------------------------------------
  */

  TEAM_INVITATION_RECEIVED: "INVITATION",
  TEAM_INVITATION_ACCEPTED: "INVITATION",
  TEAM_INVITATION_REJECTED: "INVITATION",
  TEAM_INVITATION_CANCELLED: "INVITATION",
  TEAM_INVITATION_EXPIRED: "INVITATION",

  /*
  |--------------------------------------------------------------------------
  | Team
  |--------------------------------------------------------------------------
  */

  TEAM_CREATED: "TEAM",
  PLAYER_JOINED_TEAM: "TEAM",
  PLAYER_LEFT_TEAM: "TEAM",
  CAPTAIN_ASSIGNED: "TEAM",
  VICE_CAPTAIN_ASSIGNED: "TEAM",

  /*
  |--------------------------------------------------------------------------
  | Match
  |--------------------------------------------------------------------------
  */

  MATCH_CREATED: "MATCH",
  MATCH_REMINDER: "MATCH",
  MATCH_COMPLETED: "MATCH",

  /*
  |--------------------------------------------------------------------------
  | Ground
  |--------------------------------------------------------------------------
  */

  GROUND_BOOKING_APPROVED: "GROUND",
  GROUND_BOOKING_CANCELLED: "GROUND",

  /*
  |--------------------------------------------------------------------------
  | Tournament
  |--------------------------------------------------------------------------
  */

  TOURNAMENT_CREATED: "TOURNAMENT",

  /*
  |--------------------------------------------------------------------------
  | System
  |--------------------------------------------------------------------------
  */

  SYSTEM: "SYSTEM",
};
