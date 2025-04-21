import { z } from "zod";

export const userRegistrationSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  fullname: z.string(),
});

export const userLoginSchema = z.object({
  email: z.string(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const recoverPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const createPostSchema = z.object({
  caption: z.string().min(3, {
    message: "Caption must be at least 3 characters long",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters long",
  }),
  media: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean(),
});

export const createCommentSchema = z.object({
  content: z.string().min(3, {
    message: "Comment must be at least 3 characters long",
  }),
});

export const profilePictureSchema = z.object({
  profilePicture: z.string(),
  type: z.string(),
});

export const updateProfileSchema = z.object({
  fullname: z.string(),
  bio: z.string().max(150, {
    message: "Bio must be at most 150 characters long",
  }),
  isPublic: z.boolean(),
  email: z.string().email(),
  username: z.string(),
});

export const createStorySchema = z.object({
  caption: z.string().optional(),
  media: z.array(z.string()),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Current Password must be at least 8 characters long",
  }),
  newPassword: z.string().min(8, {
    message: "New Password must be at least 8 characters long",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm Password must be at least 8 characters long",
  }),
});
