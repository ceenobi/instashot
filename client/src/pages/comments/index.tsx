import MetaArgs from "@/components/MetaArgs";
import Modal from "@/components/Modal";
import useSlideControl from "@/hooks/useSlideControl";
import useVideoControl from "@/hooks/useVideoControl";
import { Comment, User } from "@/types";
import { useEffect, useState, useCallback } from "react";
import {
  Link,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import TimeAgo from "timeago-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { commentSchema } from "@/libs/dataSchema";
import { toast } from "sonner";

export function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useLoaderData();
  const { user } = useOutletContext() as { user: User };
  const fetcher = useFetcher();
  const { post } = data ?? {};
  const [isCommentLiked, setIsCommentLiked] = useState<Record<string, boolean>>(
    {}
  );
  const [isPostLiked, setIsPostLiked] =
    useState<boolean>(
      post?.likes.some((item: { id: string }) => item.id === user.id)
    ) || false;
  const [isPostSaved, setIsPostSaved] =
    useState<boolean>(
      post?.savedBy.some((item: { id: string }) => item.id === user.id)
    ) || false;
  const { currentImageIndex, handlePrevious, handleNext } = useSlideControl(
    post?.media
  );
  const { videoRef, isPlaying, handlePlayPause } = useVideoControl();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(commentSchema),
  });
  const path = location.pathname === `/post/${id}`;

  useEffect(() => {
    if (data.success && path) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      toast.error(data.message, { id: "PostNotFound" });
      navigate("/");
    }
  }, [data.message, data.success, navigate, path]);

  useEffect(() => {
    if (post?.comments) {
      const initialLikes = Object.fromEntries(
        post.comments.map((comment: Comment) => [
          comment.id,
          comment.likes?.some((like: { id: string }) => like.id === user.id) ||
            false,
        ])
      );
      setIsCommentLiked(initialLikes);
    }
  }, [post?.comments, user.id]);

  useEffect(() => {
    if (!fetcher.data) return;
    const { success, message, error } = fetcher.data;
    if (success) {
      toast.success(message, { id: "postActions" });
      if (message.includes("post deleted")) {
        setIsOpen(false);
        navigate("/");
      } else {
        reset();
      }
    } else {
      toast.error(message || error, { id: "handleLike-error" });
    }
  }, [fetcher.data, navigate, reset]);

  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  const formatTimeAgo = (timestamp: string) => {
    return <TimeAgo datetime={timestamp} locale="en-US" />;
  };

  const handleLikeOrSave = useCallback(
    (type: string, commentId?: string) => {
      switch (type) {
        case "like":
          setIsPostLiked((prev: boolean) => !prev);
          fetcher.submit(
            { id: post.id, type },
            { method: "patch", action: `/post/${id}` }
          );
          break;
        case "save":
          setIsPostSaved((prev: boolean) => !prev);
          fetcher.submit(
            { id: post.id, type },
            { method: "patch", action: `/post/${id}` }
          );
          break;
        case "likeComment":
          setIsCommentLiked((prev: Record<string, boolean>) => ({
            ...prev,
            [commentId as string]: !prev[commentId as string],
          }));
          fetcher.submit(
            { id: commentId as string, type },
            { method: "patch", action: `/post/${id}` }
          );
          break;
        default:
          break;
      }
    },
    [fetcher, id, post.id, setIsCommentLiked, setIsPostLiked, setIsPostSaved]
  );

  const onSubmit = (data: FieldValues) => {
    fetcher.submit(
      {
        ...data,
        id: post.id,
      },
      { method: "post", action: `/post/${id}` }
    );
  };

  return (
    <>
      <MetaArgs
        title={`${post?.user?.username} - ${post?.caption}`}
        description="View post, comment, like post"
      />
      <Modal
        isOpen={isOpen}
        id="post-postModal"
        classname="w-[90%] max-w-[1024px] mx-auto p-0"
      >
        <div className="grid grid-cols-12 h-[700px]">
          <div className="col-span-12 lg:col-span-6">
            <figure className="relative overflow-hidden">
              {post?.media.map((item: string, index: number) => (
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
                          <video
                            src={item}
                            className={`w-full h-auto lg:h-full object-contain aspect-square shrink-0`}
                            ref={videoRef}
                            controls={false}
                            playsInline
                            loop
                            autoPlay
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
                        <img
                          src={item}
                          className={`w-full h-[300px] lg:h-[700px] object-cover aspect-square shrink-0`}
                          alt={`Post ${index + 1}`}
                          loading="lazy"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="absolute left-2 top-1/2 btn btn-circle btn-sm opacity-75 hover:opacity-100"
                  >
                    <i className="ri-arrow-left-s-line text-lg"></i>
                  </button>
                )}
              </>
              <>
                {currentImageIndex < post?.media?.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 btn btn-circle btn-sm opacity-75 hover:opacity-100"
                  >
                    <i className="ri-arrow-right-s-line text-lg"></i>
                  </button>
                )}
              </>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                {post?.media.map((_: unknown, index: number) => (
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
            </figure>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:relative h-auto overflow-auto">
            <div className="py-4 px-4 w-[90%] mb-1 flex items-center justify-between border-b border-gray-300">
              <div className="flex gap-2 items-center">
                <div className=" avatar avatar-placeholder">
                  <div className="w-10 rounded-full border border-gray-300">
                    {post?.user?.profilePicture ? (
                      <img
                        src={post?.user?.profilePicture}
                        alt={post?.user?.username}
                        loading="lazy"
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
                    className="text-sm font-semibold"
                  >
                    {post?.user?.username}
                  </Link>
                </div>
              </div>
              {post?.userId === user?.id && (
                <i
                  className="ri-more-line text-2xl cursor-pointer lg:mr-10"
                  role="button"
                  title="more options"
                  onClick={() => setIsOptionsOpen(true)}
                ></i>
              )}
              <Modal
                isOpen={isOptionsOpen}
                id="create-optionsModal"
                classname="w-[90%] max-w-[400px] mx-auto p-0"
                onClose={() => setIsOptionsOpen(false)}
              >
                <div className="text-center p-3">
                  <fetcher.Form method="delete" action={`/post/${id}`}>
                    <p
                      className="font-medium text-error cursor-pointer"
                      title="Delete post"
                      onClick={() =>
                        fetcher.submit(
                          {
                            id: id as string,
                            type: "deletePost",
                          },
                          { method: "delete", action: `/post/${id}` }
                        )
                      }
                    >
                      {fetcher.state === "submitting"
                        ? "Deleting..."
                        : "Delete"}
                    </p>
                  </fetcher.Form>
                  <div className="divider my-2"></div>
                  <p className="font-medium" title="Edit post">
                    <Link to={`/post/edit/${id}`}>Edit</Link>
                  </p>
                  <div className="divider my-2"></div>
                  <p
                    onClick={() => setIsOptionsOpen(false)}
                    className="font-medium cursor-pointer"
                  >
                    Cancel
                  </p>
                </div>
              </Modal>
            </div>
            <div className="mt-4 px-4 h-[500px] overflow-auto">
              <div className="flex items-start gap-3">
                <div className="avatar avatar-placeholder">
                  <div className="w-10 rounded-full border border-gray-300">
                    {post?.user?.profilePicture ? (
                      <img
                        src={post?.user?.profilePicture}
                        alt={post?.user?.username}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl">
                        {post?.user?.username?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 items-center">
                  <Link
                    to={`/profile/${post?.user?.username}`}
                    className="text-sm font-semibold mb-0"
                  >
                    {post?.user?.username}
                  </Link>
                  <p className="text-sm mb-0">
                    {post?.caption} - {post?.description}
                  </p>
                  {post?.tags && (
                    <div className="flex flex-wrap items-center gap-2">
                      {post?.tags?.map((tag: string) => (
                        <Link to={`/tag/${tag}`} key={tag}>
                          <span className="text-primary text-sm">#{tag}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {post?.comments?.length === 0 && (
                <p className="text-center my-4 text-sm">
                  No comments yet. Be the first to comment
                </p>
              )}
              {post?.comments.map((comment: Comment) => (
                <div key={comment.id} className="my-4">
                  <div className="flex items-center gap-4">
                    <div className="ml-1 avatar avatar-placeholder">
                      <div className="w-8 rounded-full border border-gray-300">
                        {comment?.user?.profilePicture ? (
                          <img
                            src={comment?.user?.profilePicture}
                            alt={comment?.user?.username}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xl">
                            {comment?.user?.username?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <Link
                          to={`/profile/${comment?.user?.username}`}
                          className="text-sm font-semibold mb-0"
                        >
                          {comment?.user?.username}
                        </Link>
                        <p className="text-sm mb-0">{comment?.content}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(comment?.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {comment?.likes?.length || 0} likes
                        </p>
                        {comment?.user?.username === user?.username && (
                          <fetcher.Form method="delete" action={`/post/${id}`}>
                            <i
                              className="ri-delete-bin-7-line cursor-pointer"
                              title="Delete comment"
                              onClick={() =>
                                fetcher.submit(
                                  {
                                    id: comment.id,
                                    type: "deleteComment",
                                  },
                                  { method: "delete", action: `/post/${id}` }
                                )
                              }
                            ></i>
                          </fetcher.Form>
                        )}
                      </div>
                    </div>
                    <fetcher.Form method="patch" action={`/post/${id}`}>
                      <i
                        className={`cursor-pointer ${
                          isCommentLiked[comment.id]
                            ? "ri-heart-fill text-red-700"
                            : "ri-heart-line"
                        }`}
                        title={isCommentLiked[comment.id] ? "Unlike" : "Like"}
                        role="button"
                        onClick={() =>
                          handleLikeOrSave("likeComment", comment.id)
                        }
                      ></i>
                    </fetcher.Form>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-base-200 relative z-30 w-full border-t border-gray-300 py-2">
              <div className="px-4 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <fetcher.Form method="patch" action={`/post/${id}`}>
                    <i
                      className={`text-2xl cursor-pointer ${
                        isPostLiked
                          ? "ri-heart-fill text-red-700"
                          : "ri-heart-line"
                      }`}
                      role="button"
                      title={isPostLiked ? "Unlike" : "Like"}
                      onClick={() => handleLikeOrSave("like")}
                    ></i>
                  </fetcher.Form>
                  <label htmlFor="content">
                    <i
                      className="ri-chat-3-line text-2xl cursor-pointer"
                      title="Comment"
                    ></i>
                  </label>
                </div>
                <fetcher.Form method="patch" action={`/post/${id}`}>
                  <i
                    className={` text-2xl cursor-pointer ${
                      isPostSaved
                        ? "ri-bookmark-fill text-gray-700"
                        : "ri-bookmark-line"
                    }`}
                    title={isPostSaved ? "Unsave" : "Save"}
                    onClick={() => handleLikeOrSave("save")}
                  ></i>
                </fetcher.Form>
              </div>
              <div className="mt-2 px-4 flex gap-2">
                {post?.likes
                  ?.slice(0, 1)
                  .map(
                    (like: {
                      id: string;
                      username: string;
                      profilePicture: string;
                    }) => (
                      <div className="flex gap-2 items-center" key={like.id}>
                        <Link to={`/profile/${like?.username}`}>
                          <div className="avatar-group -space-x-6">
                            <div className="avatar avatar-placeholder rounded-full border border-gray-300">
                              <div className="w-5">
                                {like?.profilePicture ? (
                                  <img
                                    src={like?.profilePicture}
                                    alt={like?.username}
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-xl">
                                    {like?.username?.charAt(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                        <p className="text-sm">
                          liked by{" "}
                          <Link
                            to={`/profile/${like?.username}`}
                            className="font-bold"
                          >
                            {like?.username}
                          </Link>{" "}
                          and <span>{post?.likes?.length - 1} others</span>
                        </p>
                      </div>
                    )
                  )}
              </div>
              <fetcher.Form
                className="relative px-4 mt-4"
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
        </div>
        <button
          className="btn btn-circle btn-sm lg:btn-ghost absolute z-50 right-2 top-1"
          type="button"
          onClick={handleClose}
        >
          ✕
        </button>
      </Modal>
    </>
  );
}

Component.displayName = "Comments";
