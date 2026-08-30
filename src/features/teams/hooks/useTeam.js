import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  createTeam,
  updateTeam,
  deleteTeam,
  getMyTeams as getMyTeamsThunk,
  getAllTeams as getAllTeamsThunk,
  getTeamById,
  addPlayerToTeam,
  removePlayerFromTeam,
  leaveTeam,
  setCaptain,
  revokeViceCaptain,
  updateViceCaptainRights,
  updateTeamStats,
  clearTeamError,
  clearTeamSuccess,
  resetCurrentTeam,
  resetTeamState,
  createLocalPlayer,
} from "../store/teamSlice";

export default function useTeam() {
  const dispatch = useDispatch();

  const teamState = useSelector((rootState) => rootState.team);

  /*
  |--------------------------------------------------------------------------
  | Create Team
  |--------------------------------------------------------------------------
  */

  const createNewTeam = useCallback(
    async (payload) => {
      const result = await dispatch(createTeam(payload));

      if (createTeam.fulfilled.match(result)) {
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
    [dispatch],
  );

  const createLocalPlayerData = useCallback(
    async (teamId, payload) => {
      const result = await dispatch(
        createLocalPlayer({
          teamId,
          payload,
        }),
      );

      if (createLocalPlayer.fulfilled.match(result)) {
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
    [dispatch],
  );

  const updateExistingTeam = useCallback(
    async (teamId, payload) => {
      const result = await dispatch(updateTeam({ teamId, payload }));

      if (updateTeam.fulfilled.match(result)) {
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
    [dispatch],
  );

  const deleteExistingTeam = useCallback(
    async (teamId) => {
      const result = await dispatch(deleteTeam(teamId));

      if (deleteTeam.fulfilled.match(result)) {
        return { success: true };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch],
  );

  const leaveExistingTeam = useCallback(
    async (teamId) => {
      const result = await dispatch(leaveTeam(teamId));

      if (leaveTeam.fulfilled.match(result)) {
        return { success: true };
      }

      return {
        success: false,
        error: result.payload,
      };
    },
    [dispatch],
  );

  const removeExistingPlayer = useCallback(
    async (teamId, playerId) => {
      const result = await dispatch(
        removePlayerFromTeam({ teamId, playerId }),
      );

      if (removePlayerFromTeam.fulfilled.match(result)) {
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
    [dispatch],
  );

  const assignCaptain = useCallback(
    async (teamId, captainId) => {
      const result = await dispatch(setCaptain({ teamId, captainId }));

      if (setCaptain.fulfilled.match(result)) {
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
    [dispatch],
  );

  /*
  |--------------------------------------------------------------------------
  | Vice-Captain
  |--------------------------------------------------------------------------
  |
  | There is no "assign vice-captain" here on purpose - that is a proposal
  | the candidate has to accept, and it lives in
  | features/viceCaptain/services/viceCaptainProposal.service.js.
  |
  | Revoking and changing rights ARE direct writes, and ManageViceCaptainScreen
  | already destructures both of these from this hook. They were missing,
  | so both "Save Rights" and "Revoke" threw "is not a function".
  |
  */

  const revokeTeamViceCaptain = useCallback(
    async (teamId) => {
      const result = await dispatch(revokeViceCaptain(teamId));

      if (revokeViceCaptain.fulfilled.match(result)) {
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
    [dispatch],
  );

  const updateTeamViceCaptainRights = useCallback(
    async (teamId, rights) => {
      const result = await dispatch(
        updateViceCaptainRights({ teamId, rights }),
      );

      if (updateViceCaptainRights.fulfilled.match(result)) {
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
    [dispatch],
  );

  const fetchTeamById = useCallback(
    (teamId) => dispatch(getTeamById(teamId)),
    [dispatch],
  );

  const fetchMyTeams = useCallback(
    () => dispatch(getMyTeamsThunk()),
    [dispatch],
  );

  const fetchAllTeams = useCallback(
    () => dispatch(getAllTeamsThunk()),
    [dispatch],
  );

  return {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    ...teamState,

    /*
    |--------------------------------------------------------------------------
    | APIs
    |--------------------------------------------------------------------------
    */

    createTeam: createNewTeam,

    getTeamById: fetchTeamById,

    getMyTeams: fetchMyTeams,

    getAllTeams: fetchAllTeams,

    updateTeam: updateExistingTeam,

    deleteTeam: deleteExistingTeam,

    leaveTeam: leaveExistingTeam,

    addPlayerToTeam: (teamId, playerId) =>
      dispatch(
        addPlayerToTeam({
          teamId,
          playerId,
        }),
      ),

    removePlayerFromTeam: removeExistingPlayer,

    setCaptain: assignCaptain,

    revokeViceCaptain: revokeTeamViceCaptain,

    updateViceCaptainRights: updateTeamViceCaptainRights,

    updateTeamStats: (teamId) => dispatch(updateTeamStats(teamId)),

    createLocalPlayer: createLocalPlayerData,

    /*
    |--------------------------------------------------------------------------
    | Local Actions
    |--------------------------------------------------------------------------
    */

    clearTeamError: () => dispatch(clearTeamError()),

    clearTeamSuccess: () => dispatch(clearTeamSuccess()),

    resetCurrentTeam: () => dispatch(resetCurrentTeam()),

    resetTeamState: () => dispatch(resetTeamState()),
  };
}