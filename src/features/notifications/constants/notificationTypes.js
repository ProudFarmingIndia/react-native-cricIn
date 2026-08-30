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

  /*
  | Follow activity is its own filter rather than being folded into
  | "Matches". A followed team's result and your own team's fixture are
  | different kinds of news - one is something to act on, the other is
  | something to read - and mixing them makes the Matches tab noisy enough
  | that people stop opening it.
  */

  {
    value: "SOCIAL",

    label: "Following",
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
  | Category Map
  |--------------------------------------------------------------------------
  |
  | Every type the backend can emit MUST appear here. NotificationScreen
  | filters with NOTIFICATION_CATEGORY_MAP[item.type] === filter, so an
  | unmapped type is invisible under every filter except "All".
  |
  | This previously missed 14 of the 25 live types - including every
  | MATCH_CHALLENGE_*, MATCH_CONFIRMATION_REQUIRED and
  | VICE_CAPTAIN_PROPOSED, which are the most actionable notifications in
  | the app. Meanwhile six entries here were for types nothing emits.
  |
  */

  // Invitations
  TEAM_INVITATION_RECEIVED: "INVITATION",
  TEAM_INVITATION_ACCEPTED: "INVITATION",
  TEAM_INVITATION_REJECTED: "INVITATION",
  TEAM_INVITATION_CANCELLED: "INVITATION",
  TEAM_INVITATION_EXPIRED: "INVITATION",

  // Team - membership and leadership
  TEAM_CREATED: "TEAM",
  TEAM_UPDATED: "TEAM",
  TEAM_DELETED: "TEAM",
  PLAYER_JOINED_TEAM: "TEAM",
  PLAYER_LEFT_TEAM: "TEAM",
  CAPTAIN_ASSIGNED: "TEAM",
  VICE_CAPTAIN_PROPOSED: "TEAM",
  VICE_CAPTAIN_ASSIGNED: "TEAM",
  VICE_CAPTAIN_REJECTED: "TEAM",
  VICE_CAPTAIN_CANCELLED: "TEAM",
  TEAM_REVIEW_RECEIVED: "TEAM",

  // Match - fixtures, challenges and confirmation
  MATCH_CREATED: "MATCH",
  MATCH_REMINDER: "MATCH",
  MATCH_STARTED: "MATCH",
  MATCH_COMPLETED: "MATCH",
  MATCH_RESULT: "MATCH",
  MATCH_CANCELLED: "MATCH",
  MATCH_CONFIRMATION_REQUIRED: "MATCH",
  MATCH_CONFIRMED: "MATCH",
  MATCH_CONFIRMATION_REJECTED: "MATCH",
  MATCH_PIN_SHARED: "MATCH",
  MATCH_CHALLENGE_RECEIVED: "MATCH",
  MATCH_CHALLENGE_ACCEPTED: "MATCH",
  MATCH_CHALLENGE_REJECTED: "MATCH",
  MATCH_CHALLENGE_CANCELLED: "MATCH",
  MATCH_CHALLENGE_MODIFIED: "MATCH",

  // Ground
  GROUND_BOOKING_CREATED: "GROUND",
  GROUND_BOOKING_APPROVED: "GROUND",
  GROUND_BOOKING_REJECTED: "GROUND",
  GROUND_BOOKING_CANCELLED: "GROUND",

  // Tournament
  TOURNAMENT_CREATED: "TOURNAMENT",
  TOURNAMENT_INVITATION: "TOURNAMENT",
  TOURNAMENT_STARTED: "TOURNAMENT",
  TOURNAMENT_COMPLETED: "TOURNAMENT",

  /*
  | Social - follow activity.
  |
  | PLAYER_OF_THE_MATCH is the award landing on the player who won it, so
  | it belongs with their own matches, not with their followers' feed.
  */
  NEW_FOLLOWER: "SOCIAL",
  FOLLOWED_MATCH_LIVE: "SOCIAL",
  FOLLOWED_MATCH_RESULT: "SOCIAL",
  FOLLOWED_PLAYER_AWARD: "SOCIAL",
  FOLLOWED_PLAYER_MILESTONE: "SOCIAL",
  PLAYER_OF_THE_MATCH: "MATCH",

  // System - anything without a home of its own
  CHAT_MESSAGE: "SYSTEM",
  FOLLOW_REQUEST: "SYSTEM",
  FOLLOW_ACCEPTED: "SYSTEM",
  FOLLOW_REJECTED: "SYSTEM",
  PROFILE_COMPLETED: "SYSTEM",
  ACCOUNT_VERIFIED: "SYSTEM",
  SYSTEM: "SYSTEM",
  APP_UPDATE: "SYSTEM",
};
