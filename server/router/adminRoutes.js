import express from 'express';
import {
  isAuthenticated,
  isAuthorized,
} from '../middlewares/authMiddleware.js';
import {
  createUserByRole,
  updateUserByRole,
  deleteUserByRole,
  getAllUsers,
} from '../controllers/adminController.js';

const router = express.Router();

router.post(
  '/create-user',
  isAuthenticated,
  isAuthorized('Admin'),
  createUserByRole,
);

router.put(
  '/update-user/:id',
  isAuthenticated,
  isAuthorized('Admin'),
  updateUserByRole,
);

router.delete(
  '/delete-user/:id',
  isAuthenticated,
  isAuthorized('Admin'),
  deleteUserByRole,
);

router.get('/users', isAuthenticated, isAuthorized('Admin'), getAllUsers);

export default router;
