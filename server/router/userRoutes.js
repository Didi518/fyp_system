import multer from 'multer';
import express from 'express';

import { isAuthenticated } from '../middlewares/authMiddleware.js';
import {
  forgotPassword,
  getUser,
  login,
  logout,
  registerUser,
  resetPassword,
  resendActivationToken,
  resendResetToken,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/password/forgot', forgotPassword);
router.post('/password/resend-token', resendResetToken);
router.post('/activation/resend-token', resendActivationToken);

router.get('/me', isAuthenticated, getUser);
router.get('/logout', isAuthenticated, logout);

router.put('/password/reset/:token', resetPassword);

export default router;
