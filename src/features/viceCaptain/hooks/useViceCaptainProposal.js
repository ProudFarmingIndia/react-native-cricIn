import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  proposeViceCaptain,
  getMyProposals,
  getTeamProposal,
  acceptProposal,
  rejectProposal,
  cancelProposal,
  clearProposalError,
  clearProposalSuccess,
  resetTeamProposal,
  resetProposalState,
} from "../store/viceCaptainProposalSlice";

export default function useViceCaptainProposal() {
  const dispatch = useDispatch();

  const { myProposals, teamProposal, loading, success, error } = useSelector(
    (state) => state.viceCaptainProposal,
  );

  /*
  |--------------------------------------------------------------------------
  | Propose Vice-Captain
  |--------------------------------------------------------------------------
  */

  const proposeNewViceCaptain = useCallback(
    async (teamId, playerId) => {
      const result = await dispatch(proposeViceCaptain({ teamId, playerId }));

      if (proposeViceCaptain.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }

      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  /*
  |--------------------------------------------------------------------------
  | My Proposals (Received)
  |--------------------------------------------------------------------------
  */

  const fetchMyProposals = useCallback(async () => {
    const result = await dispatch(getMyProposals());

    if (getMyProposals.fulfilled.match(result)) {
      return { success: true, data: result.payload };
    }

    return { success: false, error: result.payload };
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Team's Pending Proposal (Captain/Owner Side)
  |--------------------------------------------------------------------------
  */

  const fetchTeamProposal = useCallback(
    async (teamId) => {
      const result = await dispatch(getTeamProposal(teamId));

      if (getTeamProposal.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }

      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  /*
  |--------------------------------------------------------------------------
  | Accept / Reject / Cancel
  |--------------------------------------------------------------------------
  */

  const acceptExistingProposal = useCallback(
    async (proposalId) => {
      const result = await dispatch(acceptProposal(proposalId));

      if (acceptProposal.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }

      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const rejectExistingProposal = useCallback(
    async (proposalId) => {
      const result = await dispatch(rejectProposal(proposalId));

      if (rejectProposal.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }

      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const cancelExistingProposal = useCallback(
    async (proposalId) => {
      const result = await dispatch(cancelProposal(proposalId));

      if (cancelProposal.fulfilled.match(result)) {
        return { success: true };
      }

      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  return {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    myProposals,

    teamProposal,

    loading,

    success,

    error,

    /*
    |--------------------------------------------------------------------------
    | APIs
    |--------------------------------------------------------------------------
    */

    proposeViceCaptain: proposeNewViceCaptain,

    getMyProposals: fetchMyProposals,

    getTeamProposal: fetchTeamProposal,

    acceptProposal: acceptExistingProposal,

    rejectProposal: rejectExistingProposal,

    cancelProposal: cancelExistingProposal,

    /*
    |--------------------------------------------------------------------------
    | Local Actions
    |--------------------------------------------------------------------------
    */

    clearProposalError: useCallback(
      () => dispatch(clearProposalError()),
      [dispatch],
    ),

    clearProposalSuccess: useCallback(
      () => dispatch(clearProposalSuccess()),
      [dispatch],
    ),

    resetTeamProposal: useCallback(
      () => dispatch(resetTeamProposal()),
      [dispatch],
    ),

    resetProposalState: useCallback(
      () => dispatch(resetProposalState()),
      [dispatch],
    ),
  };
}
