import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import winston from "winston";

export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.success = false;
  }
}

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log" }),
  ],
});

export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  logger.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user ? req.user.id : null,
  });

  // Handle different types of errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      })),
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          success: false,
          message: "A record with this value already exists",
        });
      case "P2025":
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      default:
        return res.status(500).json({
          success: false,
          message: "Database error occurred",
        });
    }
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // Handle default error
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;
  // const httpError = createHttpError(status, message);
  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(message); // Log the 404 warning
  res.status(404).json({
    success: false,
    message: message,
  });
};
