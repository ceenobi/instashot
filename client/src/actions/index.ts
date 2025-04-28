import {
  followUser,
  forgotPassword,
  loginUser,
  resendVerificationEmail,
  resetPassword,
  signUpUser,
  updatePassword,
  updateProfile,
  updateProfilePicture,
  updateUserPrivacy,
  verifyEmail,
} from "@/api/auth";
import { createComment, deleteComment, likeComment } from "@/api/comment";
import {
  createPost,
  deletePost,
  likePost,
  savePost,
  updatePost,
} from "@/api/post";
import { createStory, deleteStory, likeStory } from "@/api/story";
import {
  forgotPasswordSchema,
  userLoginSchema,
  userRegistrationSchema,
  updateProfileSchema,
  updatePasswordSchema,
} from "@/libs/dataSchema";
import { Comment, Post, Story } from "@/types";
import { AxiosError } from "axios";
import type { z } from "zod";

type LoginFormData = z.infer<typeof userLoginSchema>;
type RegisterFormData = z.infer<typeof userRegistrationSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export async function loginAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await loginUser(data as LoginFormData);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function registerAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await signUpUser(data as RegisterFormData);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function forgotPasswordAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await forgotPassword(data as ForgotPasswordFormData);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function resetPasswordAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await resetPassword(data.id as string, data.token as string, {
      password: data.password as string,
    });
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function createPostAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as Record<
    string,
    string | string[] | boolean
  >;
  data.media = formData.getAll("media") as string[];
  data.tags = formData
    .getAll("tags")
    .filter((tag): tag is string => typeof tag === "string")
    .flatMap((tag) => tag.split(",").map((c) => c.trim()))
    .filter((tag) => tag !== ""); // Filter out empty tags
  data.isPublic = formData.get("isPublic") === "true";
  try {
    if (data.type === "comment") {
      const res = await createComment(
        data.id as string,
        { content: data.content } as unknown as Comment
      );
      return res.data;
    } else if (data.type === "createStory") {
      const res = await createStory(data as unknown as Story);
      return res.data;
    } else {
      const res = await createPost(data as unknown as Post);
      return res.data;
    }
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export const sendVerifyEmailAction = async () => {
  try {
    const res = await resendVerificationEmail();
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
};

export const verifyEmailAction = async (userId: string, token: string) => {
  try {
    const res = await verifyEmail(userId, token);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
};

export const likeSaveOrCommentAction = async ({
  request,
}: {
  request: Request;
}) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    if (data.type === "like") {
      const res = await likePost(data.id as string);
      return res.data;
    } else if (data.type === "save") {
      const res = await savePost(data.id as string);
      return res.data;
    } else if (data.type === "likeComment") {
      const res = await likeComment(data.id as string);
      return res.data;
    } else if (data.type === "followUser") {
      const res = await followUser(data.id as string);
      return res.data;
    }
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
};

export async function createCommentAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const comment = { ...data } as unknown as Comment;
  try {
    const res = await createComment(data.id as string, comment);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function deletePostAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    if (data.type === "deleteComment") {
      const res = await deleteComment(data.id as string);
      return res.data;
    } else if (data.type === "deletePost") {
      const res = await deletePost(data.id as string);
      return res.data;
    }
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function updatePostAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as Record<
    string,
    string | string[] | boolean
  >;
  data.tags = formData
    .getAll("tags")
    .filter((tag): tag is string => typeof tag === "string")
    .flatMap((tag) => tag.split(",").map((c) => c.trim()))
    .filter((tag) => tag !== "");
  data.isPublic = formData.get("isPublic") === "true";
  try {
    const res = await updatePost(data.id as string, data as unknown as Post);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function userProfileAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as Record<
    string,
    string | boolean | null
  >;
  data.profilePicture = formData.get("profilePicture") as string | null;
  data.isPublic = formData.get("isPublic") === "true";
  try {
    if (data.type === "profilePicture") {
      const res = await updateProfilePicture(
        data as unknown as { profilePicture: string | null; type: string }
      );
      return res.data;
    }
    if (data.type === "updateProfile") {
      const res = await updateProfile(data as UpdateProfileFormData);
      return res.data;
    }
    if (data.type === "followUser") {
      const res = await followUser(data.id as string);
      return res.data;
    }
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function followUserAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await followUser(data.id as string);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function deleteStoryAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    if (data.type === "deleteStory") {
      const res = await deleteStory(data.id as string);
      return res.data;
    }
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function likeStoryAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await likeStory(data.id as string);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function updatePasswordAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await updatePassword(data as UpdatePasswordFormData);
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}

export async function updateUserPrivacyAction({
  request,
}: {
  request: Request;
}) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    const res = await updateUserPrivacy(
      data as unknown as { isPublic: boolean }
    );
    return res.data;
  } catch (error) {
    if (import.meta.env.VITE_APP_MODE === "development") {
      console.error(error);
    }
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    return "An unknown error occurred";
  }
}
