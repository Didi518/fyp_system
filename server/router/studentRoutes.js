import express from 'express';

import { handleUploadError, upload } from '../middlewares/upload.js';
import {
  isAuthenticated,
  isAuthorized,
} from '../middlewares/authMiddleware.js';
import {
  downloadFile,
  getAvailableSupervisors,
  getDashboardStats,
  getFeedback,
  getStudentProject,
  getSupervisor,
  requestSupervisor,
  submitProposal,
  uploadFiles,
} from '../controllers/studentController.js';

const router = express.Router();

router.post(
  '/project-proposal',
  isAuthenticated,
  isAuthorized('student'),
  submitProposal,
);

router.post(
  '/upload/:projectId',
  isAuthenticated,
  isAuthorized('student'),
  upload.array('files', 10),
  handleUploadError,
  uploadFiles,
);

router.post(
  '/request-supervisor',
  isAuthenticated,
  isAuthorized('student'),
  requestSupervisor,
);

router.get(
  '/project',
  isAuthenticated,
  isAuthorized('student'),
  getStudentProject,
);

router.get(
  '/fetch-supervisors',
  isAuthenticated,
  isAuthorized('student'),
  getAvailableSupervisors,
);

router.get(
  '/supervisor',
  isAuthenticated,
  isAuthorized('student'),
  getSupervisor,
);

router.get(
  '/feedback/:projectId',
  isAuthenticated,
  isAuthorized('student'),
  getFeedback,
);

router.get(
  '/fetch-dashboard-stats',
  isAuthenticated,
  isAuthorized('student'),
  getDashboardStats,
);

router.get(
  '/download/:projectId/:fileId',
  isAuthenticated,
  isAuthorized('student'),
  downloadFile,
);

export default router;
