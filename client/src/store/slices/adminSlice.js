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

export const getAllProjects = createAsyncThunk(
  'getAllProjects',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/admin/projects');

      return response.data.data.projects;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des projets',
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la récupération des projets',
      );
    }
  },
);

export const getDashboardStats = createAsyncThunk(
  'getDashboardStats',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/admin/fetch-dashboard-stats');

      return response.data.data.stats;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des stats admin',
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la récupération des stats admin',
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
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      results: 0,
    },
    stats: null,
    loadingUsers: false,
    loadingProjects: false,
    loadingStats: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })
      .addCase(getAllProjects.pending, (state) => {
        state.loadingProjects = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loadingProjects = false;
        state.projects = action.payload;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loadingProjects = false;
        state.error = action.payload;
      })
      .addCase(getDashboardStats.pending, (state) => {
        state.loadingStats = true;
        state.stats = null;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loadingStats = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
