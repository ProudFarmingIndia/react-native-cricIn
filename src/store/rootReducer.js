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
import matchesReducer from "../features/matches/store/matchesSlice";
import scoringReducer from "../features/scoring/store/scoringSlice";

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

  matches: matchesReducer,

  scoring: scoringReducer,
});

export default rootReducer;