// export const ENDPOINTS = {
//   AUTH: {
//     SEND_OTP: "/auth/send-otp",

//     VERIFY_OTP: "/auth/verify-otp",

//     LOGOUT: "/auth/logout",
//   },

//   USER: {
//     PROFILE: "/user/profile",
//   },

//   MATCH: {
//     LIST: "/matches",

//     DETAILS: "/matches/:id",
//   },

//   TEAM: {
//     LIST: "/teams",

//     DETAILS: "/teams/:id",
//   },
//   PLAYERS: {
//     GET_ALL: "/players",
//   },
// };
export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    LOGOUT: "/auth/logout",
  },

  USER: {
    ME: "/users/me",               // GET  — basic user info (phone, role)
    PROFILE: "/users/profile",     // PUT  — update name/avatar
    SELECT_ROLE: "/users/select-role",     // POST — set role after first login
    COMPLETE_PROFILE: "/users/complete-profile", // PATCH — mark profile done
  },

  PLAYER: {
    ME: "/players/me",             // GET  — get my player profile
    UPDATE: "/players/me",         // PUT  — update my player profile
    CREATE: "/players",            // POST — create player profile (first time)
    ALL: "/players/all",           // GET  — all players
    BY_ID: "/players",             // GET  /players/:id
    STATS: "/players",             // GET  /players/:id/stats
  },

  MATCH: {
    LIST: "/matches",
    DETAILS: "/matches/:id",
  },

  TEAM: {
    LIST: "/teams",
    DETAILS: "/teams/:id",
  },
};
