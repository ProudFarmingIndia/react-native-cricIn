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
  | The nine types the tournament module actually emits. The four above
  | predate it and are kept because older notifications already in the
  | database carry them - removing them here would leave those rows with
  | the default icon and no category.
  |
  | TOURNAMENT_INVITE_RECEIVED is the only actionable one: it goes to a
  | team's CAPTAIN and nobody else, and carries data.tournamentId and
  | data.teamId, which is what the accept screen needs.
  |
  | TOURNAMENT_JOIN_REQUEST goes the other way - a captain asking to enter
  | a tournament with public participation on - and lands on the
  | ORGANIZER, who answers it from the manage screen.
  */

  TOURNAMENT_INVITE_RECEIVED: "TOURNAMENT_INVITE_RECEIVED",

  TOURNAMENT_INVITE_ACCEPTED: "TOURNAMENT_INVITE_ACCEPTED",

  TOURNAMENT_INVITE_DECLINED: "TOURNAMENT_INVITE_DECLINED",

  TOURNAMENT_JOIN_REQUEST: "TOURNAMENT_JOIN_REQUEST",

  TOURNAMENT_FIXTURES_READY: "TOURNAMENT_FIXTURES_READY",

  TOURNAMENT_MATCH_REMINDER: "TOURNAMENT_MATCH_REMINDER",

  TOURNAMENT_SCORER_ASSIGNED: "TOURNAMENT_SCORER_ASSIGNED",

  TOURNAMENT_SCORER_REVOKED: "TOURNAMENT_SCORER_REVOKED",

  TOURNAMENT_CANCELLED: "TOURNAMENT_CANCELLED",

  /*
  |--------------------------------------------------------------------------
  | Series
  |--------------------------------------------------------------------------
  |
  | A bilateral series has ONE invite, to the opponent team's captain, and
  | it is the only actionable one here - everything else is news.
  |
  | Deliberately its own set rather than reusing the TOURNAMENT_* types.
  | They carry a seriesId rather than a tournamentId, route to a different
  | screen, and a captain reading "Tournament invite" for a three-match
  | series would reasonably wonder what they had been entered into.
  */

  SERIES_INVITE_RECEIVED: "SERIES_INVITE_RECEIVED",

  SERIES_INVITE_ACCEPTED: "SERIES_INVITE_ACCEPTED",

  SERIES_INVITE_DECLINED: "SERIES_INVITE_DECLINED",

  SERIES_FIXTURES_READY: "SERIES_FIXTURES_READY",

  SERIES_MATCH_REMINDER: "SERIES_MATCH_REMINDER",

  SERIES_SCORER_ASSIGNED: "SERIES_SCORER_ASSIGNED",

  SERIES_SCORER_REVOKED: "SERIES_SCORER_REVOKED",

  SERIES_CANCELLED: "SERIES_CANCELLED",

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
  | Live Streaming
  |--------------------------------------------------------------------------
  |
  | These MUST match backend/src/modules/notifications/notification.types.ts
  | character for character - see the warning at the top of this file. A
  | mismatch here is silent: the notification still arrives, but it gets
  | the default icon, no Accept/Reject buttons, and tapping it opens the
  | generic detail screen instead of the invite.
  |
  | BROADCAST_INVITE_RECEIVED is the only actionable one - it is the
  | invite asking someone to film a match, and it carries data.matchId and
  | data.angle.
  |
  */

  BROADCAST_INVITE_RECEIVED: "BROADCAST_INVITE_RECEIVED",

  BROADCAST_INVITE_ACCEPTED: "BROADCAST_INVITE_ACCEPTED",

  BROADCAST_INVITE_DECLINED: "BROADCAST_INVITE_DECLINED",

  BROADCAST_INVITE_REVOKED: "BROADCAST_INVITE_REVOKED",

  /*
  | A camera has connected on a match you follow. Separate from
  | FOLLOWED_MATCH_LIVE, which is about scoring starting - they happen at
  | different times and offer different things (a scorecard vs a picture).
  */

  FOLLOWED_STREAM_LIVE: "FOLLOWED_STREAM_LIVE",

  /*
  | Only fires when KEEP_RECORDINGS is switched on. In phase one no
  | post-match video is stored, so nothing sends this - it is listed so
  | that turning replays back on later needs no app change.
  */

  RECORDING_EXPIRING: "RECORDING_EXPIRING",

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
  | The invite and the join request are filed under INVITATION, not
  | TOURNAMENT, for the same reason the broadcast invite is: they are
  | somebody asking you to do something, and they belong next to the other
  | invites waiting for an answer. Everything else about a tournament is
  | news, and goes in the TOURNAMENT tab.
  */
  TOURNAMENT_INVITE_RECEIVED: "INVITATION",
  TOURNAMENT_JOIN_REQUEST: "INVITATION",

  TOURNAMENT_INVITE_ACCEPTED: "TOURNAMENT",
  TOURNAMENT_INVITE_DECLINED: "TOURNAMENT",
  TOURNAMENT_FIXTURES_READY: "TOURNAMENT",
  TOURNAMENT_MATCH_REMINDER: "TOURNAMENT",
  TOURNAMENT_SCORER_ASSIGNED: "TOURNAMENT",
  TOURNAMENT_SCORER_REVOKED: "TOURNAMENT",
  TOURNAMENT_CANCELLED: "TOURNAMENT",

  /*
  | Series. Filed under the TOURNAMENT category rather than a new one -
  | the filter row is already eight chips wide and a ninth would start
  | scrolling, while "Tournament" is close enough to how people think
  | about both. The invite goes under INVITATION with the other things
  | waiting for an answer.
  */
  SERIES_INVITE_RECEIVED: "INVITATION",

  SERIES_INVITE_ACCEPTED: "TOURNAMENT",
  SERIES_INVITE_DECLINED: "TOURNAMENT",
  SERIES_FIXTURES_READY: "TOURNAMENT",
  SERIES_MATCH_REMINDER: "TOURNAMENT",
  SERIES_SCORER_ASSIGNED: "TOURNAMENT",
  SERIES_SCORER_REVOKED: "TOURNAMENT",
  SERIES_CANCELLED: "TOURNAMENT",

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

  /*
  | Live streaming.
  |
  | The invite is filed under INVITATION, not MATCH, because that is what
  | it is: somebody asking you to do something, sitting next to the team
  | invites in the same tab. The invited person is often in neither squad,
  | so burying it under "Matches" - a tab full of fixtures they have no
  | connection to - is exactly where they would not look.
  |
  | FOLLOWED_STREAM_LIVE is follower news, so it goes with the rest of the
  | follow activity and can be muted with it.
  */
  BROADCAST_INVITE_RECEIVED: "INVITATION",
  BROADCAST_INVITE_ACCEPTED: "INVITATION",
  BROADCAST_INVITE_DECLINED: "INVITATION",
  BROADCAST_INVITE_REVOKED: "INVITATION",

  FOLLOWED_STREAM_LIVE: "SOCIAL",

  RECORDING_EXPIRING: "MATCH",

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