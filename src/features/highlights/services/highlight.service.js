import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| Highlights
|--------------------------------------------------------------------------
|
| Moments are computed on the server from ball-by-ball data, so there is
| nothing to cache or invalidate here - a fresh request always reflects
| whatever has been scored since.
|
*/

export const getHighlightsApi = async ({
  range = "week",
  city,
  state,
  country,
  limit = 10,
} = {}) => {
  const response = await apiClient.get(ENDPOINTS.HIGHLIGHTS.LIST, {
    params: {
      range,

      // Left off entirely when unset, so the server sees no filter at all
      // rather than an empty string it has to treat as "match nothing".
      ...(city ? { city } : {}),
      ...(state ? { state } : {}),
      ...(country ? { country } : {}),

      limit,
    },
  });

  return unwrap(response);
};

export const getMatchHighlightsApi = async (matchId, limit = 20) => {
  const response = await apiClient.get(
    ENDPOINTS.HIGHLIGHTS.FOR_MATCH(matchId),
    { params: { limit } },
  );

  return unwrap(response);
};
