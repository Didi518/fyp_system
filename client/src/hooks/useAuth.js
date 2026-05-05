import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  login as loginThunk,
  logout as logoutThunk,
  getUser as getUserThunk,
  forgotPassword as forgotPasswordThunk,
  resetPassword as resetPasswordThunk,
  resendActivationToken as resendActivationTokenThunk,
  resendResetToken as resendResetTokenThunk,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const {
    authUser,
    isLoggingIn,
    isCheckingAuth,
    isSigningUp,
    isUpdatingProfile,
    isUpdatingPassword,
    isRequestingToken,
    isResendingActivation,
    isResendingReset,
  } = useSelector((state) => state.auth);

  const login = useCallback((data) => dispatch(loginThunk(data)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const getUser = useCallback(() => dispatch(getUserThunk()), [dispatch]);
  const forgotPassword = useCallback(
    (email) => dispatch(forgotPasswordThunk(email)),
    [dispatch],
  );
  const resetPassword = useCallback(
    (payload) => dispatch(resetPasswordThunk(payload)),
    [dispatch],
  );
  const resendActivationToken = useCallback(
    (email) => dispatch(resendActivationTokenThunk(email)),
    [dispatch],
  );
  const resendResetToken = useCallback(
    (email) => dispatch(resendResetTokenThunk(email)),
    [dispatch],
  );

  return {
    authUser,
    isLoggingIn,
    isCheckingAuth,
    isSigningUp,
    isUpdatingProfile,
    isUpdatingPassword,
    isRequestingToken,
    isResendingActivation,
    isResendingReset,

    login,
    logout,
    getUser,
    forgotPassword,
    resetPassword,
    resendActivationToken,
    resendResetToken,
  };
};
