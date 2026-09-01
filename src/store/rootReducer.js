import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../features/auth/store/authSlice";
import profileReducer from "../features/profile/store/profileSlice";
import homeReducer from "../features/home/store/homeSlice";
import playersReducer from "../features/players/store/playersSlice";

import teamReducer from "../features/teams/store/teamSlice";
import invitationReducer from "../features/teamInvitations/store/invitationSlice";
import viceCaptainProposalReducer from "../features/viceCaptain/store/viceCaptainProposalSlice";
import searchReducer from "../features/search/store/searchSlice";
import notificationReducer from "../features/notifications/store/notificationSlice";
import followReducer from "../features/follows/store/followSlice";
import scoringReducer from "../features/scoring/store/scoringSlice";
import matchesReducer from "../features/matches/store/matchesSlice";

/*
|--------------------------------------------------------------------------
| Root Reducer
|--------------------------------------------------------------------------
|
| `matches` is registered but not yet USED.
|
| matchesSlice.js and matchesSelectors.js were 0-byte scaffolding and are
| now written. Adding the key here is deliberately inert: every match
| screen still fetches through features/matches/services/matches.services.js
| into its own local state, exactly as before, and nothing selects
| state.matches yet. Screens can move across one at a time.
|
| A NOTE THAT USED TO BE WRONG: this said that importing an empty slice
| file "throws at store construction and stops the app booting". It does
| not, and I tested it. Redux's combineReducers logs `No reducer provided
| for key "x"` and drops the key - the app boots, state.x is undefined, and
| the failure surfaces later inside whichever component selects it. That is
| why every selector in matchesSelectors.js falls back to an empty shape
| rather than reading state.matches directly.
|
*/

const rootReducer = combineReducers({
  auth: authReducer,

  profile: profileReducer,

  home: homeReducer,

  players: playersReducer,

  team: teamReducer,

  invitation: invitationReducer,

  viceCaptainProposal: viceCaptainProposalReducer,

  search: searchReducer,

  notifications: notificationReducer,

  /*
  | Follow state for players and teams, keyed by "TYPE:id" so a Follow
  | button in a twenty-row search list re-renders only its own row.
  */

  follow: followReducer,

  scoring: scoringReducer,

  /*
  | Registered, empty, and read by nothing yet - see the note above.
  */
  matches: matchesReducer,
});

export default rootReducer;