import jwt from 'jsonwebtoken';

import { User } from '../models/user.js';

import ErrorHandler from './error.js';
import { asyncHandler } from './asyncHandler.js';

export const isAuthenticated = asyncHandler(async (req, _res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler(
        'Merci de vous connecter pour accéder à cette page',
        401,
      ),
    );
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(
      new ErrorHandler(
        'Token invalide ou expiré, veuillez vous reconnecter',
        401,
      ),
    );
  }

  const user = await User.findById(decoded.id).select(
    '-resetPasswordToken -resetPasswordExpire',
  );

  if (!user) {
    return next(new ErrorHandler('Utilisateur introuvable', 404));
  }

  req.user = user;

  next();
});

export const isAuthorized = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Votre rôle: "${req.user.role.toLowerCase()}" ne vous autorise pas à accéder à cette page`,
          403,
        ),
      );
    }

    next();
  };
};
