import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { validateData } from "../middlewares/validateData.js";
import { cacheMiddleware, clearCache } from "../middlewares/cache.js";
import { createStorySchema } from "../lib/dataSchema.js";
import {
  createStory,
  deleteStory,
  getStories,
  getStory,
  likeStory,
} from "../controllers/story.js";

const router = express.Router();

router.post(
  "/create",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  validateData(createStorySchema),
  clearCache("/api/stories/get"),
  createStory
);

router.get(
  "/get",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getStories
);

router.get(
  "/get/:username",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getStory
);

router.delete(
  "/delete/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/stories/get"),
  deleteStory
);

router.patch(
  "/like/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/stories/get"),
  likeStory
);

export default router;
