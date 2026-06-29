import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/authSlice";
import profileReducer from "../features/profile/store/profileSlice";
import homeReducer from "../features/home/store/homeSlice";
import playersReducer from "../features/players/store/playersSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  home: homeReducer,
  players: playersReducer,
});

export default rootReducer;
