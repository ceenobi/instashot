import Container from "@/components/Container";
import MetaArgs from "@/components/MetaArgs";
import { Post } from "@/types";
import { Link, useLoaderData } from "react-router";

export function Component() {
  const { data } = useLoaderData();
  const { posts } = data;

  return (
    <>
      <MetaArgs
        title="Explore posts from random users based on your interactions"
        description="Profile page"
      />
      <Container classname="max-w-[950px] px-4">
        {posts?.length > 0 ? (
          <>
            <div className="my-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {posts?.map((post: Post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="aspect-square group relative overflow-hidden rounded-md"
                >
                  <img
                    src={post.media[0]}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white font-medium">{post.caption}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <i className="ri-error-warning-line text-gray-400 text-3xl" />
            <h1 className="text-xl font-semibold text-gray-600">
              Nothing to show yet
            </h1>
            <p className="text-gray-500">
              View, like, save, and comment in order to get recommendations
            </p>
          </div>
        )}
      </Container>
    </>
  );
}

Component.displayName = "Explore";
