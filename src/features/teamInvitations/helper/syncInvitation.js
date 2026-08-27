export const syncInvitation = (
  state,
  updatedInvitation
) => {
  if (!updatedInvitation) return;

  state.currentInvitation =
    updatedInvitation;

  state.invitations =
    state.invitations.map(
      (invitation) =>
        invitation._id ===
        updatedInvitation._id
          ? updatedInvitation
          : invitation
    );
};