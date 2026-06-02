import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  createUser as createUserThunk,
  updateUser as updateUserThunk,
  deleteUser as deleteUserThunk,
  getAllUsers as getAllUsersThunk,
  getAllProjects as getAllProjectsThunk,
  getDashboardStats as getDashboardStatsThunk,
} from '../store/slices/adminSlice';

export const useAdmin = () => {
  const dispatch = useDispatch();
  const {
    users,
    projects,
    pagination,
    stats,
    loadingUsers,
    loadingProjects,
    loadingStats,
    error,
  } = useSelector((state) => state.admin);

  const createUser = useCallback(
    (payload) => {
      return dispatch(createUserThunk(payload));
    },
    [dispatch],
  );

  const updateUser = useCallback(
    (payload) => {
      return dispatch(updateUserThunk(payload));
    },
    [dispatch],
  );

  const deleteUser = useCallback(
    (id) => {
      return dispatch(deleteUserThunk(id));
    },
    [dispatch],
  );

  const getAllUsers = useCallback(
    (params) => {
      return dispatch(getAllUsersThunk(params));
    },
    [dispatch],
  );

  const getAllProjects = useCallback(() => {
    return dispatch(getAllProjectsThunk());
  }, [dispatch]);

  const getDashboardStats = useCallback(() => {
    return dispatch(getDashboardStatsThunk());
  }, [dispatch]);

  return {
    users,
    projects,
    pagination,
    stats,
    loadingUsers,
    loadingProjects,
    loadingStats,
    error,

    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getAllProjects,
    getDashboardStats,
  };
};
