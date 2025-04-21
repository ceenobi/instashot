import { PrismaClient } from "@prisma/client";
import tryCatchFn from "../lib/tryCatchFn.js";
import { AppError } from "../middlewares/errorHandler.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../db/cloudinary.js";

const prisma = new PrismaClient();

export const createStory = tryCatchFn(async (req, res, next) => {
  const { media, caption } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    let mediaFiles;
    let mediaResults;
    mediaFiles = async (files) => {
      if (files.length === 0) return { urls: [], ids: [] };
      const results = await Promise.all(
        files.map((file) =>
          uploadToCloudinary(file, {
            folder: "InstaShot/stories",
            resource_type: "auto",
            transformation: [
              { quality: "auto" },
              { fetch_format: "auto" },
              { height: 550 },
            ],
          })
        )
      );
      return {
        urls: results.map((result) => result.url),
        ids: results.map((result) => result.public_id),
      };
    };
    mediaResults = await mediaFiles(media);
    const story = await prisma.story.create({
      data: {
        caption,
        media: mediaResults.urls,
        mediaPublicIds: mediaResults.ids,
        user: { connect: { id: user.id } },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story,
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

export const getStories = tryCatchFn(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      story: true,
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Get all user IDs that the current user follows (including themselves)
  const followedUserIds = [user.id, ...user.following];

  const stories = await prisma.story.findMany({
    where: {
      userId: {
        in: followedUserIds,
      },
      expiresAt: {
        gt: new Date(),
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
      storyLikes: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      viewers: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const uniqueStories = Array.from(
    new Map(stories.map((story) => [story.userId, story])).values()
  );

  res.status(200).json({
    success: true,
    message: "Stories fetched successfully",
    stories: uniqueStories,
  });
});

export const getStory = tryCatchFn(async (req, res, next) => {
  const { username } = req.params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      story: {
        include: {
          viewers: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Update story views for each story
  const updatedStories = await Promise.all(
    user.story.map(async (story) => {
      // Only update if the story hasn't expired
      if (new Date(story.expiresAt) > new Date()) {
        const hasViewed = story.viewers.some(
          (viewer) => viewer.id === req.user.id
        );
        if (!hasViewed) {
          // Get the story owner
          const storyOwner = await prisma.user.findUnique({
            where: { id: story.userId },
          });
          
          // Update story with new viewer
          const updatedStory = await prisma.story.update({
            where: { id: story.id },
            data: {
              views: story.views + 1,
              viewers: {
                connect: [{ id: req.user.id }],
              },
            },
            include: {
              viewers: {
                select: {
                  id: true,
                  username: true,
                  profilePicture: true,
                },
              },
              storyLikes: {
                select: {
                  id: true,
                  username: true,
                  profilePicture: true,
                },
              },
            },
          });

          // If this is the story owner's story, trigger notification
          // if (storyOwner && story.userId !== req.user.id) {
          //   pusher.trigger("story-channel", "story-viewed", {
          //     taskId: story.id,
          //     message: `${req.user.username} viewed your story`,
          //     storyOwner: story.userId,
          //   });
          //   await prisma.notification.create({
          //     data: {
          //       message: `${req.user.username} viewed your story`,
          //       type: "STORY_VIEW",
          //       notificationId: `story-view-${story.id}-${req.user.id}`,
          //       userId: story.userId, // Send to story owner
          //     },
          //   });
          // }
          return updatedStory;
        }
        return story;
      }
      return story;
    })
  );
  // Filter out expired stories
  const activeStories = updatedStories.filter(
    (story) => new Date(story.expiresAt) > new Date()
  );

  res.status(200).json({
    success: true,
    message: "Stories fetched successfully",
    stories: activeStories,
  });
});

export const deleteStory = tryCatchFn(async (req, res, next) => {
  const { id: storyId } = req.params;
  const { id: userId } = req.user;
  if (!storyId) {
    return next(new AppError("Story ID is required", 400));
  }
  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
    },
  });
  if (!story) {
    return next(new AppError("Story not found", 404));
  }
  if (story.userId !== userId) {
    return next(new AppError("Unauthorized", 401));
  }
  await prisma.$transaction(async (tx) => {
    // Delete media from Cloudinary
    for (const publicId of story.mediaPublicIds) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error(
          `Error deleting media ${publicId} from Cloudinary:`,
          error
        );
      }
    }
    await tx.story.delete({
      where: {
        id: storyId,
      },
    });
  });
  res.status(200).json({
    success: true,
    message: "Story deleted successfully",
  });
});

export const likeStory = tryCatchFn(async (req, res, next) => {
  const { id: storyId } = req.params;
  const { id: userId } = req.user;
  if (!storyId) {
    return next(new AppError("Story ID is required", 400));
  }
  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
    },
    include: {
      storyLikes: {
        select: {
          id: true,
        },
      },
    },
  });
  if (!story) {
    return next(new AppError("Story not found", 404));
  }
  const userLiked = story.storyLikes
    .map((like) => like.id.toString())
    .includes(userId);
  await prisma.story.update({
    where: {
      id: storyId,
    },
    data: {
      storyLikes: {
        [userLiked ? "disconnect" : "connect"]: { id: userId },
      },
    },
  });
  if (!userLiked) {
    // Get the story owner
    const storyOwner = await prisma.user.findUnique({
      where: { id: story.userId },
    });
    
    if (storyOwner && story.userId !== userId) {
      pusher.trigger("story-channel", "like-story", {
        taskId: story.id,
        message: `${req.user.username} liked your story: ${story.caption}`,
        storyOwner: story.userId,
      });
      await prisma.notification.create({
        data: {
          message: `${req.user.username} liked your story: ${story.caption}`,
          type: "STORY_LIKE",
          notificationId: `story-${story.id}-${userId}`,
          userId: story.userId, // Send to story owner
        },
      });
    }
  }
  res.status(200).json({
    success: true,
    message: userLiked
      ? "Story unliked successfully"
      : "Story liked successfully",
    story,
  });
});

//not used
export const seeWhoLiked = tryCatchFn(async (req, res, next) => {
  const { id: storyId } = req.params;
  if (!storyId) {
    return next(new AppError("Story ID is required", 400));
  }
  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
    },
    include: {
      storyLikes: true,
    },
  });
  if (!story) {
    return next(new AppError("Story not found", 404));
  }
  const users = story.storyLikes.map((like) => ({
    id: like.id,
    username: like.username,
    profilePicture: like.profilePicture,
  }));
  res.status(200).json({
    success: true,
    users,
  });
});
