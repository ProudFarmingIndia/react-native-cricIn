import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const unwrap = (response) => response.data?.data ?? response.data;

const withId = (path, id) => path.replace(":id", id);

const withTeamId = (path, teamId) => path.replace(":teamId", teamId);

/*
|--------------------------------------------------------------------------
| Get My Teams
|--------------------------------------------------------------------------
*/

export const getMyTeamsApi = async () => {
  const response = await apiClient.get(
    ENDPOINTS.TEAM.MY
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Get All Teams
|--------------------------------------------------------------------------
*/

export const getAllTeamsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.TEAM.ALL);

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Get Team By Id
|--------------------------------------------------------------------------
*/

export const getTeamByIdApi = async (teamId) => {
  const response = await apiClient.get(withId(ENDPOINTS.TEAM.DETAILS, teamId));
  console.log("Get Team API:", response.data);
  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Create Team
|--------------------------------------------------------------------------
*/

export const createTeamApi = async (payload) => {
  const response = await apiClient.post(ENDPOINTS.TEAM.CREATE, payload);

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Update Team
|--------------------------------------------------------------------------
*/

export const updateTeamApi = async (teamId, payload) => {
  const response = await apiClient.put(
    withId(ENDPOINTS.TEAM.DETAILS, teamId),
    payload,
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Delete Team
|--------------------------------------------------------------------------
*/

export const deleteTeamApi = async (teamId) => {
  const response = await apiClient.delete(
    withId(ENDPOINTS.TEAM.DETAILS, teamId),
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Add Player
|--------------------------------------------------------------------------
*/

export const addPlayerToTeamApi = async (teamId, playerId) => {
  const response = await apiClient.post(
    withTeamId(ENDPOINTS.TEAM.PLAYERS, teamId),
    {
      playerId,
    },
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Leave Team
|--------------------------------------------------------------------------
*/

export const leaveTeamApi = async (teamId) => {
  const response = await apiClient.delete(
    ENDPOINTS.TEAM.LEAVE(teamId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Remove Player
|--------------------------------------------------------------------------
*/

export const removePlayerFromTeamApi = async (teamId, playerId) => {
  const response = await apiClient.delete(
    withTeamId(ENDPOINTS.TEAM.PLAYER, teamId).replace(":playerId", playerId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Set Captain
|--------------------------------------------------------------------------
*/

export const setTeamCaptainApi = async (teamId, captainId) => {
  const response = await apiClient.put(
    withTeamId(ENDPOINTS.TEAM.CAPTAIN, teamId),
    {
      captainId,
    },
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Revoke Vice Captain
|--------------------------------------------------------------------------
|
| Assigning a NEW vice-captain goes through vice-captain-proposal.service.js
| instead - this only handles removal, which doesn't need their approval.
|
*/

export const revokeViceCaptainApi = async (teamId) => {
  const response = await apiClient.put(
    ENDPOINTS.TEAM.VICE_CAPTAIN_REVOKE(teamId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Update Vice-Captain Rights
|--------------------------------------------------------------------------
*/

export const updateViceCaptainRightsApi = async (teamId, rights) => {
  const response = await apiClient.put(
    ENDPOINTS.TEAM.VICE_CAPTAIN_RIGHTS(teamId),
    rights,
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Update Team Stats
|--------------------------------------------------------------------------
*/

export const updateTeamStatsApi = async (teamId, payload = {}) => {
  const response = await apiClient.put(
    withTeamId(ENDPOINTS.TEAM.STATS, teamId),
    payload,
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| Create Local Player
|--------------------------------------------------------------------------
*/

export const createLocalPlayerApi = async (
  teamId,
  payload,
) => {
  const response = await apiClient.post(
    withTeamId(
      ENDPOINTS.TEAM.LOCAL_PLAYER,
      teamId,
    ),
    payload,
  );

  return unwrap(response);
};