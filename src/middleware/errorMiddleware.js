import { Prisma } from "../generated/prisma/client.ts";

/**
 * 404 Not Found Handler
 * Creates a custom 404 error message for routes that don't exist
 **/

const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global Error Handler middleware
 * Handles all errors in the application and sends appropriate responses
 * Provides detailed error messages for debugging purposes
 */

const errorHandler = (error, req, res, next) => {
  err.statusCode = error.statusCode || 500;
  err.status = err.status || "error";

  //   handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    err.statusCode = 400;
    err.message = "Invalid data provided";
  }

  // Handle Prisma unique constraint violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      err.statusCode = 400;
      err.message = `${field} already exists`;
    }
    // Handle record not found
    if (err.code === "P2025") {
      err.statusCode = 404;
      err.message = "Record not found";
    }
  }

  // Handle Prisma foreign key constraint violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      err.statusCode = 400;
      err.message = "Invalid reference: related record does not exist";
    }
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
