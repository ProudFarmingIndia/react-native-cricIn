export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    LOGOUT: "/auth/logout",
  },

  USER: {
    ME: "/users/me",
    PROFILE: "/users/profile",
    PUSH_TOKEN: "/users/push-token",
    SELECT_ROLE: "/users/select-role",
    COMPLETE_PROFILE: "/users/complete-profile",
  },

  PLAYER: {
    ME: "/players/me",
    UPDATE: "/players/me",
    CREATE: "/players",
    ALL: "/players/all",

    // Both are per-player and take an id. They used to be the bare string
    // "/players", so getPlayerByIdApi was calling a string as a function
    // and PlayerProfileScreen could never load.
    BY_ID: (playerId) => `/players/${playerId}`,
    STATS: (playerId) => `/players/${playerId}/stats`,
  },

  MATCH: {
    LIST: "/matches",
    CREATE: "/matches",
    DETAILS: "/matches/:id",
    START: "/matches/:id/start",
    COMPLETE: "/matches/:id/complete",
    RESULT: "/matches/:id/result",
    LIVE: "/matches/:id/live",
    SUMMARY: "/matches/:id/summary",
    // RESET_SETUP: "/matches/:id/reset-setup",
    OVER_BY_OVER: "/matches/:id/over-by-over",
    BATTING_SCORECARD: "/matches/:id/batting-scorecard",
    BOWLING_SCORECARD: "/matches/:id/bowling-scorecard",
    FOW: "/matches/:id/fow",
    FULL_SCORECARD: "/matches/:id/full-scorecard",

    // Batch 5
    SCORECARD_BY_INNINGS: (matchId) => `/matches/${matchId}/scorecard`,
    PARTNERSHIPS: (matchId) => `/matches/${matchId}/partnerships`,

    // Batch 6 — match feed
    FEED_LIVE: "/matches/feed/live",
    FEED_UPCOMING: "/matches/feed/upcoming",
    FEED_RECENT: "/matches/feed/recent",
    FEED_PENDING: "/matches/feed/pending",

    // Confirmation gate
    REQUEST_CONFIRMATION: (matchId) => `/matches/${matchId}/request-confirmation`,
    CONFIRM: (matchId) => `/matches/${matchId}/confirm`,
    REJECT_CONFIRMATION: (matchId) => `/matches/${matchId}/reject-confirmation`,
    VERIFY_PIN: (matchId) => `/matches/${matchId}/verify-pin`,
    RESET_SETUP: "/matches/:id/reset-setup",
    TRANSFER_SCORING: (matchId) => `/matches/${matchId}/transfer-scoring`,
  },

  MATCH_CHALLENGE: {
    SEND: "/match-challenges",
    LIST_FOR_TEAM: (teamId) => `/match-challenges/team/${teamId}`,
    BY_ID: (id) => `/match-challenges/${id}`,           // Batch 6
    ACCEPT: (id) => `/match-challenges/${id}/accept`,
    REJECT: (id) => `/match-challenges/${id}/reject`,
    MODIFY: (id) => `/match-challenges/${id}/modify`,
    CANCEL: (id) => `/match-challenges/${id}`,
    CANCEL_CONFIRMED_MATCH: (matchId) => `/match-challenges/match/${matchId}/cancel`,
  },

  SCORING: {
    CREATE_INNINGS: "/scoring/innings",
    GET_INNINGS: (id) => `/scoring/innings/${id}`,
    END_INNINGS: (inningsId) => `/scoring/innings/${inningsId}/end`,
    ADD_BALL: "/scoring/ball",
    SET_NEXT_BATSMAN: "/scoring/ball/next-batsman",
    SET_NEXT_BOWLER: "/scoring/ball/next-bowler",
    UNDO_BALL: (inningsId) => `/scoring/ball/${inningsId}/undo`,
    SCORECARD: (inningsId) => `/scoring/scorecard/${inningsId}`,
  },

  TEAM: {
    LIST: "/teams",
    MY: "/teams/my",
    ALL: "/teams/all",
    CREATE: "/teams",

    /* Must stay above DETAILS on the server too - see team.routes.ts. */
    NAME_AVAILABLE: "/teams/name-available",
    DETAILS: "/teams/:id",
    PLAYERS: "/teams/:teamId/players",
    PLAYER: "/teams/:teamId/players/:playerId",
    LOCAL_PLAYER: "/teams/:teamId/local-player",
    LEAVE: (teamId) => `/teams/${teamId}/leave`,
    CAPTAIN: "/teams/:teamId/captain",
    VICE_CAPTAIN_REVOKE: (teamId) => `/teams/${teamId}/vice-captain/revoke`,
    VICE_CAPTAIN_RIGHTS: (teamId) => `/teams/${teamId}/vice-captain/rights`,
    STATS: "/teams/:teamId/stats",
    CALENDAR: (teamId) => `/teams/${teamId}/calendar`,
    BLOCK_DATE: (teamId) => `/teams/${teamId}/block-date`,
    UNBLOCK_DATE: (teamId, date) => `/teams/${teamId}/block-date/${date}`,
  },

  VICE_CAPTAIN_PROPOSAL: {
    CREATE: "/vice-captain-proposals",
    MY: "/vice-captain-proposals/my",
    TEAM: (teamId) => `/vice-captain-proposals/team/${teamId}`,
    ACCEPT: (id) => `/vice-captain-proposals/${id}/accept`,
    REJECT: (id) => `/vice-captain-proposals/${id}/reject`,
    CANCEL: (id) => `/vice-captain-proposals/${id}`,
  },

  TEAM_INVITATION: {
    CREATE: "/team-invitations",
    MY: "/team-invitations/my",

    /*
    | Every invitation a team has sent, with status. Declared above the
    | ACCEPT/REJECT/DELETE id routes on the server for the same reason
    | /name-available sits above /:id - Express matches in order.
    */
    TEAM: (teamId) => `/team-invitations/team/${teamId}`,
    ACCEPT: (id) => `/team-invitations/${id}/accept`,
    REJECT: (id) => `/team-invitations/${id}/reject`,
    DELETE: (id) => `/team-invitations/${id}`,
  },

  /*
  |--------------------------------------------------------------------------
  | Follows
  |--------------------------------------------------------------------------
  |
  | targetType is always "PLAYER" or "TEAM" and is part of the path on
  | every per-target route - the backend needs it to know which collection
  | the id belongs to. UNFOLLOW in particular used to take only an id,
  | which meant it could delete the wrong subscription.
  |
  */

  FOLLOW: {
    FOLLOW: "/follows",

    UNFOLLOW: (targetType, targetId) => `/follows/${targetType}/${targetId}`,

    STATS: (targetType, targetId) =>
      `/follows/stats/${targetType}/${targetId}`,

    FOLLOWERS: (targetType, targetId) =>
      `/follows/followers/${targetType}/${targetId}`,

    MY_FOLLOWING: "/follows/following",

    RECALCULATE: (targetType, targetId) =>
      `/follows/recalculate/${targetType}/${targetId}`,
  },

  SEARCH: {
    PLAYERS: "/search/players",
    PLAYER_BY_MOBILE: "/search/players/mobile",
    TEAMS: "/search/teams",
    GROUNDS: "/search/grounds",
    TOURNAMENTS: "/search/tournaments",
    GLOBAL: "/search",
  },

  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ: (id) => `/notifications/${id}/read`,
    READ_ALL: "/notifications/read-all",
    READ_MANY: "/notifications/read-many",
    DELETE_MANY: "/notifications/many",
    DELETE: (id) => `/notifications/${id}`,
    DELETE_ALL: "/notifications",
  },

  /*
  |--------------------------------------------------------------------------
  | Tournaments
  |--------------------------------------------------------------------------
  |
  | Mounted at /api/tournaments.
  |
  | "/options" and "/preview" are declared ABOVE "/:id" on the server, so
  | they are real paths and not tournament ids. Rename either one here and
  | it will fail with a Mongoose cast error rather than a 404.
  |
  | The old ADD_TEAM / COMPLETE routes are gone: a team now joins through
  | an invite it has to accept, and a tournament completes itself when its
  | last match is played.
  |
  */

  TOURNAMENT: {
    OPTIONS: "/tournaments/options",
    PREVIEW: "/tournaments/preview",

    LIST: "/tournaments",
    CREATE: "/tournaments",

    DETAILS: (id) => `/tournaments/${id}`,
    VISIBILITY: (id) => `/tournaments/${id}/visibility`,
    CANCEL: (id) => `/tournaments/${id}/cancel`,

    /* Teams */
    INVITE: (id) => `/tournaments/${id}/invite`,
    RESPOND: (id) => `/tournaments/${id}/respond`,
    JOIN_REQUEST: (id) => `/tournaments/${id}/join-request`,
    RESPOND_JOIN_REQUEST: (id) => `/tournaments/${id}/join-request/respond`,
    CANCEL_INVITE: (id, teamId) => `/tournaments/${id}/invite/${teamId}`,
    REMOVE_TEAM: (id, teamId) => `/tournaments/${id}/teams/${teamId}`,
    WITHDRAW: (id, teamId) => `/tournaments/${id}/teams/${teamId}/withdraw`,
    SQUAD: (id, teamId) => `/tournaments/${id}/teams/${teamId}/squad`,

    /* Fixtures and standings */
    GENERATE: (id) => `/tournaments/${id}/generate-fixtures`,
    FIXTURES: (id) => `/tournaments/${id}/fixtures`,
    EDIT_FIXTURE: (id, matchId) => `/tournaments/${id}/fixtures/${matchId}`,
    ASSIGN_SCORER: (id, matchId) =>
      `/tournaments/${id}/fixtures/${matchId}/scorer`,
    POINTS_TABLE: (id) => `/tournaments/${id}/points-table`,
    STATS: (id) => `/tournaments/${id}/stats`,

    /* Awards: reading is open, setting a winner is organizer-only. */
    AWARDS: (id) => `/tournaments/${id}/awards`,
    AWARD_WINNER: (id, metric) =>
      `/tournaments/${id}/awards/${metric}/winner`,
  },

  /*
  |--------------------------------------------------------------------------
  | Series
  |--------------------------------------------------------------------------
  |
  | Mounted at /api/series on the server.
  |
  | A series is two teams playing a fixed number of matches - it needs no
  | seeding, no points table and no playoff bracket, so its surface is much
  | smaller than a tournament's. What it does share is the shape: invite,
  | publish, generate, edit a fixture, hand a match to a scorer, awards.
  |
  */

  SERIES: {
    OPTIONS: "/series/options",

    LIST: "/series",
    CREATE: "/series",

    DETAILS: (id) => `/series/${id}`,
    VISIBILITY: (id) => `/series/${id}/visibility`,
    CANCEL: (id) => `/series/${id}/cancel`,

    /* Opponent */
    INVITE: (id) => `/series/${id}/invite`,
    RESPOND: (id) => `/series/${id}/respond`,

    /* Fixtures */
    GENERATE: (id) => `/series/${id}/generate-fixtures`,
    FIXTURES: (id) => `/series/${id}/fixtures`,
    EDIT_FIXTURE: (id, matchId) => `/series/${id}/fixtures/${matchId}`,
    ASSIGN_SCORER: (id, matchId) => `/series/${id}/fixtures/${matchId}/scorer`,

    /* Results */
    SCORELINE: (id) => `/series/${id}/scoreline`,
    STATS: (id) => `/series/${id}/stats`,
    AWARDS: (id) => `/series/${id}/awards`,
    AWARD_WINNER: (id, metric) => `/series/${id}/awards/${metric}/winner`,
  },

  UPLOAD: {
    IMAGE: "/upload/image",
  },

  /*
  |--------------------------------------------------------------------------
  | Live Streaming
  |--------------------------------------------------------------------------
  |
  | Mounted at /api/live-streams on the server.
  |
  | ORDER MATTERS ON THE SERVER, NOT HERE, but it is worth knowing why the
  | paths look the way they do: "/live", "/quick-start", "/my-assignments",
  | ".../highlights", ".../playback-token" and ".../leave" are all declared
  | ABOVE the /:angle routes in liveStream.routes.ts. Rename one here and
  | it will 404 with a Mongoose cast error, not a missing-route error.
  |
  */

  LIVE_STREAM: {
    // Every match with a camera on it right now - the discovery feed.
    LIVE_FEED: "/live-streams/live",

    // "Go Live" with no match behind it yet. Creates a draft match too.
    QUICK_START: "/live-streams/quick-start",

    /*
    | Matches somebody has asked YOU to film. Its own endpoint because
    | every other feed filters by team membership, and the camera operator
    | is routinely in neither squad - so nothing else would ever show it
    | to them.
    */
    MY_ASSIGNMENTS: "/live-streams/my-assignments",

    CREATE: (matchId) => `/live-streams/match/${matchId}`,

    // Playback URLs, per-angle status, and the scorer's control block.
    GET: (matchId) => `/live-streams/match/${matchId}`,

    /*
    | The overlay's endpoint. Takes ?at=<ISO> - the moment the VIDEO is
    | showing, not the moment the request is made. See WatchLiveScreen.
    */
    STATE: (matchId) => `/live-streams/match/${matchId}/state`,

    HIGHLIGHTS: (matchId) => `/live-streams/match/${matchId}/highlights`,

    /*
    | Signed playback. The .m3u8 alone plays nothing - this returns it
    | with the token already attached.
    */
    PLAYBACK_TOKEN: (matchId, angle) =>
      `/live-streams/match/${matchId}/playback-token/${angle}`,

    // Frees the viewer slot when the player closes.
    LEAVE: (matchId) => `/live-streams/match/${matchId}/leave`,

    ASSIGN: (matchId) => `/live-streams/match/${matchId}/assign`,

    RESPOND: (matchId) => `/live-streams/match/${matchId}/respond`,

    KEY: (matchId, angle) =>
      `/live-streams/match/${matchId}/key/${angle}`,

    STOP: (matchId, angle) =>
      `/live-streams/match/${matchId}/${angle}/stop`,

    RESUME: (matchId, angle) =>
      `/live-streams/match/${matchId}/${angle}/resume`,

    KEEP_ALIVE: (matchId, angle) =>
      `/live-streams/match/${matchId}/${angle}/keep-alive`,

    DELETE: (matchId, angle) =>
      `/live-streams/match/${matchId}/${angle}`,
  },
};