/*
|--------------------------------------------------------------------------
| Invitation State
|--------------------------------------------------------------------------
*/

export const selectInvitationState = (state) =>
  state.invitation;

/*
|--------------------------------------------------------------------------
| Invitations
|--------------------------------------------------------------------------
*/

export const selectInvitations = (state) =>
  state.invitation.invitations;

/*
|--------------------------------------------------------------------------
| Current Invitation
|--------------------------------------------------------------------------
*/

export const selectCurrentInvitation = (state) =>
  state.invitation.currentInvitation;

/*
|--------------------------------------------------------------------------
| Loading
|--------------------------------------------------------------------------
*/

export const selectInvitationLoading = (state) =>
  state.invitation.loading;

/*
|--------------------------------------------------------------------------
| Success
|--------------------------------------------------------------------------
*/

export const selectInvitationSuccess = (state) =>
  state.invitation.success;

/*
|--------------------------------------------------------------------------
| Error
|--------------------------------------------------------------------------
*/

export const selectInvitationError = (state) =>
  state.invitation.error;