import { Post } from "@/types";
import { Link } from "react-router";

export default function Posts({ posts }: { posts: Post[] | null }) {
  if (posts?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-4">
        <i className="ri-error-warning-line text-gray-400 text-3xl" />
        <h1 className="text-xl font-semibold text-gray-600">No posts yet</h1>
        <p className="text-gray-500">Create posts to view them here</p>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {posts?.map((post) => (
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
  );
}
