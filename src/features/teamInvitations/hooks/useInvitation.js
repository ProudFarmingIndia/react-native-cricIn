import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  clearInvitationError,
  clearInvitationSuccess,
  resetCurrentInvitation,
  resetInvitationState,
} from "../store/invitationSlice";

export default function useInvitation() {
  const dispatch = useDispatch();

  const { invitations, currentInvitation, loading, success, error } =
    useSelector((state) => state.invitation);

  /*
  |--------------------------------------------------------------------------
  | Send Invitation
  |--------------------------------------------------------------------------
  */

  const fetchMyInvitations = useCallback(async () => {
    const result = await dispatch(getMyInvitations());

    if (getMyInvitations.fulfilled.match(result)) {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: result.payload,
    };
  }, [dispatch]);

  const sendNewInvitation = useCallback(async (payload) => {
    const result = await dispatch(sendInvitation(payload));

    if (sendInvitation.fulfilled.match(result)) {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: result.payload,
    };
  }, [dispatch]);

  return {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    invitations,

    currentInvitation,

    loading,

    success,

    error,

    /*
    |--------------------------------------------------------------------------
    | APIs
    |--------------------------------------------------------------------------
    */

    sendInvitation: sendNewInvitation,

    getMyInvitations: fetchMyInvitations,

    acceptInvitation: useCallback(
      (invitationId) => dispatch(acceptInvitation(invitationId)),
      [dispatch]
    ),

    rejectInvitation: useCallback(
      (invitationId) => dispatch(rejectInvitation(invitationId)),
      [dispatch]
    ),

    cancelInvitation: useCallback(
      (invitationId) => dispatch(cancelInvitation(invitationId)),
      [dispatch]
    ),

    /*
    |--------------------------------------------------------------------------
    | Local Actions
    |--------------------------------------------------------------------------
    */

    clearInvitationError: useCallback(
      () => dispatch(clearInvitationError()),
      [dispatch]
    ),

    clearInvitationSuccess: useCallback(
      () => dispatch(clearInvitationSuccess()),
      [dispatch]
    ),

    resetCurrentInvitation: useCallback(
      () => dispatch(resetCurrentInvitation()),
      [dispatch]
    ),

    resetInvitationState: useCallback(
      () => dispatch(resetInvitationState()),
      [dispatch]
    ),
  };
}
