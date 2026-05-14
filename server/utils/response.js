/**
 * Standardized API response helpers.
 * All responses follow the format: { success, data, error }
 *
 * @see /.claude/rules/api-design-rules.md
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {Object|Array|null} data - The response payload
 * @param {number} [statusCode=200] - HTTP status code
 */
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @param {string} message - Human-readable error message
 * @param {number} [statusCode=400] - HTTP status code
 */
function sendError(res, code, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message },
  });
}

module.exports = { sendSuccess, sendError };
