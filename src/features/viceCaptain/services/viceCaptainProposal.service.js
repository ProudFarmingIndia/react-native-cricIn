import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;

/*
|--------------------------------------------------------------------------
| Propose Vice-Captain
|--------------------------------------------------------------------------
*/

export const proposeViceCaptainApi = async (teamId, playerId) => {
  const response = await apiClient.post(
    ENDPOINTS.VICE_CAPTAIN_PROPOSAL.CREATE,
    { teamId, playerId },
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| My Proposals (Received)
|--------------------------------------------------------------------------
*/

export const getMyProposalsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.VICE_CAPTAIN_PROPOSAL.MY);

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Get Team's Pending Proposal (Captain/Owner Side)
|--------------------------------------------------------------------------
*/

export const getTeamProposalApi = async (teamId) => {
  const response = await apiClient.get(
    ENDPOINTS.VICE_CAPTAIN_PROPOSAL.TEAM(teamId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Accept Proposal
|--------------------------------------------------------------------------
*/

export const acceptProposalApi = async (proposalId) => {
  const response = await apiClient.put(
    ENDPOINTS.VICE_CAPTAIN_PROPOSAL.ACCEPT(proposalId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Reject Proposal
|--------------------------------------------------------------------------
*/

export const rejectProposalApi = async (proposalId) => {
  const response = await apiClient.put(
    ENDPOINTS.VICE_CAPTAIN_PROPOSAL.REJECT(proposalId),
  );

  return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Cancel Proposal
|--------------------------------------------------------------------------
*/

export const cancelProposalApi = async (proposalId) => {
  const response = await apiClient.delete(
    ENDPOINTS.VICE_CAPTAIN_PROPOSAL.CANCEL(proposalId),
  );

  return response.data;
};
