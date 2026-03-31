class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, _req, res, _next) => {
  let customError = err;

  if (err.code === 11000) {
    customError = new ErrorHandler(
      `Erreur: ${Object.keys(err.keyValue)} déjà enregistré`,
      409,
    );
  }

  if (err.name === 'JsonWebTokenError') {
    customError = new ErrorHandler(
      'Token invalide, veuillez vous reconnecter',
      401,
    );
  }

  if (err.name === 'TokenExpiredError') {
    customError = new ErrorHandler(
      'Token expiré, veuillez vous reconnecter',
      401,
    );
  }

  if (err.name === 'CastError') {
    customError = new ErrorHandler(
      `Ressource introuvable: ${err.path} invalide`,
      404,
    );
  }

  const errorMessage = customError.errors
    ? Object.values(customError.errors)
        .map((val) => val.message)
        .join(', ')
    : customError.message || 'Erreur Interne du Serveur';

  return res.status(customError.statusCode || 500).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;
