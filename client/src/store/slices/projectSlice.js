import { toast } from 'react-toastify';
import { axiosInstance } from '../../lib/axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const downloadProjectFile = createAsyncThunk(
  'project/downloadProjectFile',
  async ({ projectId, fileId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/project/${projectId}/files/${fileId}/download`,
        { responseType: 'blob' },
      );

      const contentDisposition = res.headers['content-disposition'];
      let fileName = 'download';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?/);
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

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    status: {
      downloadProjectFile: 'idle',
    },
    error: {
      downloadProjectFile: null,
    },
  },
  reducers: {
    setSelectedProject: (state, action) => {
      state.selected = action.payload;
    },
    clearSelectedProject: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(downloadProjectFile.pending, (state) => {
      state.status.downloadProjectFile = 'loading';
      state.error.downloadProjectFile = null;
    });

    builder.addCase(downloadProjectFile.fulfilled, (state) => {
      state.status.downloadProjectFile = 'succeeded';
    });

    builder.addCase(downloadProjectFile.rejected, (state, action) => {
      state.status.downloadProjectFile = 'failed';
      state.error.downloadProjectFile = action.payload;
    });
  },
});

export const { setSelectedProject, clearSelectedProject } =
  projectSlice.actions;

export default projectSlice.reducer;
