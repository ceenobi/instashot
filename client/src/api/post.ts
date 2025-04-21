import axiosInstance from "@/libs/axiosInstance";
import { Post } from "@/types";

const accessToken = JSON.parse(
  localStorage.getItem("instaPixAccessToken") || "{}"
);

export const createPost = async (formData: Post) => {
  return await axiosInstance.post("/posts/create", formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updatePost = async (id: string, formData: Post) => {
  return await axiosInstance.patch(`/posts/update/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getAllPosts = async (page: string | number) => {
  return await axiosInstance.get(`/posts/get?page=${page}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
export const getAPost = async (postId: string) => {
  return await axiosInstance.get(`/posts/get/${postId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const likePost = async (postId: string) => {
  return await axiosInstance.patch(
    `/posts/like/${postId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
export const savePost = async (postId: string) => {
  return await axiosInstance.patch(
    `/posts/save/${postId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

export const deletePost = async (postId: string) => {
  return await axiosInstance.delete(`/posts/delete/${postId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getPostsByTag = async (tag: string, page: string | number) => {
  return await axiosInstance.get(`/posts/tag/${tag}?page=${page}`);
};

export const explorePosts = async (page: string | number) => {
  return await axiosInstance.get(`/posts/explore?page=${page}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getNotifications = async () => {
  return await axiosInstance.get(`/posts/notifications`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
