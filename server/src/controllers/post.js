import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/errorHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../db/cloudinary.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { redisClient } from "../db/redis.js";

const prisma = new PrismaClient();

export const createPost = tryCatchFn(async (req, res) => {
  const { caption, description, media, tags, isPublic } = req.body;
  const { id } = req.user;
  try {
    let mediaFiles;
    let mediaResults;
    mediaFiles = async (files) => {
      if (files.length === 0) return { urls: [], ids: [] };
      const results = await Promise.all(
        files.map((file) =>
          uploadToCloudinary(file, {
            folder: "InstaShot/posts",
            resource_type: "auto",
            transformation: [
              { quality: "auto:eco" }, // Optimized quality for better performance
              { fetch_format: "auto" }, // Automatically choose the best format
              { height: 1080 }, // Standard HD height
              { width: 1080 }, // Standard HD width
              { crop: "limit" }, // Maintain aspect ratio
              { gravity: "auto" }, // Smart gravity for better cropping
              { effect: "sharpen" }, // Slight sharpening for better quality
              { dpr: "auto" }, // Device pixel ratio optimization
              { format: "webp" }, // WebP format for images (better compression)
              { video_codec: "h264" }, // H.264 codec for videos
              { audio_codec: "aac" }, // AAC audio codec
              { video_sampling: 30 }, // 30 FPS for videos
              { video_bit_rate: 1000 }, // 1000 kbps bitrate
              { video_sampling_rate: 24 }, // 24 FPS for smoother playback
              { video_bit_rate: 1500 }, // 1500 kbps bitrate for better quality
              { video_sampling_rate: 30 }, // 30 FPS for smoother playback
              { video_bit_rate: 2000 }, // 2000 kbps bitrate for highest quality
              { video_sampling_rate: 60 }, // 60 FPS for smoothest playback
            ],
            // transformation: [
            //   { quality: "auto" },
            //   { fetch_format: "auto" },
            //   { height: 550 },
            // ],
          })
        )
      );
      return {
        urls: results.map((result) => result.url),
        ids: results.map((result) => result.public_id),
      };
    };
    mediaResults = await mediaFiles(media);
    const post = await prisma.post.create({
      data: {
        caption,
        description,
        media: mediaResults.urls,
        mediaPublicIds: mediaResults.ids,
        tags,
        userId: id,
        isPublic,
      },
    });
    res.status(200).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    const deleteMedia = async () => {
      if (mediaResults && mediaResults.ids) {
        return Promise.all(
          mediaResults.ids.map((id) => deleteFromCloudinary(id))
        );
      }
    };
    await deleteMedia();
  }
});

export const getAllPosts = tryCatchFn(async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit) || 3;
  const skip = (page - 1) * limit;
  const totalPosts = await prisma.post.count();
  const posts = await prisma.post.findMany({
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      likes: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      savedBy: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!posts) {
    return next(new AppError("No posts found", 404));
  }
  const totalPages = Math.ceil(totalPosts / limit);
  res.status(200).json({
    success: true,
    message: "Posts fetched successfully",
    posts,
    pagination: {
      totalPosts,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    },
  });
});

export const likePost = tryCatchFn(async (req, res, next) => {
  const { id: postId } = req.params;
  const { id: userId } = req.user;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      likes: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  const userLiked = post.likes
    .map((like) => like.id.toString())
    .includes(userId);
  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      likes: {
        [userLiked ? "disconnect" : "connect"]: { id: userId },
      },
    },
    include: {
      user: true,
    },
  });

  if (!userLiked) {
    // Get the post owner
    const postOwner = await prisma.user.findUnique({
      where: { id: post.userId },
    });
    if (postOwner && post.userId !== userId) {
      const notification = {
        message: `${req.user.username} liked your post: ${post.caption}`,
        type: "POST_LIKE",
        notificationId: `post-${post.id}-${userId}`,
        postId: post.id,
        fromUser: {
          id: userId,
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
  }
  res.status(200).json({
    success: true,
    message: userLiked
      ? "Post unliked successfully"
      : "Post liked successfully",
    post,
  });
});

export const savePost = tryCatchFn(async (req, res, next) => {
  const { id: postId } = req.params;
  const { id: userId } = req.user;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      savedBy: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  const userSaved = post.savedBy
    .map((saved) => saved.id.toString())
    .includes(userId);
  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      savedBy: {
        [userSaved ? "disconnect" : "connect"]: { id: userId },
      },
    },
  });
  res.status(200).json({
    success: true,
    message: userSaved
      ? "Post unsaved successfully"
      : "Post saved successfully",
    post,
  });
});

export const getAPost = tryCatchFn(async (req, res, next) => {
  const { id: postId } = req.params;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      user: {
        select: {
          username: true,
          profilePicture: true,
        },
      },
      comments: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
              username: true,
              profilePicture: true,
            },
          },
          likes: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      likes: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      savedBy: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  res.status(200).json({
    success: true,
    post,
  });
});

