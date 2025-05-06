import MetaArgs from "@/components/MetaArgs";
import { Post, User } from "@/types";
import { Link, useOutletContext, useRouteLoaderData } from "react-router";

export function Component() {
  const { data } = useRouteLoaderData("getUserProfile");
  const { user } = useOutletContext() as { user: User };
  const { user: profileData } = data || {};

  const isAuthorized = user?.id === profileData?.id;

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-4">
        <i className="ri-error-warning-line text-gray-400 text-3xl" />
        <h1 className="text-xl font-semibold text-gray-600">
          You cannot view this page
        </h1>
        <p className="text-gray-500">This content is private</p>
      </div>
    );
  }

  if (isAuthorized && profileData?.likedPosts?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-4">
       <i className="ri-error-warning-line text-gray-400 text-3xl" />
        <h1 className="text-xl font-semibold text-gray-600">
          No liked posts yet
        </h1>
        <p className="text-gray-500">Like posts to view them here later</p>
      </div>
    );
  }

  return (
    <>
      <MetaArgs
        title={`Liked posts - (@${profileData?.username})`}
        description="Profile page"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {profileData?.likedPosts?.map((post: Post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="aspect-square group relative overflow-hidden rounded-md"
          >
            <img
              src={post.media[0]}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-md"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <p className="text-white font-medium text-center">{post.caption}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

Component.displayName = "LikedPost";
