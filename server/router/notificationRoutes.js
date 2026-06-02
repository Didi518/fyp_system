import express from 'express';

import { isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', isAuthenticated, getNotifications);

router.put('/:id/read', isAuthenticated, markAsRead);
router.put('/read-all', isAuthenticated, markAllAsRead);

router.delete('/:id', isAuthenticated, deleteNotification);

export default router;
