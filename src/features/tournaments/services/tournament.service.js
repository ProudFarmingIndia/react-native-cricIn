/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| tournament.service.js
|
| Description:
| Every call the tournament feature makes. Same shape as
| matches.services.js - thin wrappers that unwrap { success, data } and
| let the caller handle errors.
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
| Formats, playoff shapes with their guidance copy, squad limits and
| default points all come from the server rather than being hardcoded here.
| A new playoff shape then appears in the picker without an app release,
| and the copy explaining each one lives next to the code implementing it.
|
*/

export const getTournamentOptionsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.OPTIONS);

  return unwrap(response);
};

/*
| "8 teams, League + Knockout" -> "28 matches over 7 rounds". Pure
| arithmetic on the server, no database, so it is safe to call while the
| organizer is still tapping the stepper.
*/

export const previewFixturesApi = async (format, teams, playoffShape) => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.PREVIEW, {
    params: { format, teams, playoffShape },
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Reads
|--------------------------------------------------------------------------
*/

export const getTournamentsApi = async (filter = "upcoming") => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.LIST, {
    params: { filter },
  });

  return unwrap(response);
};

export const getTournamentApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.DETAILS(id));

  return unwrap(response);
};

export const getFixturesApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.FIXTURES(id));

  return unwrap(response);
};

export const getPointsTableApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.POINTS_TABLE(id));

  return unwrap(response);
};

export const getTournamentStatsApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.STATS(id));

  return unwrap(response);
};

/*
| Awards plus every leaderboard behind them.
|
| One call rather than one per award: the countable awards are all decided
| by boards built from the same deliveries, so the server counts once and
| the screen renders the winner, the runners-up and the full standings
| from a single response.
*/

export const getAwardsApi = async (id) => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.AWARDS(id));

  return unwrap(response);
};

/*
| Organizer picks a winner. `playerId: null` hands the award back to the
| counter, which is the way out of a wrong override - deleting the award
| and re-adding it would lose the amount and the label.
*/

export const setAwardWinnerApi = async (id, metric, playerId) => {
  const response = await apiClient.put(
    ENDPOINTS.TOURNAMENT.AWARD_WINNER(id, metric),
    { playerId },
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Organizer
|--------------------------------------------------------------------------
*/

export const createTournamentApi = async (payload) => {
  const response = await apiClient.post(ENDPOINTS.TOURNAMENT.CREATE, payload);

  return unwrap(response);
};

export const updateTournamentApi = async (id, payload) => {
  const response = await apiClient.put(ENDPOINTS.TOURNAMENT.DETAILS(id), payload);

  return unwrap(response);
};

export const deleteTournamentApi = async (id) => {
  const response = await apiClient.delete(ENDPOINTS.TOURNAMENT.DETAILS(id));

  return unwrap(response);
};

export const setVisibilityApi = async (id, payload) => {
  const response = await apiClient.put(ENDPOINTS.TOURNAMENT.VISIBILITY(id), payload);

  return unwrap(response);
};

export const inviteTeamApi = async (id, teamId) => {
  const response = await apiClient.post(ENDPOINTS.TOURNAMENT.INVITE(id), { teamId });

  return unwrap(response);
};

export const cancelInviteApi = async (id, teamId) => {
  const response = await apiClient.delete(
    ENDPOINTS.TOURNAMENT.CANCEL_INVITE(id, teamId),
  );

  return unwrap(response);
};

export const removeTeamApi = async (id, teamId) => {
  const response = await apiClient.delete(
    ENDPOINTS.TOURNAMENT.REMOVE_TEAM(id, teamId),
  );

  return unwrap(response);
};

export const respondJoinRequestApi = async (id, teamId, approve) => {
  const response = await apiClient.put(
    ENDPOINTS.TOURNAMENT.RESPOND_JOIN_REQUEST(id),
    { teamId, approve },
  );

  return unwrap(response);
};

/*
| Locks the field and builds the whole schedule. Not reversible - the
| screen confirms before calling it.
*/

export const generateFixturesApi = async (id) => {
  const response = await apiClient.post(ENDPOINTS.TOURNAMENT.GENERATE(id));

  return unwrap(response);
};

export const updateFixtureApi = async (id, matchId, payload) => {
  const response = await apiClient.put(
    ENDPOINTS.TOURNAMENT.EDIT_FIXTURE(id, matchId),
    payload,
  );

  return unwrap(response);
};

/*
| Hand one match's scoring to somebody else. Passing null takes it back to
| the organizer. The server writes a single field, so the previous holder's
| rights end in the same operation - there is never a moment when two
| people can both score.
*/

export const assignMatchScorerApi = async (id, matchId, userId) => {
  const response = await apiClient.put(
    ENDPOINTS.TOURNAMENT.ASSIGN_SCORER(id, matchId),
    { userId },
  );

  return unwrap(response);
};

export const cancelTournamentApi = async (id) => {
  const response = await apiClient.put(ENDPOINTS.TOURNAMENT.CANCEL(id));

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Captain
|--------------------------------------------------------------------------
*/

export const respondToTournamentInviteApi = async (id, teamId, accept) => {
  const response = await apiClient.put(ENDPOINTS.TOURNAMENT.RESPOND(id), {
    teamId,
    accept,
  });

  return unwrap(response);
};

export const requestToJoinApi = async (id, teamId) => {
  const response = await apiClient.post(ENDPOINTS.TOURNAMENT.JOIN_REQUEST(id), {
    teamId,
  });

  return unwrap(response);
};

/*
| The whole team roster plus whichever players are already registered, in
| one response. The squad screen has to draw both lists and they must agree
| with each other, which two separate requests cannot guarantee.
*/

export const getSquadApi = async (id, teamId) => {
  const response = await apiClient.get(ENDPOINTS.TOURNAMENT.SQUAD(id, teamId));

  return unwrap(response);
};

/*
| `final: false` saves a half-filled squad so the captain can come back to
| it; `final: true` is the submission, and only then is the 15-player
| minimum enforced.
*/

export const setSquadApi = async (id, teamId, playerIds, final = false) => {
  const response = await apiClient.put(ENDPOINTS.TOURNAMENT.SQUAD(id, teamId), {
    playerIds,
    final,
  });

  return unwrap(response);
};

export const withdrawTeamApi = async (id, teamId) => {
  const response = await apiClient.put(ENDPOINTS.TOURNAMENT.WITHDRAW(id, teamId));

  return unwrap(response);
};
