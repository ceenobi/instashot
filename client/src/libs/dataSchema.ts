import { z } from "zod";

export const userRegistrationSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  fullname: z.string().min(3, {
    message: "Fullname must be at least 3 characters long",
  }),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().min(3, {
    message: "Email must be at least 3 characters long",
  }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  fullname: z.string().min(3, {
    message: "Fullname must be at least 3 characters long",
  }),
  bio: z.string().min(3, {
    message: "Bio must be at least 3 characters long",
  }),
  isPublic: z.boolean(),
  email: z.string().email(),
});

export const createPostSchema = z.object({
  caption: z.string().min(3, {
    message: "Caption must be at least 3 characters long",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters long",
  }),
  isPublic: z.boolean(),
});

export const commentSchema = z.object({
  content: z.string().min(3, {
    message: "Comment must be at least 3 characters long",
  }),
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
