import mongoose from 'mongoose';

import ErrorHandler from '../middlewares/error.js';
import * as fileServices from '../services/fileServices.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as projectServices from '../services/projectServices.js';

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new ErrorHandler('ID projet invalide', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return next(new ErrorHandler('ID fichier invalide', 400));
  }

  const project = await projectServices.getProjectById(projectId);

  const userRole = (user.role || '').toLowerCase();
  const userId = user._id?.toString() || user.id;

  const hasAccess =
    userRole === 'admin' ||
    project.student.equals(userId) ||
    project.supervisor?._id?.equals(userId);
  if (!hasAccess) {
    return next(new ErrorHandler('Accès interdit', 403));
  }

  const file = project.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler('Fichier introuvable', 404));
  }

  fileServices.streamDownload(file.fileUrl, res, file.originalName);
});
