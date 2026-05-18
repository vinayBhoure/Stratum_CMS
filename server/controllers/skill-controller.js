const skillService = require('../services/skill-service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/v1/skills
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSkills(req, res) {
  const skills = await skillService.list(req.user.id);
  sendSuccess(res, skills);
}

/**
 * POST /api/v1/skills
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createSkill(req, res) {
  const skill = await skillService.create(req.user.id, req.body);
  sendSuccess(res, skill, 201);
}

/**
 * PUT /api/v1/skills/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateSkill(req, res) {
  const result = await skillService.update(req.params.id, req.user.id, req.body);
  if (result.count === 0) {
    return sendError(res, 'NOT_FOUND', 'Skill not found', 404);
  }
  sendSuccess(res, { id: req.params.id, ...req.body });
}

/**
 * DELETE /api/v1/skills/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteSkill(req, res) {
  const result = await skillService.remove(req.params.id, req.user.id);
  if (result.count === 0) {
    return sendError(res, 'NOT_FOUND', 'Skill not found', 404);
  }
  sendSuccess(res, null);
}

module.exports = { getSkills, createSkill, updateSkill, deleteSkill };
