import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/errorHandler.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { redisClient } from "../db/redis.js";

const prisma = new PrismaClient();

export const createComment = tryCatchFn(async (req, res, next) => {
  const { content } = req.body;
  const { id } = req.user;
  const { id: postId } = req.params;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId: id,
    },
  });
  if (post.userId !== user.id) {
    const notification = {
      message: `${user.username} commented your post: ${post.caption}`,
      type: "COMMENT",
      notificationId: `post-${post.id}-${user.id}`,
      postId: post.id,
      fromUser: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      timestamp: Date.now(),
    };
    // Store notification in Redis for the post owner
    await redisClient.lPush(
      `notifications:${post.userId}`,
      JSON.stringify(notification)
    );
    // Optionally trim to keep only the latest 50 notifications
    await redisClient.lTrim(`notifications:${post.userId}`, 0, 15);
  }
  res.status(201).json({
    success: true,
    message: "Comment posted successfully",
    comment,
  });
});

export const getComments = tryCatchFn(async (req, res, next) => {
  const { id: postId } = req.params;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const comments = await prisma.comment.findMany({
    where: {
      postId,
    },
    include: {
      user: {
        select: {
          username: true,
          profilePicture: true,
        },
      },
      likes: true,
    },
  });
  res.status(200).json({
    success: true,
    message: "Comments fetched successfully",
    comments,
  });
});

export const likeComment = tryCatchFn(async (req, res, next) => {
  const { id: commentId } = req.params;
  const { id: userId } = req.user;
  if (!commentId) {
    return next(new AppError("Comment ID is required", 400));
  }
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      likes: true,
    },
  });
  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }
  const userLiked = comment.likes
    .map((like) => like.id.toString())
    .includes(userId);
  await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      likes: {
        [userLiked ? "disconnect" : "connect"]: { id: userId },
      },
    },
  });
  res.status(200).json({
    success: true,
    message: userLiked
      ? "Comment unliked successfully"
      : "Comment liked successfully",
    comment,
  });
});

export const deleteComment = tryCatchFn(async (req, res, next) => {
  const { id: commentId } = req.params;
  const { id: userId } = req.user;
  if (!commentId) {
    return next(new AppError("Comment ID is required", 400));
  }
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
  });
  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }
  if (comment.userId !== userId) {
    return next(
      new AppError("You are not authorized to delete this comment", 401)
    );
  }
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
