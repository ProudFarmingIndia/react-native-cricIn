import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const unwrap = (response) =>
  response.data?.data ?? response.data;

const withId = (path, id) =>
  path.replace(":id", id);

/*
|--------------------------------------------------------------------------
| Send Invitation
|--------------------------------------------------------------------------
*/

export const sendInvitationApi = async (payload) => {

    console.log("POST URL",
        ENDPOINTS.TEAM_INVITATION.CREATE);

    console.log("POST BODY", payload);

    const response =
        await apiClient.post(
            ENDPOINTS.TEAM_INVITATION.CREATE,
            payload
        );

    console.log("POST RESPONSE", response.data);

    return unwrap(response);
};

/*
|--------------------------------------------------------------------------
| Get My Invitations
|--------------------------------------------------------------------------
*/

export const getMyInvitationsApi =
  async () => {
    const response =
      await apiClient.get(
        ENDPOINTS.TEAM_INVITATION.MY
      );

    return unwrap(response);
  };

/*
|--------------------------------------------------------------------------
| Accept Invitation
|--------------------------------------------------------------------------
*/

export const acceptInvitationApi =
  async (
    invitationId
  ) => {
    const response =
      await apiClient.put(
        withId(
          ENDPOINTS.TEAM_INVITATION.ACCEPT,
          invitationId
        )
      );

    return unwrap(response);
  };

/*
|--------------------------------------------------------------------------
| Reject Invitation
|--------------------------------------------------------------------------
*/

export const rejectInvitationApi =
  async (
    invitationId
  ) => {
    const response =
      await apiClient.put(
        withId(
          ENDPOINTS.TEAM_INVITATION.REJECT,
          invitationId
        )
      );

    return unwrap(response);
  };

/*
|--------------------------------------------------------------------------
| Cancel Invitation
|--------------------------------------------------------------------------
*/

export const cancelInvitationApi =
  async (
    invitationId
  ) => {
    const response =
      await apiClient.delete(
        withId(
          ENDPOINTS.TEAM_INVITATION.DELETE,
          invitationId
        )
      );

    return response.data;
  };