import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import {
  createUser,
  followUser,
  getAUser,
  getSessionUser,
  getSuggestions,
  getUserConnections,
  getVerificationLink,
  loginUser,
  logoutUser,
  refreshToken,
  resetPassword,
  search,
  recoverPassword,
  updateProfile,
  updateProfilePicture,
  verifyEmail,
  updateUserPassword,
  updateUserPrivacy,
  deleteAccount,
} from "../controllers/user.js";
import { validateData } from "../middlewares/validateData.js";
import {
  profilePictureSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  userLoginSchema,
  userRegistrationSchema,
} from "../lib/dataSchema.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
  cacheMiddleware,
  clearCache,
  clearDbCache,
} from "../middlewares/cache.js";

const router = express.Router();

router.post("/register", validateData(userRegistrationSchema), createUser);
router.post("/login", rateLimiter, validateData(userLoginSchema), loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", clearCache("/api/auth/profile"), logoutUser);
router.post(
  "/reset-password",
  rateLimiter,
  validateData(recoverPasswordSchema),
  resetPassword
);
router.post(
  "/resend-verification-email",
  rateLimiter,
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  getVerificationLink
);

router.patch(
  "/verifyEmail/:userId/:verificationToken",
  rateLimiter,
  verifyEmail
);

router.patch(
  "/update-password/:id/:token",
  rateLimiter,
  validateData(resetPasswordSchema),
  recoverPassword
);

router.get(
  "/user",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  getSessionUser
);

router.get(
  "/profile/:username",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getAUser
);

router.patch(
  "/follow/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  rateLimiter,
  clearCache("/api/auth/profile"),
  clearCache("/api/auth/suggestions"),
  clearCache("/api/auth/connections"),
  followUser
);

router.patch(
  "/updateProfilePicture",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  validateData(profilePictureSchema),
  clearCache("/api/auth/profile"),
  updateProfilePicture
);

router.patch(
  "/updateProfile",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  rateLimiter,
  validateData(updateProfileSchema),
  clearCache("/api/auth/profile"),
  updateProfile
);

router.get(
  "/connections/:username",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getUserConnections
);

router.get("/search", authenticate, authorizeRoles("USER", "ADMIN"), search);

router.get(
  "/suggestions",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getSuggestions
);

router.patch(
  "/update-password",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  validateData(updatePasswordSchema),
  updateUserPassword
);

router.patch(
  "/update-privacy",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  updateUserPrivacy
);

router.delete(
  "/delete-account",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/auth/profile"),
  clearDbCache,
  deleteAccount
);

export default router;
