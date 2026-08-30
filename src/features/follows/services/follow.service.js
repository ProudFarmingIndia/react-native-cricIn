import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

/*
|--------------------------------------------------------------------------
| Follow Service
|--------------------------------------------------------------------------
|
| Every response from this API is { success, data, message }; unwrap pulls
| out the part the slice cares about.
|
| targetType is always the literal "PLAYER" or "TEAM". It is spelled out at
| every call site rather than inferred, because the backend uses it to pick
| a collection - guessing wrong silently follows a different entity.
|
*/

const unwrap = (response) => response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| Follow / Unfollow
|--------------------------------------------------------------------------
|
| Both are idempotent server-side: following twice returns the existing
| follow, unfollowing something not followed reports removed:false. Neither
| is an error, so the UI never has to guard against a double tap.
|
*/

export const followApi = async (targetType, targetId) => {
  const response = await apiClient.post(ENDPOINTS.FOLLOW.FOLLOW, {
    targetType,

    targetId,
  });

  return unwrap(response);
};

export const unfollowApi = async (targetType, targetId) => {
  const response = await apiClient.delete(
    ENDPOINTS.FOLLOW.UNFOLLOW(targetType, targetId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Follow Stats
|--------------------------------------------------------------------------
|
| { followers, following, isFollowing } for one target. Counted live on the
| server rather than read off a denormalised field, so the profile header
| is always right.
|
*/

export const getFollowStatsApi = async (targetType, targetId) => {
  const response = await apiClient.get(
    ENDPOINTS.FOLLOW.STATS(targetType, targetId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Lists
|--------------------------------------------------------------------------
*/

export const getFollowersApi = async (targetType, targetId) => {
  const response = await apiClient.get(
    ENDPOINTS.FOLLOW.FOLLOWERS(targetType, targetId),
  );

  return unwrap(response);
};

export const getMyFollowingApi = async () => {
  const response = await apiClient.get(ENDPOINTS.FOLLOW.MY_FOLLOWING);

  return unwrap(response);
};
