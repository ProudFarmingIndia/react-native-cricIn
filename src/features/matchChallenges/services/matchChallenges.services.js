import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| Send Challenge
|--------------------------------------------------------------------------
*/

export const sendChallengeApi = async (payload) => {
  const response = await apiClient.post(
    ENDPOINTS.MATCH_CHALLENGE.SEND,
    payload,
  );
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Get Challenges For A Team
|--------------------------------------------------------------------------
*/

export const getChallengesForTeamApi = async (
  teamId,
  direction = "received",
) => {
  const response = await apiClient.get(
    ENDPOINTS.MATCH_CHALLENGE.LIST_FOR_TEAM(teamId),
    {
      params: { direction },
    },
  );
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Get Challenge By ID  ← Batch 6
|--------------------------------------------------------------------------
| Used by ChallengeDetailScreen and notification deep-links.
*/

export const getChallengeByIdApi = async (challengeId) => {
  const response = await apiClient.get(
    ENDPOINTS.MATCH_CHALLENGE.BY_ID(challengeId),
  );
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Accept Challenge
|--------------------------------------------------------------------------
*/

export const acceptChallengeApi = async (challengeId) => {
  const response = await apiClient.put(
    ENDPOINTS.MATCH_CHALLENGE.ACCEPT(challengeId),
  );
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Reject Challenge (Reason Required)
|--------------------------------------------------------------------------
*/

export const rejectChallengeApi = async (challengeId, payload) => {
  const response = await apiClient.put(
    ENDPOINTS.MATCH_CHALLENGE.REJECT(challengeId),
    payload,
  );
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Modify Challenge (Counter-Proposal)
|--------------------------------------------------------------------------
*/

export const modifyChallengeApi = async (challengeId, payload) => {
  const response = await apiClient.put(
    ENDPOINTS.MATCH_CHALLENGE.MODIFY(challengeId),
    payload,
  );
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Cancel Challenge (By Whoever Is Currently Waiting)
|--------------------------------------------------------------------------
*/

export const cancelChallengeApi = async (challengeId) => {
  const response = await apiClient.delete(
    ENDPOINTS.MATCH_CHALLENGE.CANCEL(challengeId),
  );
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Cancel A Confirmed Match (Post-Acceptance)
|--------------------------------------------------------------------------
*/

export const cancelConfirmedMatchApi = async (matchId) => {
  const response = await apiClient.put(
    ENDPOINTS.MATCH_CHALLENGE.CANCEL_CONFIRMED_MATCH(matchId),
  );
  return unwrap(response);
};
