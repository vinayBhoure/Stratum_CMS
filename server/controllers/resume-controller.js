const resumeService = require('../services/resume-service');
const cloudinary = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/v1/upload  (generic — any allowed file type, returns Cloudinary URL)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function genericUpload(req, res) {
  if (!req.file) { return sendError(res, 'NO_FILE', 'A file is required', 400); }

  const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';

  const url = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) { reject(error); } else { resolve(result.secure_url); }
      }
    ).end(req.file.buffer);
  });

  sendSuccess(res, { url }, 201);
}

/**
 * GET /api/v1/resume
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getResume(req, res) {
  const resume = await resumeService.getResume(req.user.id);
  if (!resume) { return sendError(res, 'NOT_FOUND', 'Resume not found', 404); }
  sendSuccess(res, resume);
}

/**
 * POST /api/v1/resume  (upload or replace)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function upsertResume(req, res) {
  if (!req.file) { return sendError(res, 'NO_FILE', 'A file is required', 400); }
  const resume = await resumeService.upsertResume(req.user.id, req.file);
  sendSuccess(res, resume, 200);
}

/**
 * DELETE /api/v1/resume
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteResume(req, res) {
  const deleted = await resumeService.deleteResume(req.user.id);
  if (!deleted) { return sendError(res, 'NOT_FOUND', 'Resume not found', 404); }
  sendSuccess(res, null);
}

module.exports = { genericUpload, getResume, upsertResume, deleteResume };
