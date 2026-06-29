import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  getPlayers,
  setSelectedPlayer,
  clearSelectedPlayer,
} from '../store/playersSlice';

import {
  selectPlayers,
  selectPlayersLoading,
  selectPlayersError,
  selectSelectedPlayer,
} from '../store/playersSelectors';

export default function usePlayers() {

  const dispatch =
    useDispatch();

  return {

    players:
      useSelector(
        selectPlayers
      ),

    loading:
      useSelector(
        selectPlayersLoading
      ),

    error:
      useSelector(
        selectPlayersError
      ),

    selectedPlayer:
      useSelector(
        selectSelectedPlayer
      ),

    fetchPlayers:
      () =>
        dispatch(
          getPlayers()
        ),

    selectPlayer:
      player =>
        dispatch(
          setSelectedPlayer(
            player
          )
        ),

    resetSelectedPlayer:
      () =>
        dispatch(
          clearSelectedPlayer()
        ),
  };
}