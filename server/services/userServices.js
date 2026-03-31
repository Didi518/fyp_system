import { User } from '../models/user.js';

import ErrorHandler from '../middlewares/error.js';

export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    return await user.save();
  } catch (error) {
    throw new ErrorHandler(error.message, 400);
  }
};

export const updateUser = async (id, updateData) => {
  try {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');
  } catch (error) {
    throw new ErrorHandler(
      "Erreur lors de la mise à jour de l'utilisateur: " + error.message,
      400,
    );
  }
};

export const getUserById = async (id) => {
  return await User.findById(id).select(
    '-password -resetPasswordToken -resetPasswordExpire',
  );
};

export const deleteUser = async (userDoc) => {
  if (!userDoc) {
    throw new ErrorHandler('Utilisateur non trouvé', 404);
  }

  return await userDoc.deleteOne();
};

export const getAllUsers = async (page = 1, limit = 10, role = null) => {
  const allowedRoles = ['Étudiant', 'Enseignant'];
  const query =
    role && allowedRoles.includes(role) ? { role } : { role: { $ne: 'Admin' } };
  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Math.min(100, Number(limit) || 10));

  const users = await User.find(query)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    page,
    limit,
    pages: total === 0 ? 1 : Math.ceil(total / limit),
    results: users.length,
  };
};
