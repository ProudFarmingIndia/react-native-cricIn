import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  sendOtp,
  verifyOtp,
  logout,
  clearError,
} from '../store/authSlice';

import {
  selectAuth,
} from '../store/authSelectors';

export default function useAuth() {
  const dispatch =
    useDispatch();

  const auth =
    useSelector(selectAuth);

  return {
    ...auth,

    sendOTP: mobile =>
      dispatch(
        sendOtp(mobile),
      ),

    verifyOTP: (
      mobile,
      otp,
    ) =>
      dispatch(
        verifyOtp({
          mobile,
          otp,
        }),
      ),

    logoutUser: () =>
      dispatch(
        logout(),
      ),

    clearAuthError: () =>
      dispatch(
        clearError(),
      ),
  };
}