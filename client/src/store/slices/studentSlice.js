import { toast } from 'react-toastify';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { axiosInstance } from '../../lib/axios';

export const submitProjectProposal = createAsyncThunk(
  'student/submitProjectProposal',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/student/project-proposal', data);

      toast.success(res.data.message || 'Projet soumis avec succès!');
      return res.data.data.project;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la soumission du projet',
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la soumission du projet',
      );
    }
  },
);

export const fetchProject = createAsyncThunk(
  'student/fetchProject',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/student/project');

      return res.data.data.project ?? null;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Erreur de la récupération du  projet',
      );

      return rejectWithValue(
        error.response?.data?.message || 'Erreur de la récupération du  projet',
      );
    }
  },
);

export const getSupervisor = createAsyncThunk(
  'student/getSupervisor',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/student/supervisor');

      return res.data.data.supervisor ?? null;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur de la récupération du superviseur',
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur de la récupération du superviseur',
      );
    }
  },
);

export const fetchSupervisors = createAsyncThunk(
  'student/fetchSupervisors',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/student/fetch-supervisors');

      return res.data.data.supervisors ?? [];
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des superviseurs',
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la récupération des superviseurs',
      );
    }
  },
);

export const requestSupervisor = createAsyncThunk(
  'student/requestSupervisor',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/student/request-supervisor', data);
      dispatch(getSupervisor());

      toast.success(res.data.message || 'Demande de supervision envoyée!');
      return res.data.data.request;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la demande de supervision',
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la demande de supervision',
      );
    }
  },
);

export const uploadFiles = createAsyncThunk(
  'student/uploadFiles',
  async ({ projectId, files }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      for (const file of files) form.append('files', file);
      const res = await axiosInstance.post(
        `/student/upload/${projectId}`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      toast.success(res.data.message || 'Fichiers téléchargés!');

      return res.data.data.project;
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Echec du téléchargement des fichiers',
      );

      return rejectWithValue(
        error.response?.data?.message || 'Echec du téléchargement des fichiers',
      );
    }
  },
);

export const fetchDashboardStats = createAsyncThunk(
  'fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/student/fetch-dashboard-stats');

      return res.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des statistiques',
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la récupération des statistiques',
      );
    }
  },
);

export const getFeedback = createAsyncThunk(
  'getFeedback',
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/student/feedback/${projectId}`);

      return res.data.data?.feedback;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors de la récupération des feedbacks',
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors de la récupération des feedbacks',
      );
    }
  },
);

export const downloadFile = createAsyncThunk(
  'downloadFile',
  async ({ projectId, fileId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/student/download/${projectId}/${fileId}`,
        {
          responseType: 'blob',
        },
      );

      const contentDisposition = res.headers['content-disposition'];
      let fileName = 'download';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) fileName = match[1];
      }

      const url = window.URL.createObjectURL(res.data);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erreur lors du téléchargement du fichier',
      );

      return rejectWithValue(
        error.response?.data?.message ||
          'Erreur lors du téléchargement du fichier',
      );
    }
  },
);

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: null,
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: {
      project: 'idle',
      supervisor: 'idle',
      supervisors: 'idle',
      request: 'idle',
      uploadFiles: 'idle',
      fetchDashboardStats: 'idle',
      feedback: 'idle',
      downloadFile: 'idle',
    },
    error: {
      project: null,
      supervisor: null,
      supervisors: null,
      request: null,
      uploadFiles: null,
      fetchDashboardStats: null,
      feedback: null,
      downloadFile: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProject.pending, (state) => {
        state.status.project = 'loading';
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.status.project = 'succeeded';
        state.project = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.status.project = 'failed';
        state.error.project = action.payload;
      })
      .addCase(submitProjectProposal.fulfilled, (state, action) => {
        state.project = action.payload;
      })
      .addCase(getSupervisor.pending, (state) => {
        state.status.supervisor = 'loading';
      })
      .addCase(getSupervisor.fulfilled, (state, action) => {
        state.status.supervisor = 'succeeded';
        state.supervisor = action.payload;
      })
      .addCase(getSupervisor.rejected, (state, action) => {
        state.status.supervisor = 'failed';
        state.error.supervisor = action.payload;
      })
      .addCase(fetchSupervisors.pending, (state) => {
        state.status.supervisors = 'loading';
      })
      .addCase(fetchSupervisors.fulfilled, (state, action) => {
        state.status.supervisors = 'succeeded';
        state.supervisors = action.payload;
      })
      .addCase(fetchSupervisors.rejected, (state, action) => {
        state.status.supervisors = 'failed';
        state.error.supervisors = action.payload;
      })
      .addCase(requestSupervisor.pending, (state) => {
        state.status.request = 'loading';
      })
      .addCase(requestSupervisor.fulfilled, (state) => {
        state.status.request = 'succeeded';
      })
      .addCase(requestSupervisor.rejected, (state, action) => {
        state.status.request = 'failed';
        state.error.request = action.payload;
      })
      .addCase(uploadFiles.pending, (state) => {
        state.status.uploadFiles = 'loading';
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.status.uploadFiles = 'succeeded';
        const uploadedFiles = action.payload?.files || [];
        state.files = uploadedFiles;
        state.project = action.payload;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.status.uploadFiles = 'failed';
        state.error.uploadFiles = action.payload;
      })
      .addCase(getFeedback.pending, (state) => {
        state.status.feedback = 'loading';
      })
      .addCase(getFeedback.fulfilled, (state, action) => {
        state.status.feedback = 'succeeded';
        state.feedback = action.payload || [];
      })
      .addCase(getFeedback.rejected, (state, action) => {
        state.status.feedback = 'failed';
        state.error.feedback = action.payload;
      })
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status.fetchDashboardStats = 'loading';
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status.fetchDashboardStats = 'succeeded';
        state.dashboardStats = action.payload || null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status.fetchDashboardStats = 'failed';
        state.error.fetchDashboardStats = action.payload;
      });
  },
});

export default studentSlice.reducer;
