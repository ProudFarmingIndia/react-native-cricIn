import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;

/*
| Unset filters are omitted entirely rather than sent as empty strings -
| the server treats a present-but-empty filter as "match nothing", which
| would return an empty board instead of an unfiltered one.
*/

const clean = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

export const getLeaderboardsApi = async (filters = {}) => {
  const response = await apiClient.get(ENDPOINTS.STATS.LEADERBOARDS, {
    params: clean({
      range: filters.range || "all",
      city: filters.city,
      state: filters.state,
      country: filters.country,
      ballType: filters.ballType,
      matchType: filters.matchType,
      limit: filters.limit || 10,
    }),
  });

  return unwrap(response);
};

export const getTeamRankingsApi = async (filters = {}) => {
  const response = await apiClient.get(ENDPOINTS.STATS.TEAM_RANKINGS, {
    params: clean({
      city: filters.city,
      state: filters.state,
      country: filters.country,
      teamType: filters.teamType,
      minMatches: filters.minMatches,
      limit: filters.limit || 25,
    }),
  });

  return unwrap(response);
};

export const getFilterOptionsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.STATS.FILTERS);

  return unwrap(response);
};
