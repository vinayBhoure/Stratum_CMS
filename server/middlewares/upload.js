const multer = require('multer');
const { sendError } = require('../utils/response');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
});

/**
 * Single-file upload middleware with standardised error responses.
 * Usage: router.post('/upload', uploadSingle, handler)
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) { return next(); }

    if (err.message === 'INVALID_FILE_TYPE') {
      return sendError(res, 'INVALID_FILE_TYPE', 'Only JPG, PNG, WebP, and PDF files are allowed', 400);
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'FILE_TOO_LARGE', 'File must be 5 MB or smaller', 400);
    }
    next(err);
  });
}

module.exports = uploadSingle;
