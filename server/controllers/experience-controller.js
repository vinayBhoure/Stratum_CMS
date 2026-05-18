const experienceService = require('../services/experience-service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/v1/experience
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getExperiences(req, res) {
  const experiences = await experienceService.list(req.user.id);
  sendSuccess(res, experiences);
}

/**
 * GET /api/v1/experience/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getExperience(req, res) {
  const experience = await experienceService.getById(req.params.id, req.user.id);
  if (!experience) { return sendError(res, 'NOT_FOUND', 'Experience not found', 404); }
  sendSuccess(res, experience);
}

/**
 * POST /api/v1/experience
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createExperience(req, res) {
  const experience = await experienceService.create(req.user.id, req.body);
  sendSuccess(res, experience, 201);
}

/**
 * PUT /api/v1/experience/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateExperience(req, res) {
  const experience = await experienceService.update(req.params.id, req.user.id, req.body);
  if (!experience) { return sendError(res, 'NOT_FOUND', 'Experience not found', 404); }
  sendSuccess(res, experience);
}

/**
 * DELETE /api/v1/experience/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteExperience(req, res) {
  const deleted = await experienceService.remove(req.params.id, req.user.id);
  if (!deleted) { return sendError(res, 'NOT_FOUND', 'Experience not found', 404); }
  sendSuccess(res, null);
}

module.exports = { getExperiences, getExperience, createExperience, updateExperience, deleteExperience };
