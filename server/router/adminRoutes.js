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
  getAllProjects,
} from '../controllers/adminController.js';

const router = express.Router();

router.post(
  '/create-user',
  isAuthenticated,
  isAuthorized('admin'),
  createUserByRole,
);

router.put(
  '/update-user/:id',
  isAuthenticated,
  isAuthorized('admin'),
  updateUserByRole,
);

router.delete(
  '/delete-user/:id',
  isAuthenticated,
  isAuthorized('admin'),
  deleteUserByRole,
);

router.get('/users', isAuthenticated, isAuthorized('admin'), getAllUsers);

router.get('/projects', isAuthenticated, isAuthorized('admin'), getAllProjects);

export default router;