export const deletePost = tryCatchFn(async (req, res, next) => {
  const { id: postId } = req.params;
  const { id: userId } = req.user;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  if (post.userId !== userId) {
    return next(new AppError("Unauthorized", 401));
  }
  try {
    for (const publicId of post.mediaPublicIds) {
      await deleteFromCloudinary(publicId);
    }
  } catch (error) {
    console.error("Error deleting media from Cloudinary:", error);
  }
  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

export const updatePost = tryCatchFn(async (req, res, next) => {
  const { id: postId } = req.params;
  const { id: userId } = req.user;
  const { caption, description, tags, isPublic } = req.body;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  if (post.userId !== userId) {
    return next(new AppError("Unauthorized", 401));
  }
  const updateData = {
    caption: caption || post.caption,
    description: description || post.description,
    tags: tags || post.tags,
    isPublic: isPublic !== undefined ? isPublic : post.isPublic,
  };
  await prisma.post.update({
    where: {
      id: postId,
    },
    data: updateData,
  });
  res.status(200).json({
    success: true,
    message: "Post updated successfully",
  });
});

export const seeWhoLiked = tryCatchFn(async (req, res, next) => {
  const { id: postId } = req.params;
  if (!postId) {
    return next(new AppError("Post ID is required", 400));
  }
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      likes: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  const getUserPromises = post.likes.map((id) =>
    prisma.user.findUnique({
      where: {
        id: id.id,
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
      },
    })
  );
  const users = await Promise.all(getUserPromises);
  res.status(200).json({
    success: true,
    users,
  });
});

export const getPostsByTag = tryCatchFn(async (req, res, next) => {
  const { tag } = req.params;
  if (!tag) {
    return next(new AppError("Tag is required", 400));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const totalPosts = await prisma.post.count({
    where: {
      tags: {
        hasSome: [tag],
      },
    },
  });
  const totalPages = Math.ceil(totalPosts / limit);

  // Fetch posts
  const posts = await prisma.post.findMany({
    skip,
    take: limit,
    where: {
      tags: {
        hasSome: [tag],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      likes: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      savedBy: {
        select: {
          id: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasMore: page < totalPages,
    },
  });
});

export const explorePosts = tryCatchFn(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  // Get the current user
  const user = req.user;

  // Get posts from users you've interacted with (liked, saved, viewed)
  const interactedPosts = await prisma.post.findMany({
    where: {
      OR: [
        { likes: { some: { id: user.id } } },
        { savedBy: { some: { id: user.id } } },
        // { views: { some: { userId: user.id } } },
      ],
    },
    select: {
      tags: true,
      userId: true,
    },
  });

  // Get all public profiles
  const publicProfiles = await prisma.user.findMany({
    where: {
      isPublic: true,
      id: {
        not: user.id,
      },
    },
    select: {
      id: true,
      // tags: true,
    },
  });

  // Get posts from public profiles
  const publicPosts = await prisma.post.findMany({
    where: {
      userId: {
        in: publicProfiles.map((profile) => profile.id),
      },
    },
    select: {
      tags: true,
    },
  });

  // Combine all tags from interacted posts and public posts
  const allTags = [
    ...new Set([
      ...interactedPosts.flatMap((post) => post.tags),
      ...publicPosts.flatMap((post) => post.tags),
    ]),
  ];

  // Get random posts that match any of the tags
  const randomPosts = await prisma.post.findMany({
    where: {
      tags: {
        hasSome: allTags,
      },
      userId: {
        not: user.id, // Exclude your own posts
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
          isPublic: true,
        },
      },
      likes: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      savedBy: {
        select: {
          id: true,
        },
      },
    },
  });

  // Get total count for pagination
  const totalPosts = await prisma.post.count({
    where: {
      tags: {
        hasSome: allTags,
      },
      userId: {
        not: user.id,
      },
    },
  });

  const totalPages = Math.ceil(totalPosts / limit);

  res.status(200).json({
    success: true,
    posts: randomPosts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasMore: page < totalPages,
    },
  });
});

// Trigger Pusher notification
// if (!userLiked) {
//   // Get the post owner
//   const postOwner = await prisma.user.findUnique({
//     where: { id: post.userId },
//   });
//   if (postOwner && post.userId !== userId) {
//     pusher.trigger("post-channel", "like-post", {
//       taskId: post.id,
//       message: `${req.user.username} liked your post: ${post.caption}`,
//       postOwner: post.userId,
//     });
//     await prisma.notification.create({
//       data: {
//         message: `${req.user.username} liked your post: ${post.caption}`,
//         type: "POST_LIKE",
//         notificationId: `post-${post.id}-${userId}`,
//         user: {
//           connect: { id: post.userId }
//         }
//       },
//     });
//   }
// }
