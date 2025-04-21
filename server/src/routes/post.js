import express from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { validateData } from "../middlewares/validateData.js";
import { cacheMiddleware, clearCache } from "../middlewares/cache.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getAPost,
  updatePost,
  likePost,
  savePost,
  seeWhoLiked,
  getPostsByTag,
  explorePosts,
} from "../controllers/post.js";
import { createPostSchema } from "../lib/dataSchema.js";
import { redisClient } from "../db/redis.js";

const router = express.Router();

router.post(
  "/create",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  validateData(createPostSchema),
  clearCache("/api/posts/get"),
  createPost
);

router.get(
  "/get",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getAllPosts
);

router.get(
  "/get/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  getAPost
);

router.get(
  "/see-who-liked/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  seeWhoLiked
);

router.patch(
  "/like/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/posts/get"),
  likePost
);

router.patch(
  "/save/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/posts/get"),
  savePost
);

router.patch(
  "/update/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/posts/get"),
  updatePost
);

router.delete(
  "/delete/:id",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  clearCache("/api/posts/get"),
  deletePost
);

router.get("/tag/:tag", cacheMiddleware(600), getPostsByTag);
router.get(
  "/explore",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  cacheMiddleware(600),
  explorePosts
);

router.get(
  "/notifications",
  authenticate,
  authorizeRoles("USER", "ADMIN"),
  async function (req, res) {
    const userId = req.user.id;
    const notificationsRaw = await redisClient.lRange(
      `notifications:${userId}`,
      0,
      -1
    );
    const notifications = notificationsRaw.map(JSON.parse);
    res.json({ notifications });
  }
);

export default router;
