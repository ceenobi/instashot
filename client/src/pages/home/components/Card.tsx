import useSlideControl from "@/hooks/useSlideControl";
import useVideoControl from "@/hooks/useVideoControl";
import { Comment, Post, Story, User } from "@/types";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import TimeAgo from "timeago-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { commentSchema } from "@/libs/dataSchema";
import CardOptions from "./CardOptions";
import SeeLikes from "./SeeLikes";
import { ImageContainer, VideoContainer } from "@/components/MediaContainer";

function Card({
  post,
  user,
  userStories,
}: {
  post: Post;
  user: User;
  userStories: Story[];
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const { currentImageIndex, handlePrevious, handleNext } = useSlideControl(
    post?.media
  );
  const { videoRef, isPlaying, handlePlayPause } = useVideoControl();
  const [isPostLiked, setIsPostLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCount] = useState<number>(post?.likes?.length || 0);
  const [isPostSaved, setIsSaved] = useState<boolean>(
    Boolean(post?.savedBy?.some((saved) => saved.id === user?.id))
  );
  const isSaved = useMemo(() => isPostSaved, [isPostSaved]);
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(commentSchema),
  });
  const hasStory = userStories.some((story) => story.userId === post.userId);

  useEffect(() => {
    if (post?.likes) {
      const initialLikes = Object.fromEntries(
        post.likes.map((like: { id: string }) => [like.id, true])
      );
      setIsPostLiked(initialLikes);
      setLikeCount(post?.likes?.length);
    }
  }, [post?.likes, setLikeCount, user?.id]);

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.success) {
      //toast.success(fetcher.data.message, { id: "likeSave" });
      setLikeCount(fetcher.data.post?.like?.length || 0);
      setIsPostLiked((prev: Record<string, boolean>) => {
        const liked = !!prev[user.id];
        return { ...prev, [user.id]: !liked };
      });
      if (fetcher.data.comment) {
        toast.success(fetcher.data.message, {
          id: "comment-success",
        });
        setComments((prev) => [...prev, fetcher.data.comment]);
        reset();
      }
    } else if (!fetcher.data.success) {
      toast.error(fetcher.data.message || fetcher.data.error, {
        id: "handleLike-error",
      });
    }
  }, [user.id, fetcher.data, reset]);

  const handleLikeOrSave = useCallback(
    (type: string) => {
      switch (type) {
        case "like":
          // setIsPostLiked((prev: Record<string, boolean>) => {
          //   const liked = !!prev[user.id];
          //   setLikeCount((prevCount) =>
          //     liked ? Math.max(prevCount - 1, 0) : prevCount + 1
          //   );
          //   return { ...prev, [user.id]: !liked };
          // });
          fetcher.submit(
            { id: post.id, type },
            { method: "patch", action: "/?index" }
          );
          break;
        case "save":
          setIsSaved((prev: boolean) => !prev);
          fetcher.submit(
            { id: post.id, type },
            { method: "patch", action: "/?index" }
          );
          break;
        default:
          break;
      }
    },
    [fetcher, post.id]
  );

  const onSubmit = (data: FieldValues) => {
    fetcher.submit(
      {
        ...data,
        id: post.id,
        type: "comment",
      },
      { method: "post", action: "/?index" }
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    return <TimeAgo datetime={timestamp} locale="en-US" />;
  };

  return (
    <>
      <div className="divider"></div>
      <div className="lg:w-[450px] 2xl:w-[600px] md:rounded-md">
        <div className="py-2">
          <div className="mb-2 flex items-center justify-between px-4 md:px-0">
            <div className="flex items-center gap-3">
              <div
                className={`avatar avatar-placeholder ${
                  hasStory ? "border-2 border-secondary rounded-full" : ""
                }`}
              >
                <div className="w-12 rounded-full border border-gray-300">
                  {post?.user?.profilePicture ? (
                    <img
                      src={post?.user?.profilePicture}
                      alt={post?.user?.username}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-3xl">
                      {post?.user?.username?.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Link
                  to={`/profile/${post?.user?.username}`}
                  className="font-semibold"
                >
                  {post?.user?.username}
                </Link>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(post?.createdAt)}
                </p>
              </div>
            </div>
            <CardOptions post={post} user={user} />
          </div>
          <figure className="relative overflow-hidden">
            {post.media.map((item: string, index: number) => (
              <div
                key={index}
                className={`transition-transform duration-300 ease-in-out transform ${
                  index === currentImageIndex
                    ? "fade-enter fade-enter-active"
                    : "fade-exit fade-exit-active"
                }`}
              >
                {index === currentImageIndex && (
                  <>
                    {item.endsWith(".mp4") || item.endsWith(".webm") ? (
                      <>
                        <VideoContainer
                          video={{
                            src: item,
                            width: 400,
                            height: 550,
                            className: `w-full h-full lg:h-[550px] object-cover aspect-square shrink-0 md:rounded-md`,
                          }}
                          ref={videoRef}
                        />
                        <button
                          onClick={handlePlayPause}
                          className="absolute top-1/2 left-[45%] btn btn-circle btn-ghost hover:bg-transparent opacity-75 hover:opacity-100 text-white border-0"
                        >
                          {isPlaying ? (
                            <i className="ri-pause-line text-6xl"></i>
                          ) : (
                            <i className="ri-play-line text-6xl"></i>
                          )}
                        </button>
                      </>
                    ) : (
                      <ImageContainer
                        media={{
                          alt: `Post ${index + 1}`,
                          height: 550,
                          src: item,
                          width: 400,
                          className: `w-full h-[450px] lg:h-[550px] object-cover aspect-square shrink-0 md:rounded-md`,
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
            <div>
              {currentImageIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 btn btn-circle btn-sm opacity-75 hover:opacity-100"
                >
                  <i className="ri-arrow-left-s-line text-lg"></i>
                </button>
              )}
            </div>
            <div>
              {currentImageIndex < post.media.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 btn btn-circle btn-sm opacity-75 hover:opacity-100"
                >
                  <i className="ri-arrow-right-s-line text-lg"></i>
                </button>
              )}
            </div>
            {post.media?.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                {post.media.map((_: unknown, index: number) => (
                  <div
                    key={index}
                    className={`w-[8px] h-[8px] rounded-full ${
                      index === currentImageIndex
                        ? "bg-secondary"
                        : "bg-black/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </figure>
          <div className="mt-1 flex justify-between items-center px-4 md:px-0">
            <div className="flex gap-4 items-center">
              <fetcher.Form method="patch" action="/?index">
                <i
                  className={`text-2xl cursor-pointer ${
                    isPostLiked[user.id]
                      ? "ri-heart-fill text-red-700"
                      : "ri-heart-line"
                  }`}
                  role="button"
                  title={isPostLiked[user.id] ? "Unlike" : "Like"}
                  onClick={() => handleLikeOrSave("like")}
                ></i>
              </fetcher.Form>
              <i
                className="ri-chat-3-line text-2xl cursor-pointer"
                title="Comment"
                onClick={() => navigate(`/post/${post.id}`)}
              ></i>
            </div>
            <i
              className={` text-2xl cursor-pointer ${
                isSaved ? "ri-bookmark-fill text-gray-700" : "ri-bookmark-line"
              }`}
              title={isSaved ? "Unsave" : "save"}
              onClick={() => handleLikeOrSave("save")}
            ></i>
          </div>
          <SeeLikes likeCount={likeCounts} post={post} user={user} />
          <p className="px-4 md:px-0">
            <Link
              to={`/profile/${post?.user?.username}`}
              className="font-semibold"
            >
              {post?.user?.username}
            </Link>{" "}
            {post?.caption}
          </p>
          {post?.tags && (
            <div className="flex flex-wrap items-center gap-2 px-4 md:px-0">
              {post?.tags?.map((tag: string, index: number) => (
                <Link to={`/tag/${tag}`} key={index}>
                  <span className="text-primary">#{tag}</span>
                </Link>
              ))}
            </div>
          )}
          <p
            className="text-gray-500 cursor-pointer px-4 md:px-0"
            onClick={() => navigate(`/post/${post.id}`)}
          >
            View all comments
          </p>
          {comments?.length > 0 &&
            comments.map((comment: Comment) => (
              <div key={comment?.id}>
                <Link
                  to={`/profile/${user?.username}`}
                  className="font-semibold mr-1"
                >
                  {user?.username}
                </Link>
                {comment?.content}
              </div>
            ))}
          <fetcher.Form
            className="mt-2 relative px-4 md:px-0"
            onSubmit={handleSubmit(onSubmit)}
          >
            <textarea
              className=" w-full border-0 h-[40px] focus:border-0 focus:outline-none text-sm"
              placeholder="Add a comment..."
              id="content"
              {...register("content")}
            ></textarea>
            <button
              className="btn btn-ghost btn-sm text-primary font-bold absolute inset-y-0 right-0 hover:bg-transparent hover:border-0"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
            {errors?.content?.message && (
              <p className="text-xs text-red-600">
                {errors?.content?.message as string}
              </p>
            )}
          </fetcher.Form>
        </div>
      </div>
    </>
  );
}

export default React.memo(Card);
