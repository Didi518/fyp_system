import { toast } from 'react-toastify';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { axiosInstance } from '../../lib/axios';

export const createUser = createAsyncThunk(
  'createUser',
  async (payload, thunkAPI) => {
    try {
      const { role, ...data } = payload;
      const response = await axiosInstance.post(`/admin/create-user`, {
        role,
        ...data,
      });
      toast.success(response.data.message || `Utilisateur créé! (${role})`);

      return response.data.data.user;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur",
      );

      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur",
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  'updateUser',
  async (payload, thunkAPI) => {
    try {
      const { id, ...updateData } = payload;
      const response = await axiosInstance.put(
        `/admin/update-user/${id}`,
        updateData,
      );
      toast.success(response.data.message || `Utilisateur mis à jour!`);

      return response.data.data.user;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de l'utilisateur",
      );

      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de l'utilisateur",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  'deleteUser',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/admin/delete-user/${id}`);
      toast.success(response.data.message || `Utilisateur supprimé!`);

      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur",
      );

      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur",
      );
    }
  },
);

export const getAllUsers = createAsyncThunk(
  'getAllUsers',
  async (params, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/admin/users', { params });

      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des utilisateurs',
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la récupération des utilisateurs',
      );
    }
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    students: [],
    teachers: [],
    projects: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
