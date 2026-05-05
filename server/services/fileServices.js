import fs from 'node:fs';
import path from 'node:path';

const BASE_UPLOAD_DIR = path.resolve('uploads');

export const streamDownload = (filePath, res, originalName) => {
  try {
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(BASE_UPLOAD_DIR)) {
      throw new ErrorHandler('Accès fichier invalide', 403);
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new ErrorHandler('Fichier introuvable', 404);
    }

    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    res.download(resolvedPath, safeName, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Flux de téléchargement interrompu',
        });
      }
    });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Flux de téléchargement interrompu',
    });
  }
};
