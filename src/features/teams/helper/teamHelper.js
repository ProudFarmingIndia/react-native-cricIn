export const syncTeam = (state, updatedTeam) => {
  if (!updatedTeam?._id) return;

  /*
  |--------------------------------------------------------------------------
  | Current Team
  |--------------------------------------------------------------------------
  */

  state.currentTeam = updatedTeam;

  /*
  |--------------------------------------------------------------------------
  | My Teams
  |--------------------------------------------------------------------------
  */

  const myIndex = state.myTeams.findIndex(
    (team) => String(team._id) === String(updatedTeam._id),
  );

  if (myIndex >= 0) {
    state.myTeams[myIndex] = updatedTeam;
  } else {
    state.myTeams.unshift(updatedTeam);
  }

  /*
  |--------------------------------------------------------------------------
  | All Teams
  |--------------------------------------------------------------------------
  */

  const allIndex = state.allTeams.findIndex(
    (team) => String(team._id) === String(updatedTeam._id),
  );

  if (allIndex >= 0) {
    state.allTeams[allIndex] = updatedTeam;
  } else {
    state.allTeams.unshift(updatedTeam);
  }
};