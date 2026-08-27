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

export const searchPlayersApi = async (keyword) => {
  try {
    console.log("=================================");
    console.log("SEARCH PLAYER API");
    console.log("URL:", ENDPOINTS.SEARCH.PLAYERS);
    console.log("Keyword:", keyword);

    const response = await apiClient.get(
      ENDPOINTS.SEARCH.PLAYERS,
      {
        params: {
          q: keyword,
        },
      },
    );

    console.log("SEARCH RESPONSE");
    console.log(response.data);
    console.log("=================================");

    return unwrap(response);

  } catch (error) {

    console.log("=================================");
    console.log("SEARCH PLAYER ERROR");

    console.log("Status");
    console.log(error?.response?.status);

    console.log("Response");
    console.log(error?.response?.data);

    console.log("Message");
    console.log(error?.message);

    console.log("=================================");

    throw error;
  }
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