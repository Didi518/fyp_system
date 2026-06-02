import { toast } from 'react-toastify';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { axiosInstance } from '../../lib/axios';

export const getNotifications = createAsyncThunk(
  'getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/notification');
      return res.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des notifications',
      );
      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la récupération des notifications',
      );
    }
  },
);

export const markAsRead = createAsyncThunk(
  'markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.put(`/notification/${id}/read`);
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la mise à jour de la notification',
      );
      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la mise à jour de la notification',
      );
    }
  },
);

export const markAllAsRead = createAsyncThunk(
  'markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.put('/notification/read-all');
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la mise à jour des notifications',
      );
      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la mise à jour des notifications',
      );
    }
  },
);

export const deleteNotification = createAsyncThunk(
  'deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notification/${id}`);
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la suppression de la notification',
      );
      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la suppression de la notification',
      );
    }
  },
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    list: [],
    unreadCount: 0,
    readCount: 0,
    highPriorityMessages: 0,
    thisWeekNotifications: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.notifications || [];
        state.readCount = action.payload.readCount ?? 0;
        state.unreadCount = action.payload.unreadCount ?? 0;
        state.highPriorityMessages = action.payload.highPriorityMessages ?? 0;
        state.thisWeekNotifications = action.payload.thisWeekNotifications ?? 0;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        const idx = state.list.findIndex((n) => n._id === id);
        if (idx !== -1) {
          if (!state.list[idx].isRead) {
            state.list[idx].isRead = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
            state.readCount = (state.readCount || 0) + 1;
          }
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        const unreadBefore = state.unreadCount;
        state.loading = false;
        state.list = state.list.map((n) => ({
          ...n,
          isRead: true,
        }));

        state.readCount += unreadBefore;
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload;
        const idx = state.list.findIndex((n) => n._id === id);
        if (idx !== -1) {
          const removed = state.list.splice(idx, 1)[0];
          if (removed && !removed.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          } else if (removed && removed.isRead) {
            state.readCount = Math.max(0, state.readCount - 1);
          }
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default notificationSlice.reducer;
