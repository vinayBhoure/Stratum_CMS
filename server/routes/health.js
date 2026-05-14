/**
 * Health check route.
 * GET /health → { success: true, data: { status: 'ok', timestamp } }
 */

const express = require('express');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

/**
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
router.get('/', (_req, res) => {
  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
