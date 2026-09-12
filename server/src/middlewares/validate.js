// Middleware to check if the incoming request body matches our validation rules
export const validateBody = (schema) => (req, res, next) => {
  try {
    // Validate and clean request body
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    // Pass validation error to the central error handler
    next(error);
  }
};
