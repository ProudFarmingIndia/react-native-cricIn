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
    BY_ID: "/players",
    STATS: "/players",
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
    ACCEPT: (id) => `/team-invitations/${id}/accept`,
    REJECT: (id) => `/team-invitations/${id}/reject`,
    DELETE: (id) => `/team-invitations/${id}`,
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
    DELETE: (id) => `/notifications/${id}`,
    DELETE_ALL: "/notifications",
  },

  TOURNAMENT: {
    LIST: "/tournaments",
    CREATE: "/tournaments",
    DETAILS: (id) => `/tournaments/${id}`,
    UPDATE: (id) => `/tournaments/${id}`,
    DELETE: (id) => `/tournaments/${id}`,
    ADD_TEAM: (id) => `/tournaments/${id}/teams`,
    REMOVE_TEAM: (teamId, id) => `/tournaments/${id}/teams/${teamId}`,
    COMPLETE: (id) => `/tournaments/${id}/complete`,
  },

  UPLOAD: {
    IMAGE: "/upload/image",
  },
};