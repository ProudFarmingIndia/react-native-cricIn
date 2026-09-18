import { useDispatch, useSelector } from "react-redux";

import { sendOtp, verifyOtp, logout, clearError } from "../store/authSlice";

import { selectAuth } from "../store/authSelectors";

/*
|--------------------------------------------------------------------------
| useAuth
|--------------------------------------------------------------------------
|
| Both OTP calls now carry a country alongside the number.
|
| The country defaults to "IN" at every level - here, in the thunk, in the
| API layer and on the server - so an older screen calling sendOTP(phone)
| with no second argument behaves exactly as it always did. That is
| deliberate: a signature change that silently breaks one forgotten caller
| is how a login flow ends up half-migrated.
|
*/

export default function useAuth() {
  const dispatch = useDispatch();

  const auth = useSelector(selectAuth);

  return {
    ...auth,

    sendOTP: (mobile, countryCode = "IN") =>
      dispatch(sendOtp({ phone: mobile, countryCode })),

    verifyOTP: (mobile, otp, countryCode = "IN") =>
      dispatch(verifyOtp({ phone: mobile, otp, countryCode })),

    logoutUser: () => dispatch(logout()),

    clearAuthError: () => dispatch(clearError()),
  };
}
