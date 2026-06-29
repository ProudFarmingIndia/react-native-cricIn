import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

// GET /api/players/me
export const getProfileApi = () => {
  return apiClient.get(ENDPOINTS.PLAYER.ME);
};

// PUT /api/players/me
export const updateProfileApi = (payload) => {
  return apiClient.put(ENDPOINTS.PLAYER.UPDATE, payload);
};

// POST /api/players  — only called once to create the player profile
export const createPlayerProfileApi = (payload) => {
  return apiClient.post(ENDPOINTS.PLAYER.CREATE, payload);
};