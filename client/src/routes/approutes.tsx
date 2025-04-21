import { createBrowserRouter, RouteObject } from "react-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LazySpinner } from "@/components/Spinner";
import {
  createCommentAction,
  createPostAction,
  deletePostAction,
  deleteStoryAction,
  followUserAction,
  forgotPasswordAction,
  likeSaveOrCommentAction,
  likeStoryAction,
  loginAction,
  registerAction,
  resetPasswordAction,
  sendVerifyEmailAction,
  updatePasswordAction,
  updatePostAction,
  updateUserPrivacyAction,
  userProfileAction,
  verifyEmailAction,
} from "@/actions";
import {
  getAuth,
  getExplorePosts,
  getPost,
  getPosts,
  getTags,
  getUserConnects,
  getUserProfile,
  getUserStories,
  getUserStory,
  getUserSuggestions,
} from "@/loaders";
import { deleteAccount } from "@/api/auth";
import { getNotifications } from "@/api/post";

const routes = [
  {
    errorElement: <ErrorBoundary />,
    id: "authUser",
    lazy: () => import("."),
    loader: getAuth,
    hydrateFallbackElement: <LazySpinner />,
    children: [
      {
        path: "auth",
        lazy: () => import("../layouts/auth"),
        children: [
          {
            path: "login",
            lazy: () => import("../pages/login"),
            action: loginAction,
          },
          {
            path: "register",
            lazy: () => import("../pages/register"),
            action: registerAction,
          },
          {
            path: "forgot-password",
            lazy: () => import("../pages/forgotPassword"),
            action: forgotPasswordAction,
          },
          {
            path: "reset-password/:id/:token",
            lazy: () => import("../pages/forgotPassword/resetPassword"),
            action: resetPasswordAction,
          },
        ],
      },
      {
        path: "google-redirect",
        lazy: () => import("../pages/googleRedirect"),
      },
      {
        path: "/",
        id:"notifications",
        lazy: () => import("../layouts/root"),
        loader: getNotifications,
        children: [
          {
            index: true,
            lazy: () => import("../pages/home"),
            loader: async ({ request }) => {
              const [
                postsData,
                suggestionsData,
                storiesData,
              ] = await Promise.all([
                getPosts({ request }),
                getUserSuggestions(),
                getUserStories(),
              ]);
              return {
                postsFeeds: postsData,
                suggestions: suggestionsData?.data,
                stories: storiesData?.data,
              };
            },
            action: ({ request }) => {
              if (request.method === "POST") {
                return createPostAction({ request });
              } else if (request.method === "PATCH") {
                return likeSaveOrCommentAction({ request });
              }
            },
          },
          {
            path: "post/:id",
            lazy: () => import("../pages/comments"),
            loader: ({ params }) => getPost(params.id ?? "postId"),
            action: ({ request }) => {
              if (request.method === "POST") {
                return createCommentAction({ request });
              } else if (request.method === "PATCH") {
                return likeSaveOrCommentAction({ request });
              } else if (request.method === "DELETE") {
                return deletePostAction({ request });
              }
            },
          },
          {
            path: "post/edit/:id",
            lazy: () => import("../pages/editPost"),
            loader: ({ params }) => getPost(params.id ?? "postId"),
            action: updatePostAction,
          },
          {
            id: "getUserProfile",
            path: "profile/:username",
            lazy: () => import("../pages/profile"),
            loader: ({ params }) =>
              getUserProfile(params.username ?? "username"),
            action: ({ request }) => {
              if (request.method === "PATCH") {
                return userProfileAction({ request });
              }
            },
            children: [
              {
                path: ":type/connections",
                lazy: () => import("../pages/profile/components/Followers"),
                loader: ({ params }) =>
                  getUserConnects(
                    params.username ?? "username",
                    params.type ?? "type"
                  ),
                action: followUserAction,
              },
              {
                path: ":type/connects",
                lazy: () => import("../pages/profile/components/Following"),
                loader: ({ params }) =>
                  getUserConnects(
                    params.username ?? "username",
                    params.type ?? "type"
                  ),
                action: followUserAction,
              },
              {
                path: "saved",
                lazy: () => import("../pages/profile/savedPost"),
              },
              {
                path: "likes",
                lazy: () => import("../pages/profile/likedPost"),
              },
            ],
          },
          {
            path: "tag/:tag",
            lazy: () => import("../pages/tags"),
            loader: ({ request, params }) =>
              getTags({ request, tag: params.tag ?? "tag" }),
          },
          {
            path: "explore",
            lazy: () => import("../pages/explore"),
            loader: getExplorePosts,
          },
          {
            path: "settings",
            lazy: () => import("../pages/settings"),
            children: [
              {
                path: "update-password",
                lazy: () => import("../pages/settings/updatePassword"),
                action: updatePasswordAction,
              },
              {
                path: "account-privacy",
                lazy: () => import("../pages/settings/accountPrivacy"),
                action: updateUserPrivacyAction,
              },
              {
                path: "delete-account",
                lazy: () => import("../pages/settings/deleteAccount"),
                action: deleteAccount,
              },
            ],
          },
        ],
      },
      {
        path: "stories",
        lazy: () => import("../layouts/story"),
        children: [
          {
            path: ":username",
            lazy: () => import("../pages/stories"),
            loader: async ({ params }) => {
              const [story, storiesData] = await Promise.all([
                getUserStory(params.username ?? "username"),
                getUserStories(),
              ]);
              return {
                story: story?.data,
                stories: storiesData?.data,
              };
            },
            action: ({ request }) => {
              if (request.method === "DELETE") {
                return deleteStoryAction({ request });
              } else {
                return likeStoryAction({ request });
              }
            },
          },
        ],
      },
      {
        lazy: () => import("../layouts/verify"),
        children: [
          {
            path: "verify-email",
            lazy: () => import("../pages/verifyEmail"),
            action: sendVerifyEmailAction,
          },
        ],
      },
      {
        path: "verify-email/:id/:token",
        lazy: () => import("../pages/verifyEmail/VerifyAccount"),
        action: ({ params }) =>
          verifyEmailAction(params.id as string, params.token as string),
      },
    ],
  },
] as RouteObject[];

export default function Router() {
  const router = createBrowserRouter(routes);
  return router;
}
