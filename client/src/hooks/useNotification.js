import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  getNotifications as getNotificationsThunk,
  markAsRead as markAsReadThunk,
  markAllAsRead as markAllAsReadThunk,
  deleteNotification as deleteNotificationThunk,
} from '../store/slices/notificationSlice';

export const useNotification = () => {
  const dispatch = useDispatch();
  const {
    list,
    unreadCount,
    readCount,
    loading,
    error,
    highPriorityMessages,
    thisWeekNotifications,
  } = useSelector((state) => state.notification);

  const getNotifications = useCallback(() => {
    return dispatch(getNotificationsThunk());
  }, [dispatch]);

  const markAsRead = useCallback(
    (id) => {
      return dispatch(markAsReadThunk(id));
    },
    [dispatch],
  );

  const markAllAsRead = useCallback(() => {
    return dispatch(markAllAsReadThunk());
  }, [dispatch]);

  const deleteNotification = useCallback(
    (id) => {
      return dispatch(deleteNotificationThunk(id));
    },
    [dispatch],
  );

  return {
    notifications: list,
    unreadCount,
    readCount,
    highPriorityMessages,
    thisWeekNotifications,
    loading,
    error,

    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
