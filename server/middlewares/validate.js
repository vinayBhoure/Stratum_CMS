const { ZodError } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Returns middleware that validates req.body against the given Zod schema.
 * On success, req.body is replaced with the parsed (coerced) value.
 * On failure, responds 400 with VALIDATION_ERROR.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => e.message).join(', ');
        return sendError(res, 'VALIDATION_ERROR', message, 400);
      }
      next(error);
    }
  };
}

module.exports = validate;
