import axiosInstance from "@/libs/axiosInstance";
import { Comment } from "@/types";

const accessToken = JSON.parse(
  localStorage.getItem("instaPixAccessToken") || "{}"
);

export const createComment = async (postId: string, formData: Comment) => {
  return await axiosInstance.post(`/comments/create/${postId}`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getComments = async (postId: string) => {
  return await axiosInstance.get(`/comments/get/${postId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const likeComment = async (commentId: string) => {
  return await axiosInstance.patch(
    `/comments/like/${commentId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const deleteComment = async (commentId: string) => {
  return await axiosInstance.delete(`/comments/delete/${commentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
