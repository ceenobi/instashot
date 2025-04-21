import {
  getAUser,
  getAuthUser,
  getSuggestions,
  getUserConnections,
} from "@/api/auth";
import { getComments } from "@/api/comment";
import { explorePosts, getAllPosts, getAPost, getPostsByTag } from "@/api/post";
import { getStories, getStory } from "@/api/story";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
const accessToken = JSON.parse(
  localStorage.getItem("instaPixAccessToken") || "{}"
);

export const getAuth = async () => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["authUser"],
    queryFn: () => getAuthUser(accessToken),
  });
};

export const getUserProfile = async (username: string) => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["user", username],
    queryFn: () => getAUser(username),
  });
};

export const getUserConnects = async (username: string, type: string) => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["connections", username, type],
    queryFn: () => getUserConnections(username, type),
  });
};

export const getPosts = async ({ request }: { request: Request }) => {
  if (!accessToken) return;
  const page = new URL(request.url).searchParams.get("page") || 1;
  return await queryClient.fetchQuery({
    queryKey: ["posts", page],
    queryFn: () => getAllPosts(page),
  });
};

export const getPost = async (postId: string) => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["post", postId],
    queryFn: () => getAPost(postId),
  });
};

export const getPostComments = async (postId: string) => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
  });
};

export const getTags = async ({
  request,
  tag,
}: {
  request: Request;
  tag: string;
}) => {
  if (!accessToken) return;
  const page = new URL(request.url).searchParams.get("page") || 1;
  return await queryClient.fetchQuery({
    queryKey: ["tagPosts", page],
    queryFn: () => getPostsByTag(tag, page),
  });
};

export const getExplorePosts = async ({ request }: { request: Request }) => {
  if (!accessToken) return;
  const page = new URL(request.url).searchParams.get("page") || 1;
  return await queryClient.fetchQuery({
    queryKey: ["explorePosts", page],
    queryFn: () => explorePosts(page),
  });
};

export const getUserSuggestions = async () => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["suggestions"],
    queryFn: () => getSuggestions(),
  });
};

export const getUserStories = async () => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["stories"],
    queryFn: () => getStories(),
  });
};

export const getUserStory = async (username: string) => {
  if (!accessToken) return;
  return await queryClient.fetchQuery({
    queryKey: ["story", username],
    queryFn: () => getStory(username),
  });
};
