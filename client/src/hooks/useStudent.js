import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  submitProjectProposal,
  fetchProject as fetchProjectThunk,
  getSupervisor as getSupervisorThunk,
  fetchSupervisors as fetchSupervisorsThunk,
  requestSupervisor as requestSupervisorThunk,
  uploadFiles as uploadFilesThunk,
  fetchDashboardStats as fetchDashboardStatsThunk,
  getFeedback as getFeedbackThunk,
  downloadFile as downloadFileThunk,
} from '../store/slices/studentSlice';

export const useStudent = () => {
  const dispatch = useDispatch();

  const {
    files,
    project,
    supervisor,
    supervisors,
    dashboardStats,
    feedback,
    status,
    error,
  } = useSelector((state) => state.student);

  const fetchProject = useCallback(() => {
    return dispatch(fetchProjectThunk());
  }, [dispatch]);

  const getSupervisor = useCallback(() => {
    return dispatch(getSupervisorThunk());
  }, [dispatch]);

  const fetchSupervisors = useCallback(() => {
    return dispatch(fetchSupervisorsThunk());
  }, [dispatch]);

  const submitProposal = useCallback(
    (data) => {
      return dispatch(submitProjectProposal(data));
    },
    [dispatch],
  );

  const requestSupervisor = useCallback(
    (data) => {
      return dispatch(requestSupervisorThunk(data));
    },
    [dispatch],
  );

  const uploadFiles = useCallback(
    (data) => {
      return dispatch(uploadFilesThunk(data));
    },
    [dispatch],
  );

  const fetchDashboardStats = () => dispatch(fetchDashboardStatsThunk());

  const getFeedback = useCallback(
    (projectId) => dispatch(getFeedbackThunk(projectId)),
    [dispatch],
  );

  const downloadFile = useCallback(
    (data) => dispatch(downloadFileThunk(data)),
    [dispatch],
  );

  return {
    project,
    supervisor,
    supervisors,
    files,
    dashboardStats,
    feedback,
    status,
    error,

    fetchProject,
    getSupervisor,
    fetchSupervisors,
    submitProposal,
    requestSupervisor,
    uploadFiles,
    fetchDashboardStats,
    getFeedback,
    downloadFile,
  };
};
