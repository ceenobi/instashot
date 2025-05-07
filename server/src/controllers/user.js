import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AppError } from "../middlewares/errorHandler.js";
import { generateTokens, verifyRefreshToken } from "../lib/jwt.js";
import { sendMail } from "../lib/email.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../db/cloudinary.js";
import { redisClient } from "../db/redis.js";

const prisma = new PrismaClient();

export const createUser = tryCatchFn(async (req, res, next) => {
  const { email, password, username, fullname } = req.body;
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new AppError(
      `${existingUser.email === email ? "Email" : "Username"} already exists`,
      400
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      fullname,
      password: hashedPassword,
      verificationToken: crypto.randomBytes(20).toString("hex"),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      verificationToken: true,
      fullname: true,
    },
  });
  const { accessToken, refreshToken } = generateTokens(user);
  // Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  await sendMail({
    fullname: user.fullname,
    intro: ["Welcome to Instapixs", "We're very excited to have you on board."],
    instructions: `Verify your email. Click the button below to verify.
        Link expires after 24 hours`,
    btnText: "Verify",
    subject: "Email Verification",
    to: user.email,
    link: `${process.env.CLIENT_URL}/verify-email/${user.id}/${user.verificationToken}`,
  });
  res.status(201).json({
    success: true,
    message: "User account created successfully",
    user,
    accessToken,
  });
});

export const getVerificationLink = tryCatchFn(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const updateUserData = await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken: crypto.randomBytes(20).toString("hex"),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  await sendMail({
    fullname: user.fullname,
    intro: [
      "Verify your email",
      "Do more with Instapixs after your email has been verified.",
    ],
    instructions: `Verify your email. Click the button below to verify.
        Link expires after 24 hours`,
    btnText: "Verify",
    subject: "Email Verification",
    to: user.email,
    link: `${process.env.CLIENT_URL}/verify-email/${updateUserData.id}/${updateUserData.verificationToken}`,
  });
  res.status(200).json({
    success: true,
    message: "Verification link sent successfully",
  });
});

export const loginUser = tryCatchFn(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid credentials", 401));
  }
  const { accessToken, refreshToken } = generateTokens(user);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.status(200).json({
    success: true,
    message: `Welcome back ${user.fullname}`,
    accessToken,
  });
});

