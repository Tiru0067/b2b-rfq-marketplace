// Central error handler so the server sends clear error messages instead of crashing
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const errorDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorDetails,
    });
  }

  // Handle standard errors with custom status codes
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
