import { User } from '../models/user.js';
import { Project } from '../models/project.js';
import ErrorHandler from '../middlewares/error.js';
import { sendEmail } from '../services/emailServices.js';
import * as userServices from '../services/userServices.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import * as projectServices from '../services/projectServices.js';
import { SupervisorRequest } from '../models/supervisorRequest.js';
import { generateAccountActivationEmailTemplate } from '../utils/emailTemplates.js';
import {
  ACTIVE_STATUSES,
  FINAL_STATUSES,
  roleLabels,
} from '../constants/constants.js';

export const createUserByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role) {
    return next(new ErrorHandler('Rôle requis', 400));
  }

  let data = {};

  if (role === 'student') {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return next(
        new ErrorHandler('Tous les champs sont requis pour un étudiant', 400),
      );
    }

    data = { name, email, department };
  } else if (role === 'teacher') {
    let { name, email, department, maxStudents, expertises } = req.body;

    if (!name || !email || !department || !maxStudents || !expertises) {
      return next(
        new ErrorHandler('Tous les champs sont requis pour un enseignant', 400),
      );
    }

    expertises = Array.isArray(expertises)
      ? expertises
      : expertises
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    data = { name, email, department, maxStudents, expertises };
  } else if (role === 'admin') {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(
        new ErrorHandler('Tous les champs sont requis pour un admin', 400),
      );
    }

    data = {
      name,
      email,
      password,
      isActive: true,
    };
  } else {
    return next(new ErrorHandler('Rôle invalide', 400));
  }

  data.role = role;

  const user = await userServices.createUser(data);

  if (!data.password) {
    const activationToken = user.getActivationToken();
    await user.save({ validateBeforeSave: false });

    const activationUrl = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${activationToken}`;
    const message = generateAccountActivationEmailTemplate(activationUrl);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Activation de compte',
        message,
      });
    } catch (error) {
      user.activationToken = undefined;
      user.activationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorHandler("Erreur lors de l'envoi de l'email", 500));
    }
  }

  res.status(201).json({
    success: true,
    message: `${roleLabels[role]} créé`,
    data: { user },
  });
});

export const updateUserByRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  const updateData = { ...req.body };

  delete updateData.role;
  delete updateData.password;
  delete updateData.resetPasswordToken;
  delete updateData.resetPasswordExpire;

  const user = await userServices.getUserById(id);
  if (!user) return next(new ErrorHandler('Utilisateur non trouvé', 404));

  if (user.role === 'admin' && req.user.id !== id) {
    return next(
      new ErrorHandler(
        'Vous ne pouvez pas éditer un autre administrateur',
        403,
      ),
    );
  }

  if (role && user.role !== role) {
    return next(
      new ErrorHandler(`L’utilisateur n’est pas un ${role.toLowerCase()}`, 400),
    );
  }

  const updatedUser = await userServices.updateUser(id, updateData);

  res.status(200).json({
    success: true,
    message: `${roleLabels[user.role]} mis à jour!`,
    data: { user: updatedUser },
  });
});

export const deleteUserByRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await userServices.getUserById(id);
  if (!user) return next(new ErrorHandler('Utilisateur non trouvé', 404));

  if (req.user.id === id) {
    return next(
      new ErrorHandler('Vous ne pouvez pas supprimer votre propre compte', 400),
    );
  }

  if (user.role === 'admin') {
    return next(
      new ErrorHandler('Vous ne pouvez pas supprimer un administrateur', 403),
    );
  }

  await userServices.deleteUser(user);

  res.status(200).json({
    success: true,
    message: `Utilisateur (${user.name}) supprimé (${roleLabels[user.role].toLowerCase()})`,
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, role } = req.query;

  if (role && role === 'admin') {
    return next(
      new ErrorHandler('Accès refusé: impossible de filtrer par Admin', 403),
    );
  }

  const result = await userServices.getAllUsers(
    Number(page),
    Number(limit),
    role || null,
  );

  res.status(200).json({
    success: true,
    message: 'Utilisateurs récupérés!',
    data: {
      users: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
        results: result.count,
      },
    },
  });
});

export const getAllProjects = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  if (req.user.role && req.user.role !== 'admin') {
    return next(new ErrorHandler('Accès refusé.', 403));
  }

  const result = await projectServices.getAllProjects(
    Number(page),
    Number(limit),
    status || null,
  );

  res.status(200).json({
    success: true,
    message: 'Projets récupérés!',
    data: {
      projects: result.projects,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
        results: result.count,
      },
    },
  });
});

// TODO::
// export const assignSupervisor = asyncHandler(async (req, res, next) => {});

export const getDashboardStats = asyncHandler(async (_req, res, _next) => {
  const [
    totalStudents,
    totalTeachers,
    totalProjects,
    pendingRequests,
    completedProjects,
    pendingProjects,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    Project.countDocuments(),
    SupervisorRequest.countDocuments({ status: 'pending' }),
    Project.countDocuments({ status: { $in: FINAL_STATUSES } }),
    Project.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Stats Admin récupérées!',
    data: {
      stats: {
        totalStudents,
        totalTeachers,
        totalProjects,
        pendingRequests,
        completedProjects,
        pendingProjects,
      },
    },
  });
});
