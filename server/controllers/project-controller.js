const projectService = require('../services/project-service');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/v1/projects
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getProjects(req, res) {
  const projects = await projectService.list(req.user.id);
  sendSuccess(res, projects);
}

/**
 * GET /api/v1/projects/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getProject(req, res) {
  const project = await projectService.getById(req.params.id, req.user.id);
  if (!project) { return sendError(res, 'NOT_FOUND', 'Project not found', 404); }
  sendSuccess(res, project);
}

/**
 * POST /api/v1/projects
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createProject(req, res) {
  const project = await projectService.create(req.user.id, req.body);
  sendSuccess(res, project, 201);
}

/**
 * PUT /api/v1/projects/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateProject(req, res) {
  const project = await projectService.update(req.params.id, req.user.id, req.body);
  if (!project) { return sendError(res, 'NOT_FOUND', 'Project not found', 404); }
  sendSuccess(res, project);
}

/**
 * DELETE /api/v1/projects/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteProject(req, res) {
  const deleted = await projectService.remove(req.params.id, req.user.id);
  if (!deleted) { return sendError(res, 'NOT_FOUND', 'Project not found', 404); }
  sendSuccess(res, null);
}

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
