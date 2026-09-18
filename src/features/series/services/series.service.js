/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Series
|
| File:
| series.service.js
|
| Description:
| Every call the series feature makes. Same shape as the tournament
| service - thin wrappers that unwrap { success, data } and let the caller
| handle errors.
|
|--------------------------------------------------------------------------
*/

import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| Setup data
|--------------------------------------------------------------------------
|
| Series lengths and the award catalogue come from the server. The awards
| are the SAME catalogue the tournament serves, so "Most Sixes" cannot
| come to mean two different things in two parts of the app.
*/

export const getSeriesOptionsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.SERIES.OPTIONS);

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Reads
|--------------------------------------------------------------------------
*/

export const getSeriesListApi = async (filter = "upcoming") => {
  const response = await apiClient.get(ENDPOINTS.SERIES.LIST, {
    params: { filter },
  });

  return unwrap(response);
};

export const getSeriesApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.SERIES.DETAILS(id));

  return unwrap(response);
};

export const getSeriesFixturesApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.SERIES.FIXTURES(id));

  return unwrap(response);
};

/*
| "2-1" plus everything needed to draw it - both teams, drawn matches, how
| many are left, and whether one side is already beyond reach.
*/

export const getScorelineApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.SERIES.SCORELINE(id));

  return unwrap(response);
};

export const getSeriesStatsApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.SERIES.STATS(id));

  return unwrap(response);
};

export const getSeriesAwardsApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.SERIES.AWARDS(id));

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Organizer
|--------------------------------------------------------------------------
*/

export const createSeriesApi = async (payload) => {
  const response = await apiClient.post(ENDPOINTS.SERIES.CREATE, payload);

  return unwrap(response);
};

export const updateSeriesApi = async (id, payload) => {
  const response = await apiClient.put(ENDPOINTS.SERIES.DETAILS(id), payload);

  return unwrap(response);
};

export const deleteSeriesApi = async (id) => {
  const response = await apiClient.delete(ENDPOINTS.SERIES.DETAILS(id));

  return unwrap(response);
};

export const setSeriesVisibilityApi = async (id, isPublished) => {
  const response = await apiClient.put(ENDPOINTS.SERIES.VISIBILITY(id), {
    isPublished,
  });

  return unwrap(response);
};

/*
| One invite, to the opponent team's captain. Re-inviting after a decline
| is how you change your mind about an opponent; re-inviting the same team
| while they have not answered is refused by the server, because that is a
| nag rather than an invite.
*/

export const inviteOpponentApi = async (id, teamId) => {
  const response = await apiClient.post(ENDPOINTS.SERIES.INVITE(id), { teamId });

  return unwrap(response);
};

export const generateSeriesFixturesApi = async (id) => {
  const response = await apiClient.post(ENDPOINTS.SERIES.GENERATE(id));

  return unwrap(response);
};

export const updateSeriesFixtureApi = async (id, matchId, payload) => {
  const response = await apiClient.put(
    ENDPOINTS.SERIES.EDIT_FIXTURE(id, matchId),
    payload,
  );

  return unwrap(response);
};

/*
| Hand one match's scoring to somebody else. `userId: null` takes it back
| to the organizer. A single field write on the server, so the previous
| holder's rights end in the same operation - there is never a moment when
| two people can both score.
*/

export const assignSeriesScorerApi = async (id, matchId, userId) => {
  const response = await apiClient.put(
    ENDPOINTS.SERIES.ASSIGN_SCORER(id, matchId),
    { userId },
  );

  return unwrap(response);
};

export const setSeriesAwardWinnerApi = async (id, metric, playerId) => {
  const response = await apiClient.put(
    ENDPOINTS.SERIES.AWARD_WINNER(id, metric),
    { playerId },
  );

  return unwrap(response);
};

export const cancelSeriesApi = async (id) => {
  const response = await apiClient.put(ENDPOINTS.SERIES.CANCEL(id));

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Opponent captain
|--------------------------------------------------------------------------
*/

export const respondToSeriesInviteApi = async (id, accept) => {
  const response = await apiClient.put(ENDPOINTS.SERIES.RESPOND(id), { accept });

  return unwrap(response);
};
