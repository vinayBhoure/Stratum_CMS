const contactService = require('../services/contact-service');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Contact ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/contact
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getContact(req, res) {
  const contact = await contactService.getContact(req.user.id);
  if (!contact) { return sendError(res, 'NOT_FOUND', 'Contact not found', 404); }
  sendSuccess(res, contact);
}

/**
 * POST /api/v1/contact  (create or replace)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function upsertContact(req, res) {
  const contact = await contactService.upsertContact(req.user.id, req.body);
  sendSuccess(res, contact, 200);
}

/**
 * DELETE /api/v1/contact
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteContact(req, res) {
  const deleted = await contactService.deleteContact(req.user.id);
  if (!deleted) { return sendError(res, 'NOT_FOUND', 'Contact not found', 404); }
  sendSuccess(res, null);
}

// ─── Social Accounts ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/social-accounts
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getSocialAccounts(req, res) {
  const accounts = await contactService.listSocial(req.user.id);
  sendSuccess(res, accounts);
}

/**
 * POST /api/v1/social-accounts
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function createSocialAccount(req, res) {
  const account = await contactService.createSocial(req.user.id, req.body);
  sendSuccess(res, account, 201);
}

/**
 * PUT /api/v1/social-accounts/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateSocialAccount(req, res) {
  const updated = await contactService.updateSocial(req.params.id, req.user.id, req.body);
  if (!updated) { return sendError(res, 'NOT_FOUND', 'Social account not found', 404); }
  sendSuccess(res, { id: req.params.id, ...req.body });
}

/**
 * DELETE /api/v1/social-accounts/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteSocialAccount(req, res) {
  const deleted = await contactService.deleteSocial(req.params.id, req.user.id);
  if (!deleted) { return sendError(res, 'NOT_FOUND', 'Social account not found', 404); }
  sendSuccess(res, null);
}

module.exports = {
  getContact, upsertContact, deleteContact,
  getSocialAccounts, createSocialAccount, updateSocialAccount, deleteSocialAccount,
};
