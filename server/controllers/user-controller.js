const { sendSuccess } = require('../utils/response');

/**
 * GET /api/v1/me
 * Returns the authenticated user's profile.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getMe(req, res) {
  sendSuccess(res, req.user);
}

module.exports = { getMe };
