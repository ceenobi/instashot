import { rateLimit } from "express-rate-limit";
import createHttpError from "http-errors"

// Separate limits for different routes
export const rateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 attempts
  message: "Too many attempts, please try again later",
});