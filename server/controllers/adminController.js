import ErrorHandler from '../middlewares/error.js';
import * as userServices from '../services/userServices.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const createUserByRole = asyncHandler(async (req, res, next) => {
  const { role, ...data } = req.body;

  if (!role) return next(new ErrorHandler('Rôle requis', 400));

  if (role === 'Étudiant') {
    if (!data.name || !data.email || !data.password || !data.department) {
      return next(
        new ErrorHandler('Tous les champs sont requis pour un étudiant', 400),
      );
    }
    if ('expertises' in data || 'maxStudents' in data) {
      return next(
        new ErrorHandler(
          'Les champs "Compétences" et "Nombre maximum d\'étudiants" ne sont pas autorisés pour un étudiant',
          400,
        ),
      );
    }
  } else if (role === 'Enseignant') {
    if (
      !data.name ||
      !data.email ||
      !data.password ||
      !data.department ||
      !data.maxStudents ||
      !data.expertises
    ) {
      return next(
        new ErrorHandler('Tous les champs sont requis pour un enseignant', 400),
      );
    }

    data.expertises = Array.isArray(data.expertises)
      ? data.expertises
      : typeof data.expertises === 'string'
        ? data.expertises
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
  } else {
    return next(new ErrorHandler('Rôle invalide', 400));
  }

  data.role = role;
  const user = await userServices.createUser(data);

  res.status(201).json({
    success: true,
    message: `${role} créé!`,
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

  if (user.role === 'Admin' && req.user.id !== id) {
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
    message: `${user.role} mis à jour!`,
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

  if (user.role === 'Admin') {
    return next(
      new ErrorHandler('Vous ne pouvez pas supprimer un administrateur', 403),
    );
  }

  await userServices.deleteUser(user);

  res.status(200).json({
    success: true,
    message: `Utilisateur (${user.name}) supprimé (${user.role.toLowerCase()})`,
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, role } = req.query;

  if (role && role === 'Admin') {
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

// TODO::
// export const assignSupervisor = asyncHandler(async (req, res, next) => {});

// export const getAllProjects = asyncHandler(async (req, res, next) => {});

// export const getDashboardStats = asyncHandler(async (req, res, next) => {});
