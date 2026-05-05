import { toast } from 'react-toastify';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { axiosInstance } from '../../lib/axios';

export const login = createAsyncThunk('login', async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post('/auth/login', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    toast.success(res.data.message || 'Connexion réussie');
    return res.data.user;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        'Une erreur est survenue lors de la connexion',
    );
    return thunkAPI.rejectWithValue(
      error.response?.data.message || 'Echec de la connexion',
    );
  }
});

export const forgotPassword = createAsyncThunk(
  'auth/password/forgot',
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        '/auth/password/forgot',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      toast.success(
        res.data.message || 'Lien envoyé sur votre boite de réception',
      );
      return null;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Une erreur est survenue lors de l'envoi du lien",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Echec de l'envoi du lien",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/password/reset',
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/auth/password/reset/${token}`,
        {
          password,
          confirmPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      toast.success(
        res.data.message || 'Le mot de passe a bien été réinitialisé',
      );
      return res.data.user;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Echec lors de la réinitialisation du mot de passe',
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message ||
          'Echec de la réinitialisation du mot de passe',
      );
    }
  },
);

export const resendActivationToken = createAsyncThunk(
  'auth/activation/resend-token',
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        '/auth/activation/resend-token',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      toast.success(res.data.message || "Lien d'activation renvoyé");
      return null;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du renvoi du lien d'activation",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message ||
          "Erreur lors du renvoi du lien d'activation",
      );
    }
  },
);

export const resendResetToken = createAsyncThunk(
  'auth/password/resend-token',
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        '/auth/password/resend-token',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      toast.success(res.data.message || 'Lien de réinitialisation renvoyé');
      return null;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Erreur lors du renvoi du lien',
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || 'Erreur lors du renvoi du lien',
      );
    }
  },
);

export const getUser = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get(`/auth/me`);
    return res.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      return thunkAPI.fulfillWithValue(null);
    }
    return thunkAPI.rejectWithValue(
      error.response?.data.message ||
        "Echec de la récupération de l'utilisateur",
    );
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await axiosInstance.get(`/auth/logout`);
    return null;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Echec de la déconnexion');

    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Echec de la déconnexion',
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingToken: false,
    isResendingActivation: false,
    isResendingReset: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload || null;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingToken = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        if (action.payload) {
          state.authUser = action.payload;
        }
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      })
      .addCase(resendActivationToken.pending, (state) => {
        state.isResendingActivation = true;
      })
      .addCase(resendActivationToken.fulfilled, (state) => {
        state.isResendingActivation = false;
      })
      .addCase(resendActivationToken.rejected, (state) => {
        state.isResendingActivation = false;
      })
      .addCase(resendResetToken.pending, (state) => {
        state.isResendingReset = true;
      })
      .addCase(resendResetToken.fulfilled, (state) => {
        state.isResendingReset = false;
      })
      .addCase(resendResetToken.rejected, (state) => {
        state.isResendingReset = false;
      });
  },
});

export default authSlice.reducer;
