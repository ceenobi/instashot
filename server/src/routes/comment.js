import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { validateData } from "../middlewares/validateData.js";
import { cacheMiddleware, clearCache } from "../middlewares/cache.js";
import { createCommentSchema } from "../lib/dataSchema.js";
import {
  createComment,
  deleteComment,
  getComments,
  likeComment,
} from "../controllers/comment.js";

const router = express.Router();

router.post(
  "/create/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  validateData(createCommentSchema),
  clearCache("/api/posts/get"),
  clearCache("/api/comments/get"),
  createComment
);

router.get(
  "/get/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getComments
);

router.patch(
  "/like/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/posts/get"),
  clearCache("/api/comments/get"),
  likeComment
);

router.delete(
  "/delete/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/posts/get"),
  deleteComment
);

export default router;
