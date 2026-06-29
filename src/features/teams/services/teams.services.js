import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;
const withId = (path, id) => path.replace(":id", id);
const withTeamId = (path, teamId) => path.replace(":teamId", teamId);

export const getMyTeamsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.TEAM.LIST);
  return unwrap(response);
};

export const getAllTeamsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.TEAM.ALL);
  return unwrap(response);
};

export const getTeamByIdApi = async (teamId) => {
  const response = await apiClient.get(withId(ENDPOINTS.TEAM.DETAILS, teamId));
  return unwrap(response);
};

export const createTeamApi = async (payload) => {
  const response = await apiClient.post(ENDPOINTS.TEAM.CREATE, payload);
  return unwrap(response);
};

export const updateTeamApi = async (teamId, payload) => {
  const response = await apiClient.put(
    withId(ENDPOINTS.TEAM.DETAILS, teamId),
    payload,
  );
  return unwrap(response);
};

export const deleteTeamApi = async (teamId) => {
  const response = await apiClient.delete(withId(ENDPOINTS.TEAM.DETAILS, teamId));
  return response.data;
};

export const addPlayerToTeamApi = async (teamId, playerId) => {
  const response = await apiClient.post(withTeamId(ENDPOINTS.TEAM.PLAYERS, teamId), {
    playerId,
  });
  return unwrap(response);
};

export const removePlayerFromTeamApi = async (teamId, playerId) => {
  const response = await apiClient.delete(
    withTeamId(ENDPOINTS.TEAM.PLAYER, teamId).replace(":playerId", playerId),
  );
  return unwrap(response);
};

export const setTeamCaptainApi = async (teamId, captainId) => {
  const response = await apiClient.put(withTeamId(ENDPOINTS.TEAM.CAPTAIN, teamId), {
    captainId,
  });
  return unwrap(response);
};
