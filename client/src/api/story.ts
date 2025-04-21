import axiosInstance from "@/libs/axiosInstance";
import { Story } from "@/types";

const accessToken = JSON.parse(
  localStorage.getItem("instaPixAccessToken") || "{}"
);

export const createStory = async (formData: Story) => {
  return await axiosInstance.post("/stories/create", formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getStories = async () => {
  return await axiosInstance.get("/stories/get", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getStory = async (username: string) => {
  return await axiosInstance.get(`/stories/get/${username}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const deleteStory = async (storyId: string) => {
  return await axiosInstance.delete(`/stories/delete/${storyId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const likeStory = async (storyId: string) => {
  return await axiosInstance.patch(
    `/stories/like/${storyId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
