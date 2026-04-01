import crypto from 'node:crypto';

import { User } from '../models/user.js';
import ErrorHandler from '../middlewares/error.js';
import { sendEmail } from '../services/emailService.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { generateForgotPasswordEmailTemplate } from '../utils/emailTemplates.js';

export const registerUser = asyncHandler(async (req, res, _next) => {
  const user = new User(req.body);
  await user.save();

  generateToken(user, 201, 'Utilisateur bien enregistré', res);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(
      new ErrorHandler('Merci de remplir tous les champs requis', 400),
    );
  }

  const user = await User.findOne({ email, role }).select('+password');
  if (!user) {
    return next(new ErrorHandler('Identifiants invalides', 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Identifiants invalides', 401));
  }

  if (!user.isActive) {
    return next(
      new ErrorHandler(
        "Votre compte n'a pas encore été activé. Veuillez vérifier votre email.",
        403,
      ),
    );
  }

  generateToken(user, 200, 'Connexion réussie', res);
});

export const logout = asyncHandler(async (_req, res, _next) => {
  res
    .status(200)
    .cookie('token', '', {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: 'Déconnexion réussie',
    });
});

export const getUser = asyncHandler(async (req, res, _next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler('Utilisateur introuvable', 404));
  }

  const resetToken = /** @type {any} */ (user).getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${resetToken}`;
  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      to: user.email,
      subject: 'SYSTEME FYP - 🔏 Demande de réinitialisation du mot de passe',
      message,
    });

    res.status(200).json({
      success: true,
      message: `E-mail de réinitialisation du mot de passe a bien été envoyé à ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        error.message || "Erreur lors de l'envoi de l'e-mail",
        500,
      ),
    );
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  if (!req.body.password || !req.body.confirmPassword) {
    return next(
      new ErrorHandler(
        'Merci de fournir le nouveau mot de passe et sa confirmation',
        400,
      ),
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler('Les mots de passe ne correspondent pas', 400),
    );
  }

  let user = await User.findOne({
    activationToken: hashedToken,
    activationTokenExpire: { $gt: Date.now() },
  });

  if (user) {
    user.password = req.body.password;
    user.isActive = true;
    user.activationToken = undefined;
    user.activationTokenExpire = undefined;
    await user.save();

    return generateToken(user, 200, 'Le mot de passe a bien été changé', res);
  }

  user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler('Token de réinitialisation invalide ou expiré', 401),
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return generateToken(user, 200, 'Le mot de passe a bien été changé', res);
});
