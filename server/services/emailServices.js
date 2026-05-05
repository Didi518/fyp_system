import nodemailer from 'nodemailer';

import { generateForgotPasswordEmailTemplate } from '../utils/emailTemplates.js';

export const sendEmail = async ({ to, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },

      service: process.env.SMTP_SERVICE,
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(error.message || "Erreur lors de l'envoi de l'e-mail");
  }
};

export const sendResetPasswordEmail = async (user) => {
  user.activationToken = undefined;
  user.activationTokenExpire = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  const token = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const url = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe/${token}`;
  const message = generateForgotPasswordEmailTemplate(url);

  await sendEmail({
    to: user.email,
    subject: 'Réinitialisation du mot de passe',
    message,
  });
};
