import Container from "@/components/Container";
import MetaArgs from "@/components/MetaArgs";
import { Post } from "@/types";
import { Link, useLoaderData, useParams } from "react-router";

export function Component() {
  const { tag } = useParams();
  const { data } = useLoaderData();
  const { posts } = data ?? {};

  if (posts?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <i className="ri-error-warning-line text-gray-400 text-3xl" />
        <h1 className="text-xl font-semibold text-gray-600">
          No posts matching <strong>"{tag}"</strong> found
        </h1>
        <p className="text-gray-500">Explore new posts from different tags</p>
      </div>
    );
  }

  return (
    <>
      <MetaArgs
        title={`Explore posts from tag: ${tag}`}
        description="Explore and discover new posts from different tags"
      />
      <Container classname="max-w-[950px]">
        <h1 className="text-3xl font-bold my-4 capitalize">#{tag}</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <p className="text-white font-medium text-center">{post.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}

Component.displayName = "Tags";
