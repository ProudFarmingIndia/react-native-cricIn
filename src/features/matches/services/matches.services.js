import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;
const withId = (path, matchId) => path.replace(":id", matchId);

// ── Match CRUD ────────────────────────────────────────────────────────────

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
  const response = await apiClient.put(withId(ENDPOINTS.MATCH.DETAILS, matchId), payload);
  return unwrap(response);
};

export const deleteMatchApi = async (matchId) => {
  const response = await apiClient.delete(withId(ENDPOINTS.MATCH.DETAILS, matchId));
  return response.data;
};

// ── Match Lifecycle ───────────────────────────────────────────────────────

export const startMatchApi = async (matchId, pin) => {
  const response = await apiClient.put(
    withId(ENDPOINTS.MATCH.START, matchId),
    { pin },
  );
  return unwrap(response);
};

export const verifyMatchPinApi = async (matchId, pin) => {
  const response = await apiClient.post(ENDPOINTS.MATCH.VERIFY_PIN(matchId), { pin });
  return unwrap(response);
};

export const transferScoringApi = async (matchId, targetUserId) => {
  const response = await apiClient.put(
    ENDPOINTS.MATCH.TRANSFER_SCORING(matchId),
    { targetUserId },
  );
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

export const resetMatchSetupApi = async (matchId) => {
  const response = await apiClient.put(
    withId(ENDPOINTS.MATCH.RESET_SETUP, matchId),
  );
  return unwrap(response);
};

// ── Match Feed ────────────────────────────────────────────────────────────

export const getLiveMatchesApi = async () => {
  const response = await apiClient.get(ENDPOINTS.MATCH.FEED_LIVE);
  return unwrap(response);
};

export const getUpcomingMatchesApi = async () => {
  const response = await apiClient.get(ENDPOINTS.MATCH.FEED_UPCOMING);
  return unwrap(response);
};

export const getRecentMatchesApi = async (limit = 20) => {
  const response = await apiClient.get(`${ENDPOINTS.MATCH.FEED_RECENT}?limit=${limit}`);
  return unwrap(response);
};

// ── Live & Summary ────────────────────────────────────────────────────────

export const getLiveMatchApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.LIVE, matchId));
  return unwrap(response);
};

export const getMatchSummaryApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.SUMMARY, matchId));
  return unwrap(response);
};

// ── Scorecards ────────────────────────────────────────────────────────────

export const getFullScorecardApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.FULL_SCORECARD, matchId));
  return unwrap(response);
};

export const getScorecardByInningsApi = async (matchId) => {
  const response = await apiClient.get(ENDPOINTS.MATCH.SCORECARD_BY_INNINGS(matchId));
  return unwrap(response);
};

export const getPartnershipsApi = async (matchId) => {
  const response = await apiClient.get(ENDPOINTS.MATCH.PARTNERSHIPS(matchId));
  return unwrap(response);
};

// export const resetMatchSetupApi = async (matchId) => {
//   const response = await apiClient.put(withId(ENDPOINTS.MATCH.RESET_SETUP, matchId));
//   return unwrap(response);
// };

export const getOverByOverApi = async (matchId) => {
  const response = await apiClient.get(withId(ENDPOINTS.MATCH.OVER_BY_OVER, matchId));
  return unwrap(response);
};

// ── Confirmation Gate ─────────────────────────────────────────────────────

export const requestMatchConfirmationApi = async (matchId) => {
  const response = await apiClient.put(ENDPOINTS.MATCH.REQUEST_CONFIRMATION(matchId));
  return unwrap(response);
};

export const confirmMatchApi = async (matchId) => {
  const response = await apiClient.put(ENDPOINTS.MATCH.CONFIRM(matchId));
  return unwrap(response);
};

export const rejectMatchConfirmationApi = async (matchId) => {
  const response = await apiClient.put(ENDPOINTS.MATCH.REJECT_CONFIRMATION(matchId));
  return unwrap(response);
};