import crypto from 'node:crypto';

import { User } from '../models/user.js';
import ErrorHandler from '../middlewares/error.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  sendEmail,
  sendResetPasswordEmail,
} from '../services/emailServices.js';
import { generateAccountActivationEmailTemplate } from '../utils/emailTemplates.js';

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler('Tous les champs sont requis', 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler('Email déjà utilisé', 400));
  }

  const adminExists = await User.findOne({ role: 'admin' });

  if (!adminExists) {
    await User.create({
      name,
      email,
      password,
      role: 'admin',
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Admin créé avec succès',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
    isActive: false,
  });

  if (user && !user.isActive) {
    try {
      user.activationToken = undefined;
      user.activationTokenExpire = undefined;

      const activationToken = user.getActivationToken();

      await user.save({ validateBeforeSave: false });

      const activationUrl = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${activationToken}`;
      const message = generateAccountActivationEmailTemplate(activationUrl);

      await sendEmail({
        to: user.email,
        subject: 'SYSTEME FYP - 🎉 Activez votre compte',
        message,
      });
    } catch (error) {
      user.activationToken = undefined;
      user.activationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

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

  res.status(201).json({
    success: true,
    message: 'Inscription réussie, vérifiez votre email',
  });
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

  await sendResetPasswordEmail(user);

  res.status(200).json({
    success: true,
    message: 'Si un compte existe, un email a été envoyé',
  });
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
    user.passwordChangedAt = new Date(Date.now() - 1000);
    await user.save();

    return generateToken(user, 200, 'Le mot de passe a bien été changé', res);
  }

  user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (user) {
    user.password = req.body.password;

    if (!user.isActive) user.isActive = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = new Date(Date.now() - 1000);

    await user.save();

    return generateToken(user, 200, 'Le mot de passe a bien été changé', res);
  }

  return generateToken(user, 200, 'Le mot de passe a bien été changé', res);
});

export const resendActivationToken = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler('Email requis', 400));

  const user = await User.findOne({ email });
  if (user && !user.isActive) {
    user.activationToken = undefined;
    user.activationTokenExpire = undefined;

    const token = user.getActivationToken();

    await user.save({ validateBeforeSave: false });

    const activationUrl = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${token}`;
    const message = generateAccountActivationEmailTemplate(activationUrl);

    try {
      await sendEmail({
        to: user.email,
        subject: 'SYSTEME FYP - 🎉 Activez votre compte',
        message,
      });
    } catch {
      user.activationToken = undefined;
      user.activationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Si un compte existe, un email a été envoyé',
  });
});

export const resendResetToken = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler('Email requis', 400));
  }

  const user = await User.findOne({ email });

  if (user) {
    await sendResetPasswordEmail(user);
  }

  return res.status(200).json({
    success: true,
    message: 'Si un compte existe, un email a été envoyé',
  });
});
