import { env } from "../config/environment.js";

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Centralized Global Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose CastError (e.g., malformed ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: `Invalid resource identifier format for '${err.path}'.`,
    });
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: messages[0] || "Validation failed.",
      details: messages,
    });
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      error: `An entry with this ${field} already exists.`,
    });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid authentication token signature.",
    });
  }

  // Multer File Upload Errors
  if (err.name === "MulterError") {
    let message = err.message || "File upload validation failed.";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the 5 MB maximum limit.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded. Maximum 5 image proof files allowed.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Unexpected upload field '${err.field}'. Allowed fields are 'images' or 'evidence'.`;
    }
    return res.status(400).json({
      success: false,
      error: message,
      code: err.code,
    });
  }

  // Default Server Error
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred."
      : err.message || "Internal server error.";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
