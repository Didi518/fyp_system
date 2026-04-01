export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #3b82f6; margin: 0;">SYSTEME FYP - 🔏 Demande de réinitialisation du mot de passe</h2>
      </div>

      <p style="font-size: 16px; color: #374151">Cher Utilisateur, </p>
      <p style="font-size: 16px; color: #374151">Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetPasswordUrl}"
         style="display: inline-block; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; background-color: #3b82f6">
          Réinitialiser le mot de passe
        </a>
      </div>

      <p style="font-size: 15px; color: #374151">
        Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail. Le lien expirera dans <b>15 minutes</b>.
      </p>

      <p style="font-size: 15px; color: #374151">
        Si le lien ne fonctionne pas, copiez et collez l'URL suivante dans votre navigateur:
      </p>

      <p style="font-size: 14px; color: #3b82f6; word-wrap: break-word;">
        ${resetPasswordUrl}
      </p>

      <footer style="margin-top: 30px; text-align: center; font-size: 14px; color: #6b7280;">
        <p>Merci, <br /><strong>📚 L'équipe Rat de Bibliothèque</strong></p>
        <p style="font-size: 12px; color: #9ca3af;">Ceci est un message automatique. Merci de ne pas y répondre.</p>
      </footer>
    </div>
  `;
}

export function generateAccountActivationEmailTemplate(activationUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #3b82f6; margin: 0;">SYSTEME FYP - 🎉 Bienvenue! Activez votre compte</h2>
      </div>

      <p style="font-size: 16px; color: #374151">Cher Utilisateur,</p>
      <p style="font-size: 16px; color: #374151">Votre compte a été créé par un administrateur. Pour l'activer et définir votre mot de passe personnel, cliquez sur le bouton ci-dessous:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationUrl}"
         style="display: inline-block; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; background-color: #10b981">
          Activer mon compte
        </a>
      </div>

      <p style="font-size: 15px; color: #374151">
        Ce lien d'activation expirera dans <b>24 heures</b>. Passé ce délai, veuillez contacter un administrateur pour recevoir un nouveau lien.
      </p>

      <p style="font-size: 15px; color: #374151">
        Si le lien ne fonctionne pas, copiez et collez l'URL suivante dans votre navigateur:
      </p>

      <p style="font-size: 14px; color: #3b82f6; word-wrap: break-word;">
        ${activationUrl}
      </p>

      <footer style="margin-top: 30px; text-align: center; font-size: 14px; color: #6b7280;">
        <p>Merci, <br /><strong>📚 L'équipe Rat de Bibliothèque</strong></p>
        <p style="font-size: 12px; color: #9ca3af;">Ceci est un message automatique. Merci de ne pas y répondre.</p>
      </footer>
    </div>
  `;
}
