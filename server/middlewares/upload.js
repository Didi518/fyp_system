import multer from 'multer';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 40);
};

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    let uploadPath;

    if (req.params.projectId) {
      uploadPath = path.join(
        __dirname,
        '../uploads/projects',
        req.params.projectId,
      );
    } else if (req.params.userId) {
      uploadPath = path.join(__dirname, '../uploads/users', req.params.userId);
    } else {
      uploadPath = path.join(__dirname, '../uploads/temp');
    }

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const nameWithoutExt = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitized = sanitizeFilename(nameWithoutExt);

    cb(null, `${sanitized}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/x-tar',
    'application/gzip',
    'application/x-gzip',
    'application/x-rar-compressed',
    'application/vnd.rar',
  ];

  const allowedExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.zip',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.rar',
    '.tar',
    '.gz',
  ];

  const dangerousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.scr',
    '.vbs',
    '.js',
    '.jar',
    '.app',
    '.sh',
  ];

  const fileExt = path.extname(file.originalname).toLowerCase();

  const parts = file.originalname.toLowerCase().split('.');

  const hasDangerous = parts.some((part, index) => {
    if (index === 0) return false;
    return dangerousExtensions.includes(`.${part}`);
  });

  if (hasDangerous) {
    return cb(
      new Error('Nom de fichier suspect ou extension dangereuse détectée'),
      false,
    );
  }

  if (
    allowedTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExt)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      'Type de fichier invalide. Autorisés : PDF, DOC, DOCX, PPTX, ZIP, images (JPG, PNG, GIF)',
    ),
    false,
  );
};

const uploads = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

const handleUploadError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / (1024 * 1024)} MB)`,
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: `Nombre de fichiers dépassé (max ${MAX_FILES})`,
      });
    }
  }

  if (err?.message?.includes('extension dangereuse')) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err?.message?.includes('Type de fichier invalide')) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Erreur lors du téléchargement',
    });
  }

  next();
};

export { uploads as upload, handleUploadError };
