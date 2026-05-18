/**
 * Global error-handling middleware.
 * Catches all unhandled errors and returns a safe response.
 * Never exposes raw error details to the client.
 *
 * @see /.claude/rules/security-rules.md
 */

/**
 * Express error-handling middleware (must have 4 params).
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // @clerk/clerk-sdk-node throws plain Error("Unauthenticated") with no status code
  const isClerkUnauth = err.message === 'Unauthenticated';
  const statusCode = err.statusCode || err.status || (isClerkUnauth ? 401 : 500);
  const code = err.code || (isClerkUnauth ? 'UNAUTHORIZED' : 'INTERNAL_ERROR');
  const message =
    statusCode === 500
      ? 'An unexpected error occurred'
      : err.message || 'Something went wrong';

  return res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message },
  });
}

module.exports = errorHandler;
