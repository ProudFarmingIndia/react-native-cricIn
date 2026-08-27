import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response?.data?.data ?? response?.data;

export const createInningsApi = async (payload) => {
  const response = await apiClient.post(
    ENDPOINTS.SCORING.CREATE_INNINGS,
    payload,
  );
  return unwrap(response);
};

export const getInningsByIdApi = async (inningsId) => {
  const response = await apiClient.get(
    ENDPOINTS.SCORING.GET_INNINGS(inningsId),
  );
  return unwrap(response);
};

export const endInningsApi = async (inningsId) => {
  const response = await apiClient.put(
    ENDPOINTS.SCORING.END_INNINGS(inningsId),
  );
  return unwrap(response);
};

export const addBallApi = async (payload) => {
  const serverPayload = {
    ...payload,
    // Map wicket fields to backend names
    dismissedPlayerId: payload.outBatsmanId ?? payload.dismissedPlayerId,
    nextBatsmanId: payload.newBatsmanId ?? payload.nextBatsmanId,
    // Ensure batsmanId is set as fallback for backend logic
    batsmanId: payload.outBatsmanId ?? payload.batsmanId ?? payload.dismissedPlayerId,
  };

  const response = await apiClient.post(ENDPOINTS.SCORING.ADD_BALL, serverPayload);
  return unwrap(response);
};

export const setNextBatsmanApi = async (inningsId, playerId) => {
  const response = await apiClient.put(ENDPOINTS.SCORING.SET_NEXT_BATSMAN, {
    inningsId,
    playerId,
  });
  return unwrap(response);
};

export const setNextBowlerApi = async (inningsId, playerId) => {
  const response = await apiClient.put(ENDPOINTS.SCORING.SET_NEXT_BOWLER, {
    inningsId,
    playerId,
  });
  return unwrap(response);
};

export const undoLastBallApi = async (inningsId) => {
  const response = await apiClient.delete(
    ENDPOINTS.SCORING.UNDO_BALL(inningsId),
  );
  return unwrap(response);
};

export const getInningsScorecardApi = async (inningsId) => {
  const response = await apiClient.get(ENDPOINTS.SCORING.SCORECARD(inningsId));
  return unwrap(response);
};