import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  followTarget,
  unfollowTarget,
  fetchFollowStats,
  fetchFollowers,
  fetchMyFollowing,
  hydrateFollowState,
  clearFollowError,
  targetKey,
} from "../store/followSlice";

/*
|--------------------------------------------------------------------------
| useFollow
|--------------------------------------------------------------------------
|
| Two ways in:
|
|   useFollow()                      - the lists and the hydrate action.
|   useFollow("PLAYER", playerId)    - everything above, plus the state and
|                                      toggle for that one target.
|
| The scoped form is what FollowButton uses. Because the selector reads a
| single key out of byTarget, a button only re-renders when its own target
| changes - twenty buttons in a search list stay independent.
|
*/

const EMPTY_STATE = {
  isFollowing: false,

  followers: 0,

  following: 0,
};

export default function useFollow(targetType, targetId) {
  const dispatch = useDispatch();

  const key = targetType && targetId ? targetKey(targetType, targetId) : null;

  const state = useSelector((s) =>
    key ? s.follow?.byTarget?.[key] || EMPTY_STATE : EMPTY_STATE,
  );

  const isPending = useSelector((s) =>
    key ? Boolean(s.follow?.pending?.[key]) : false,
  );

  const followers = useSelector((s) => s.follow?.followers || []);

  const followersLoading = useSelector(
    (s) => s.follow?.followersLoading || false,
  );

  const following = useSelector(
    (s) => s.follow?.following || { players: [], teams: [] },
  );

  const followingLoading = useSelector(
    (s) => s.follow?.followingLoading || false,
  );

  const error = useSelector((s) => s.follow?.error || null);

  /*
  |--------------------------------------------------------------------------
  | Toggle
  |--------------------------------------------------------------------------
  |
  | Guarded on isPending so a rapid double tap cannot dispatch a follow and
  | an unfollow that race each other - whichever landed second would win,
  | leaving the button showing the opposite of the truth.
  |
  */

  const toggleFollow = useCallback(() => {
    if (!targetType || !targetId || isPending) {
      return;
    }

    if (state.isFollowing) {
      dispatch(unfollowTarget({ targetType, targetId }));

      return;
    }

    dispatch(followTarget({ targetType, targetId }));
  }, [dispatch, targetType, targetId, state.isFollowing, isPending]);

  const loadStats = useCallback(() => {
    if (!targetType || !targetId) {
      return;
    }

    dispatch(fetchFollowStats({ targetType, targetId }));
  }, [dispatch, targetType, targetId]);

  return {
    isFollowing: state.isFollowing,

    followers: state.followers,

    following: state.following,

    isPending,

    toggleFollow,

    loadStats,

    // Lists
    followersList: followers,

    followersLoading,

    followingList: following,

    followingLoading,

    error,

    loadFollowers: useCallback(
      (type, id) => dispatch(fetchFollowers({ targetType: type, targetId: id })),
      [dispatch],
    ),

    loadMyFollowing: useCallback(
      () => dispatch(fetchMyFollowing()),
      [dispatch],
    ),

    /*
    | Called with the rows from a search response, which already carry
    | isFollowing and followerCount - saves a stats request per row.
    */

    hydrate: useCallback(
      (entries) => dispatch(hydrateFollowState(entries)),
      [dispatch],
    ),

    clearError: useCallback(() => dispatch(clearFollowError()), [dispatch]),
  };
}
