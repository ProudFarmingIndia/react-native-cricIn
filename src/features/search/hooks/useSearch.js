import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  searchPlayers,
  searchPlayerByMobile,
  searchTeams,
  searchGrounds,
  searchTournaments,
  globalSearch,
  clearSearchError,
  clearSearchSuccess,
  clearSearchResults,
  resetSearchState,
} from "../store/searchSlice";

export default function useSearch() {
  const dispatch = useDispatch();

  const {
    players,
    teams,
    grounds,
    tournaments,
    globalResults,
    loading,
    success,
    error,
  } = useSelector((state) => state.search);

  /*
  |--------------------------------------------------------------------------
  | Search Players
  |--------------------------------------------------------------------------
  */

  const searchPlayersData = useCallback(
    async (keyword) => {
      const result = await dispatch(searchPlayers(keyword));

      if (searchPlayers.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch]
  );

  /*
  |--------------------------------------------------------------------------
  | Search Teams
  |--------------------------------------------------------------------------
  */

  const searchTeamsData = useCallback(
    async (keyword) => {
      const result = await dispatch(searchTeams(keyword));

      if (searchTeams.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch]
  );

  /*
  |--------------------------------------------------------------------------
  | Search Grounds
  |--------------------------------------------------------------------------
  */

  const searchGroundsData = useCallback(
    async (keyword) => {
      const result = await dispatch(searchGrounds(keyword));

      if (searchGrounds.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch]
  );

  /*
  |--------------------------------------------------------------------------
  | Search Tournaments
  |--------------------------------------------------------------------------
  */

  const searchTournamentsData = useCallback(
    async (keyword) => {
      const result = await dispatch(searchTournaments(keyword));

      if (searchTournaments.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch]
  );

  /*
|--------------------------------------------------------------------------
| Search Player By Mobile
|--------------------------------------------------------------------------
*/

  const searchPlayerByMobileData = useCallback(
    async (mobile) => {
      const result = await dispatch(searchPlayerByMobile(mobile));

      if (searchPlayerByMobile.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch]
  );

  /*
  |--------------------------------------------------------------------------
  | Global Search
  |--------------------------------------------------------------------------
  */

  const searchGlobalData = useCallback(
    async (keyword) => {
      const result = await dispatch(globalSearch(keyword));

      if (globalSearch.fulfilled.match(result)) {
        return {
          success: true,
          data: result.payload,
        };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch]
  );

  return {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    players,

    teams,

    grounds,

    tournaments,

    globalResults,

    loading,

    success,

    error,

    /*
    |--------------------------------------------------------------------------
    | APIs
    |--------------------------------------------------------------------------
    */

    searchPlayers: searchPlayersData,

    searchTeams: searchTeamsData,

    searchGrounds: searchGroundsData,

    searchTournaments: searchTournamentsData,

    globalSearch: searchGlobalData,

    searchPlayerByMobile: searchPlayerByMobileData,

    /*
    |--------------------------------------------------------------------------
    | Local Actions
    |--------------------------------------------------------------------------
    */

    clearSearchError: useCallback(
      () => dispatch(clearSearchError()),
      [dispatch]
    ),

    clearSearchSuccess: useCallback(
      () => dispatch(clearSearchSuccess()),
      [dispatch]
    ),

    clearSearchResults: useCallback(
      () => dispatch(clearSearchResults()),
      [dispatch]
    ),

    resetSearchState: useCallback(
      () => dispatch(resetSearchState()),
      [dispatch]
    ),
  };
}
