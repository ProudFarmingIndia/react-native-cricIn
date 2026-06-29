export const selectPlayers =
  state =>
    state.players.players;

export const selectPlayersLoading =
  state =>
    state.players.loading;

export const selectPlayersError =
  state =>
    state.players.error;

export const selectSelectedPlayer =
  state =>
    state.players.selectedPlayer;