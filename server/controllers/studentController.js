import mongoose from 'mongoose';

import { User } from '../models/user.js';
import { Project } from '../models/project.js';
import { Deadline } from '../models/deadline.js';
import ErrorHandler from '../middlewares/error.js';
import { Notification } from '../models/notification.js';
import * as fileServices from '../services/fileServices.js';
import { ACTIVE_STATUSES } from '../constants/constants.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as projectServices from '../services/projectServices.js';
import * as requestServices from '../services/requestServices.js';
import * as notificationServices from '../services/notificationServices.js';

export const getStudentProject = asyncHandler(async (req, res, _next) => {
  const studentId = req.user._id;
  const project = await projectServices.getLatestProjectByStudent(studentId);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: 'Aucun projet trouvé pour cet étudiant',
    });
  }

  res.status(200).json({
    success: true,
    data: { project },
  });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { title, description } = req.body;

  await projectServices.archiveTerminalProjects(studentId);

  const activeProject =
    await projectServices.getActiveProjectByStudent(studentId);

  if (activeProject) {
    return next(new ErrorHandler('Vous avez déjà un projet actif.', 400));
  }

  const project = await projectServices.createProject({
    student: studentId,
    title,
    description,
  });

  await User.findByIdAndUpdate(studentId, { project: project._id });

  res.status(201).json({
    success: true,
    data: { project },
    message: 'Proposition de projet soumise!',
  });
});

export const uploadFiles = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { projectId } = req.params;

  if (req.user.role !== 'student')
    return next(new ErrorHandler('Accès interdit', 403));

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new ErrorHandler('ID projet invalide', 400));
  }

  const project = await projectServices.getProjectById(projectId);

  if (req.user.project && !req.user.project.equals(projectId)) {
    return next(
      new ErrorHandler("Ce projet n'est pas associé à votre compte", 403),
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler('Aucun fichier téléchargé', 400));
  }

  const currentFilesCount = project.files?.length || 0;
  if (currentFilesCount + req.files.length > 20) {
    return next(new ErrorHandler('Limite de fichiers atteinte', 400));
  }

  const updatedProject = await projectServices.addFilesToProject(
    project,
    req.files,
  );

  res.status(200).json({
    success: true,
    message: 'Fichier téléchargé!',
    data: { project: updatedProject },
  });
});

export const getAvailableSupervisors = asyncHandler(
  async (_req, res, _next) => {
    const supervisors = await User.find({
      role: 'teacher',
      $expr: {
        $lt: [{ $size: '$assignedStudents' }, '$maxStudents'],
      },
    })
      .select('name email department expertises')
      .lean();

    res.status(200).json({
      success: true,
      data: { supervisors },
      message: 'Liste des superviseurs disponibles',
    });
  },
);

export const getSupervisor = asyncHandler(async (req, res, _next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    'supervisor',
    'name email department expertises',
  );

  if (!student.supervisor) {
    return res.status(200).json({
      success: true,
      data: { supervisor: null },
      message: 'Aucun superviseur assigné',
    });
  }

  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor },
  });
});

export const requestSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { teacherId, message } = req.body;

  const student = await User.findById(studentId);
  if (!student) {
    return next(new ErrorHandler('Utilisateur introuvable', 404));
  }
  if (student.supervisor) {
    return next(new ErrorHandler('Vous avez déjà un superviseur assigné', 400));
  }

  const supervisor = await User.findById(teacherId)
    .select('role maxStudents assignedStudents name')
    .lean();
  if (!supervisor || supervisor.role !== 'teacher') {
    return next(new ErrorHandler('Superviseur demandé invalide', 400));
  }

  const pendingRequest = await requestServices.findPendingByStudent(studentId);
  if (pendingRequest) {
    return next(new ErrorHandler('Vous avez déjà une demande en attente', 400));
  }

  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return next(
      new ErrorHandler(
        "Ce superviseur a atteint sa capacité maximale d'étudiants",
        400,
      ),
    );
  }

  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message,
  };

  const request = await requestServices.createRequest(requestData);

  await notificationServices.notifyUser(
    teacherId,
    `${student.name} a demandé à être supervisé par ${supervisor.name}`,
    'request',
    '/teacher/requests',
    'medium',
  );

  return res.status(201).json({
    success: true,
    data: { request },
    message: 'Demande de supervision envoyée!',
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const project = await Project.findOne({
    student: studentId,
    status: { $in: ACTIVE_STATUSES },
  })
    .populate('supervisor', 'name')
    .lean();

  const now = new Date();

  const upcomingDeadline = [];

  if (project?.deadline && new Date(project.deadline) >= now) {
    upcomingDeadline
      .push({
        title: 'Date limite du projet',
        deadline: project.deadline,
        type: 'project',
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  if (project?._id) {
    const projectDeadlines = await Deadline.find({
      project: project._id,
      dueDate: { $gte: now },
    })
      .sort({ dueDate: 1 })
      .select('name dueDate')
      .lean();

    upcomingDeadline.push(
      ...projectDeadlines.map((deadline) => ({
        title: deadline.name,
        deadline: deadline.dueDate,
        type: 'custom',
      })),
    );
  }

  const topNotifications = await Notification.find({ user: studentId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const feedbackNotifications = project?.feedback?.length
    ? project.feedback
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2)
    : [];

  const supervisorName = project?.supervisor?.name || null;

  res.status(200).json({
    success: true,
    message: 'Statistiques du tableau de bord récupérées!',
    data: {
      project,
      upcomingDeadline,
      topNotifications,
      feedback: feedbackNotifications,
      supervisorName,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new ErrorHandler('ID projet invalide', 400));
  }

  const project = await projectServices.getProjectById(projectId);

  if (req.user.project && !req.user.project.equals(projectId)) {
    return next(
      new ErrorHandler("Ce projet n'est pas associé à votre compte", 403),
    );
  }

  if (!project.student.equals(studentId)) {
    return next(new ErrorHandler('Accès interdit à ce projet', 403));
  }

  const sortedFeedback = project.feedback?.length
    ? [...project.feedback].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
    : [];

  res.status(200).json({
    success: true,
    data: { feedback: sortedFeedback },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return next(new ErrorHandler('ID projet invalide', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return next(new ErrorHandler('ID fichier invalide', 400));
  }

  const project = await projectServices.getProjectById(projectId);

  if (!project) {
    return next(new ErrorHandler('Projet introuvable', 404));
  }

  const file = project.files.id(fileId);

  if (!file) {
    return next(new ErrorHandler('Fichier introuvable', 404));
  }

  if (!project.student.equals(studentId)) {
    return next(new ErrorHandler('Accès interdit', 403));
  }

  fileServices.streamDownload(file.fileUrl, res, file.originalName);
});
