import apiClient from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../services/api/endpoints";

const unwrap = (response) => response.data?.data ?? response.data;

// ── Notifications ─────────────────────────────────────────────────────────

export const getNotificationsApi = async () => {
  const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST);
  return unwrap(response);
};

export const getUnreadCountApi = async () => {
  const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  return unwrap(response);
};

export const markNotificationAsReadApi = async (notificationId) => {
  const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.READ(notificationId));
  return unwrap(response);
};

export const markAllNotificationsAsReadApi = async () => {
  const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.READ_ALL);
  return unwrap(response);
};

export const deleteNotificationApi = async (notificationId) => {
  const response = await apiClient.delete(ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
  return unwrap(response);
};

/*
| Bulk counterparts for the multi-select on the notification screen. One
| request per selection instead of one per row.
*/

export const markManyAsReadApi = async (ids) => {
  const response = await apiClient.put(ENDPOINTS.NOTIFICATIONS.READ_MANY, {
    ids,
  });
  return unwrap(response);
};

export const deleteManyApi = async (ids) => {
  const response = await apiClient.delete(ENDPOINTS.NOTIFICATIONS.DELETE_MANY, {
    data: { ids },
  });
  return unwrap(response);
};

// ── Team Invitations ──────────────────────────────────────────────────────

export const acceptInvitationApi = async (invitationId) => {
  const response = await apiClient.put(ENDPOINTS.TEAM_INVITATION.ACCEPT(invitationId));
  return unwrap(response);
};

export const rejectInvitationApi = async (invitationId) => {
  const response = await apiClient.put(ENDPOINTS.TEAM_INVITATION.REJECT(invitationId));
  return unwrap(response);
};

// ── Vice-Captain Proposals ────────────────────────────────────────────────

export const acceptViceCaptainProposalApi = async (proposalId) => {
  const response = await apiClient.put(ENDPOINTS.VICE_CAPTAIN_PROPOSAL.ACCEPT(proposalId));
  return unwrap(response);
};

export const rejectViceCaptainProposalApi = async (proposalId) => {
  const response = await apiClient.put(ENDPOINTS.VICE_CAPTAIN_PROPOSAL.REJECT(proposalId));
  return unwrap(response);
};

// ── Match Challenges (Batch 6) ────────────────────────────────────────────

export const acceptChallengeNotifApi = async (challengeId) => {
  const response = await apiClient.put(ENDPOINTS.MATCH_CHALLENGE.ACCEPT(challengeId));
  return unwrap(response);
};

export const rejectChallengeNotifApi = async (challengeId, reason) => {
  const response = await apiClient.put(ENDPOINTS.MATCH_CHALLENGE.REJECT(challengeId), {
    reason: reason || "Other",
  });
  return unwrap(response);
};

// ── Match Confirmation (Batch 6) ──────────────────────────────────────────

export const confirmMatchNotifApi = async (matchId) => {
  const response = await apiClient.put(ENDPOINTS.MATCH.CONFIRM(matchId));
  return unwrap(response);
};

export const rejectMatchConfirmationNotifApi = async (matchId) => {
  const response = await apiClient.put(ENDPOINTS.MATCH.REJECT_CONFIRMATION(matchId));
  return unwrap(response);
};