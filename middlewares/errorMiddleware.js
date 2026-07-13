/**
 * Global Error Handling Middleware
 * Catches all errors thrown in routes/controllers and formats them consistently.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for the developer
  console.error(`[Error] ${err.message}`);

  // Default status code is 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    // Only include stack trace in development mode for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
