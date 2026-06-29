import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;
const withId = (path, matchId) => path.replace(":id", matchId);

export const getMatchesApi = async () => {
  const response = await apiClient.get(ENDPOINTS.MATCH.LIST);
  return unwrap(response);
};

export const getMatchByIdApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.DETAILS, matchId));
  return unwrap(response);
};

export const createMatchApi = async (payload) => {
  const response = await apiClient.post(ENDPOINTS.MATCH.CREATE, payload);
  return unwrap(response);
};

export const updateMatchApi = async (matchId, payload) => {
  const response = await apiClient.put(
    withId(ENDPOINTS.MATCH.DETAILS, matchId),
    payload,
  );
  return unwrap(response);
};

export const deleteMatchApi = async (matchId) => {
  const response = await apiClient.delete(withId(ENDPOINTS.MATCH.DETAILS, matchId));
  return response.data;
};

export const startMatchApi = async (matchId) => {
  const response = await apiClient.put(withId(ENDPOINTS.MATCH.START, matchId));
  return unwrap(response);
};

export const completeMatchApi = async (matchId) => {
  const response = await apiClient.put(withId(ENDPOINTS.MATCH.COMPLETE, matchId));
  return unwrap(response);
};

export const updateMatchResultApi = async (matchId, payload) => {
  const response = await apiClient.put(withId(ENDPOINTS.MATCH.RESULT, matchId), payload);
  return unwrap(response);
};

export const getLiveMatchApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.LIVE, matchId));
  return unwrap(response);
};

export const getMatchSummaryApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.SUMMARY, matchId));
  return unwrap(response);
};

export const getFullScorecardApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.FULL_SCORECARD, matchId));
  return unwrap(response);
};
