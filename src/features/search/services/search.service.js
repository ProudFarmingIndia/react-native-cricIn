import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const unwrap = (response) => response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| Search Players
|--------------------------------------------------------------------------
*/

/*
| The debug block that used to live here logged the full response of every
| keystroke's search - names, phone numbers and profile URLs - to the
| console on every device the app runs on. The thunk already turns a
| rejection into a user-facing message, so nothing was lost by removing it.
*/

export const searchPlayersApi = async (keyword) => {
  const response = await apiClient.get(ENDPOINTS.SEARCH.PLAYERS, {
    params: {
      q: keyword,
    },
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Search Teams
|--------------------------------------------------------------------------
*/

export const searchTeamsApi = async (keyword) => {
  const response = await apiClient.get(ENDPOINTS.SEARCH.TEAMS, {
    params: {
      q: keyword,
    },
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Search Grounds
|--------------------------------------------------------------------------
*/

export const searchGroundsApi = async (keyword) => {
  const response = await apiClient.get(ENDPOINTS.SEARCH.GROUNDS, {
    params: {
      q: keyword,
    },
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Search Tournaments
|--------------------------------------------------------------------------
*/

export const searchTournamentsApi = async (keyword) => {
  const response = await apiClient.get(ENDPOINTS.SEARCH.TOURNAMENTS, {
    params: {
      q: keyword,
    },
  });

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Global Search
|--------------------------------------------------------------------------
*/

export const globalSearchApi = async (keyword) => {
  const response = await apiClient.get(ENDPOINTS.SEARCH.GLOBAL, {
    params: {
      q: keyword,
    },
  });

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| Search Player By Mobile
|--------------------------------------------------------------------------
*/

export const searchPlayerByMobileApi = async (mobile) => {
  const response = await apiClient.get(
    ENDPOINTS.SEARCH.PLAYER_BY_MOBILE,
    {
      params: {
        mobile,
      },
    },
  );

  return unwrap(response);
};