import mongoose from 'mongoose';

import ErrorHandler from '../middlewares/error.js';
import { Notification } from '../models/notification.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as notificationServices from '../services/notificationServices.js';

export const getNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  let query = {};

  if (role === 'admin') {
    query.type = { $in: ['request'] };
  } else {
    query.user = userId;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const [readCount, unreadCount, highPriorityMessages] = await Promise.all([
    Notification.countDocuments({ ...query, isRead: true }),
    Notification.countDocuments({ ...query, isRead: false }),
    Notification.countDocuments({ ...query, priority: 'high' }),
  ]);

  const now = new Date();
  const dayOfWeek = now.getDay() || 7;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const thisWeekNotifications = await Notification.countDocuments({
    ...query,
    createdAt: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Notifications récupérées!',
    data: {
      notifications,
      readCount,
      unreadCount,
      highPriorityMessages,
      thisWeekNotifications,
    },
  });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler('ID invalide', 400));
  }

  const updated = await notificationServices.markAsRead(id, userId);

  if (!updated) {
    const existing = await Notification.findOne({
      _id: id,
      user: userId,
    }).lean();
    if (!existing) {
      return next(new ErrorHandler('Notification non trouvée', 404));
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue!',
      data: { notification: existing },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification marquée comme lue!',
    data: { notification: updated },
  });
});

export const markAllAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const notifications = await notificationServices.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: 'Toutes les notifications marquées comme lues!',
    data: {
      modifiedCount: notifications.modifiedCount,
      matchedCount: notifications.matchedCount,
    },
  });
});

export const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler('ID invalide', 400));
  }

  const deleted = await notificationServices.deleteNotification(id, userId);

  if (!deleted) {
    return next(new ErrorHandler('Notification non trouvée', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Notification supprimée!',
  });
});