export const refreshToken = tryCatchFn(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError("Refresh token required", 401));
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const tokens = generateTokens(user);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
    success: true,
    accessToken: tokens.accessToken,
  });
});

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        fullname: true,
        role: true,
        isVerified: true,
        profilePicture: true,
        bio: true,
        followers: true,
        following: true,
        isPublic: true,
      },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  const { userId, verificationToken } = req.params;
  if (!userId || !verificationToken) {
    return next(new AppError("Missing required parameters", 400));
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        verificationToken: true,
        verificationTokenExpires: true,
      },
    });
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (user.verificationToken !== verificationToken) {
      return next(new AppError("Invalid verification token", 400));
    }
    if (user.verificationTokenExpires < Date.now()) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });
      return next(
        new AppError(
          "Verification link has expired. Please request a new one",
          401
        )
      );
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return next(new AppError("Email not found", 404));
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000);
    const updateUserData = await prisma.user.update({
      where: { id: user.id },
      data: {
        token: resetToken,
        tokenExpires: resetTokenExpires,
      },
    });
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${updateUserData.id}/${resetToken}`;
    await sendMail({
      fullname: user.fullname,
      to: user.email,
      subject: "Password reset",
      intro: `You have requested a password reset for your account. If you did not make this request, please ignore this email.`,
      instructions: `Click the button below to reset your password. Link expires in 1 hour.`,
      btnText: "Reset password",
      link: resetUrl,
    });
    res.status(200).json({
      success: true,
      message: "Password reset instructions sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const recoverPassword = async (req, res, next) => {
  const { password } = req.body;
  const { id, token } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id, token },
    });
    if (!user) {
      return next(new AppError("Invalid user id or token", 401));
    }
    if (user.tokenExpires < Date.now()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          token: null,
          tokenExpires: null,
        },
      });
      return next(new AppError("Token expired", 401));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        token: null,
        tokenExpires: null,
      },
    });
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const followUser = tryCatchFn(async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: followerId } = req.params;
  if (!followerId) {
    return next(new AppError("Follower ID is required", 400));
  }
  if (userId === followerId) {
    return next(new AppError("Cannot follow yourself", 400));
  }

  // Get both users to ensure they exist
  const [user, targetUser] = await prisma.$transaction([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.user.findUnique({
      where: { id: followerId },
    }),
  ]);

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (!targetUser) {
    return next(new AppError("Target user not found", 404));
  }

  const isFollowing = user.following.includes(followerId);
  // const isFollower = targetUser.followers.includes(userId);
  if (!isFollowing) {
    // Only send notification on follow, not unfollow
    const notification = {
      message: `${user.username} started following you`,
      type: "FOLLOW",
      notificationId: `follow-${user.id}-${targetUser.id}`,
      fromUser: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
      },
      timestamp: Date.now(),
    };
    await redisClient.lPush(
      `notifications:${targetUser.id}`,
      JSON.stringify(notification)
    );
    await redisClient.lTrim(`notifications:${targetUser.id}`, 0, 15);
  }
  // Update both users in a single transaction
  await prisma.$transaction(async (tx) => {
    if (isFollowing) {
      // Unfollow: Remove from both arrays
      await tx.user.update({
        where: { id: userId },
        data: {
          following: {
            set: user.following.filter((id) => id !== followerId),
          },
        },
      });
      await tx.user.update({
        where: { id: followerId },
        data: {
          followers: {
            set: targetUser.followers.filter((id) => id !== userId),
          },
        },
      });
    } else {
      await tx.user.update({
        where: { id: userId },
        data: {
          following: {
            set: [...user.following, followerId],
          },
        },
      });
      await tx.user.update({
        where: { id: followerId },
        data: {
          followers: {
            set: [...targetUser.followers, userId],
          },
        },
      });
    }
  });

  res.status(200).json({
    success: true,
    message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
  });
});

export const getAUser = tryCatchFn(async (req, res, next) => {
  const { username } = req.params;
  if (!username) {
    return next(new AppError("Username params is missing", 400));
  }
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
      fullname: true,
      role: true,
      isVerified: true,
      profilePicture: true,
      bio: true,
      followers: true,
      following: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      savedPosts: true,
      likedPosts: true,
      posts: true,
    },
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfilePicture = tryCatchFn(async (req, res, next) => {
  const { profilePicture } = req.body;
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (user.profilePhotoId) {
    await deleteFromCloudinary(user.profilePhotoId);
  }
  try {
    const uploadResult = await uploadToCloudinary(profilePicture, {
      folder: "instaShot/profiles",
      transformation: [
        { width: 500, height: 500, crop: "fill" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profilePicture: uploadResult.url,
        profilePhotoId: uploadResult.public_id,
      },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error(error);
    if (user.profilePhotoId) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          profilePicture: user.profilePicture,
          profilePhotoId: user.profilePhotoId,
        },
      });
    }
    return next(new AppError("Failed to upload profile picture", 500));
  }
});

export const updateProfile = tryCatchFn(async (req, res, next) => {
  const { fullname, bio, isPublic, email, username } = req.body;
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      fullname: fullname || user.fullname,
      bio: bio || user.bio,
      isPublic: isPublic || user.isPublic,
      email: email || user.email,
      username: username || user.username,
    },
  });
  res.status(200).json({
    success: true,
    user: updatedUser,
    message: "Profile updated successfully",
  });
});

export const getUserConnections = tryCatchFn(async (req, res, next) => {
  const { username } = req.params;
  const { type = "followers" } = req.query;

  if (!username) {
    return next(new AppError("Username is required", 400));
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const connections = await prisma.user.findMany({
    where: {
      id: { in: type === "followers" ? user.followers : user.following },
    },
  });

  res.status(200).json({
    success: true,
    connections,
    type,
  });
});

export const search = tryCatchFn(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return next(new AppError("Search query is required", 400));
  }
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { fullname: { contains: query } },
        { username: { contains: query } },
        { bio: { contains: query } },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      fullname: true,
      role: true,
      profilePicture: true,
      bio: true,
      followers: true,
      following: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const posts = await prisma.post.findMany({
    where: {
      tags: {
        has: query,
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
    },
  });
  res.status(200).json({
    success: true,
    users,
    posts,
  });
});

export const getSuggestions = tryCatchFn(async (req, res, next) => {
  const { id: userId } = req.user;
  // Get your followers
  const followers = await prisma.user.findMany({
    where: {
      following: {
        has: userId,
      },
    },
    select: {
      id: true,
    },
  });

  // Get users who follow your followers but whom you haven't followed
  let suggestedUsers = [];
  if (followers.length === 0) {
    // Suggest all users except yourself and those you already follow
    suggestedUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        NOT: {
          followers: { has: userId }, // Exclude users you already follow
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullname: true,
        role: true,
        profilePicture: true,
        bio: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        followers: true,
        following: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    });
  } else {
    // Your original logic
    suggestedUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            following: {
              hasSome: followers.map((follower) => follower.id),
            },
          },
          {
            NOT: {
              OR: [
                { id: userId }, // Exclude yourself
                {
                  following: {
                    has: userId,
                  },
                }, // Exclude users you already follow
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullname: true,
        role: true,
        profilePicture: true,
        bio: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        followers: true,
        following: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
    });
  }

  // Sort by follower count in memory
  const sortedUsers = suggestedUsers.sort(
    (a, b) => b.followers.length - a.followers.length
  );

  // Transform the result to match the expected format
  const formattedUsers = sortedUsers.map((user) => ({
    ...user,
    followers: user.followers.length,
    following: user.following.length,
  }));

  res.status(200).json({
    success: true,
    users: formattedUsers,
  });
});

export const updateUserPassword = tryCatchFn(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });
  if (!user) {
    return next(new AppError("Invalid user", 401));
  }
  if (!user.password) {
    return next(new AppError("User has no password", 401));
  }
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid current password", 401));
  }
  if (newPassword !== confirmPassword) {
    return next(
      new AppError("New password and confirm password do not match", 401)
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });
  res.status(200).json({
    success: true,
    message: "Password updated!, Login again",
  });
});

export const updateUserPrivacy = tryCatchFn(async (req, res, next) => {
  const { isPublic } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { isPublic: isPublic === "true" ? true : false },
    select: {
      id: true,
      isPublic: true,
    },
  });
  if (!updatedUser) {
    return next(new AppError("Failed to update privacy setting", 500));
  }
  res.status(200).json({
    success: true,
    user: updatedUser,
    message: "Privacy updated!",
  });
});

export const deleteAccount = tryCatchFn(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      posts: true,
      comments: true,
      story: true,
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  // Delete all posts and their media
  for (const post of user.posts) {
    if (post.mediaPublicIds && post.mediaPublicIds.length > 0) {
      await Promise.all(
        post.mediaPublicIds.map((id) => deleteFromCloudinary(id))
      );
    }
  }

  // Delete all stories and their media
  for (const story of user.story) {
    if (story.mediaPublicIds && story.mediaPublicIds.length > 0) {
      await Promise.all(
        story.mediaPublicIds.map((id) => deleteFromCloudinary(id))
      );
    }
  }

  // Delete user's profile picture if exists
  if (user.profilePhotoId) {
    await deleteFromCloudinary(user.profilePhotoId);
  }

  // Delete all user's data in order of dependencies
  await prisma.$transaction([
    // Delete comments first since they depend on posts
    prisma.comment.deleteMany({
      where: { userId: user.id },
    }),
    // Delete posts and their media
    prisma.post.deleteMany({
      where: { userId: user.id },
    }),
    // Delete stories and their media
    prisma.story.deleteMany({
      where: { userId: user.id },
    }),
    // Finally delete the user
    prisma.user.delete({
      where: { id: user.id },
    }),
  ]);
  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});
