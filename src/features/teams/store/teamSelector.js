export const selectTeamState = (state) => state.team;

export const selectMyTeams = (state) =>
  state.team.myTeams;

export const selectAllTeams = (state) =>
  state.team.allTeams;

export const selectCurrentTeam = (state) =>
  state.team.currentTeam;

export const selectLoading = (state) =>
  state.team.loading;

export const selectError = (state) =>
  state.team.error;

export const selectSuccess = (state) =>
  state.team.success;