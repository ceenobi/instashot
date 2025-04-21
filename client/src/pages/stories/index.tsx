import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { Story, User } from "@/types";
import MetaArgs from "@/components/MetaArgs";
import { useCallback, useEffect, useMemo, useOptimistic } from "react";
import useVideoControl from "@/hooks/useVideoControl";
import useSlideControl from "@/hooks/useSlideControl";
import Views from "./components/Views";
import Liked from "./components/Liked";
import { toast } from "sonner";
import TimeAgo from "timeago-react";

export function Component() {
  const { user } = useOutletContext<{ user: User }>();
  const { username } = useParams();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { story, stories } = useLoaderData() as {
    story: { stories: Story[] };
    stories: { stories: Story[] };
  };
  const userStory = useMemo(() => story?.stories ?? [], [story?.stories]);
  const userStories = useMemo(() => stories?.stories ?? [], [stories?.stories]);
  const { videoRef, isPlaying, handlePlayPause } = useVideoControl();
  const { currentImageIndex, handlePrevious, handleNext } = useSlideControl(
    userStory.flatMap((story) => story.media).filter(Boolean)
  );
  const storyOwner = useMemo(
    () =>
      userStories.find((story) =>
        story.user.username.includes(username as string)
      ),
    [userStories, username]
  );

  const currentMedia = useMemo(() => {
    if (!userStory.length) return null;
    const flatMedia = userStory.flatMap((story) => story.media).filter(Boolean);
    return flatMedia[currentImageIndex];
  }, [userStory, currentImageIndex]);

  const currentStory = useMemo(() => {
    if (!userStory.length) return null;
    if (!currentMedia) return null;
    const storyIndex = userStory.findIndex((story) =>
      story.media.includes(currentMedia)
    );
    return userStory[storyIndex];
  }, [userStory, currentMedia]);
  const [isLiked, setIsLiked] = useOptimistic(
    currentStory?.storyLikes?.some((like) => like.id === user?.id)
  );

  const viewNextStory = useCallback(() => {
    if (!userStories) return;
    // Find current story index
    const currentIndex = userStories.findIndex(
      (story) => story?.userId === user?.id
    );
    // If there's a next story, navigate to it
    if (currentIndex < userStories.length - 1) {
      const nextStory = userStories[currentIndex + 1];
      navigate(`/stories/${nextStory.user?.username}`);
    } else {
      // If we're at the last story, go back to home
      navigate("/");
    }
  }, [navigate, user?.id, userStories]);

  const viewPrevStory = useCallback(() => {
    if (!userStories) return;
    // Find current story index
    const currentIndex = userStories.findIndex(
      (story) => story.userId === user.id
    );
    // If there's a previous story, navigate to it
    if (currentIndex > 0) {
      const prevStory = userStories[currentIndex - 1];
      navigate(`/stories/${prevStory.user.username}`);
    } else {
      // If we're at the first story, go back to home
      navigate("/");
    }
  }, [navigate, user?.id, userStories]);

  const formatTimeAgo = (timestamp: string) => {
    return <TimeAgo datetime={timestamp} locale="en-US" />;
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, { id: "storyActions" });
        if (fetcher.data.message.includes("deleted")) {
          viewNextStory();
        }
      } else {
        toast.error(fetcher.data.message || fetcher.data.error, {
          id: "storyError",
        });
      }
    }
  }, [fetcher.data, viewNextStory]);

  useEffect(() => {
    if (!currentStory || !currentMedia) return;
    if (!currentMedia.endsWith(".mp4") && !currentMedia.endsWith(".webm")) {
      const timer = setTimeout(() => {
        handleNext();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [currentStory, currentImageIndex, handleNext, currentMedia]);

  return (
    <>
      <MetaArgs title={`Stories - ${username}`} description="Stories" />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="relative w-[90vw] h-[80vh] lg:h-[95vh] md:w-[600px] lg:w-[400px] rounded-lg shadow-xl z-50 bg-zinc-700">
          {userStory?.length > 0 && (
            <>
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex justify-between items-center">
                  <Link
                    to={`/profile/${storyOwner?.user?.username}`}
                    className="flex gap-3 items-center"
                  >
                    <div className="avatar avatar-placeholder">
                      <div className="w-10 rounded-full">
                        {storyOwner?.user?.profilePicture ? (
                          <img
                            src={storyOwner?.user?.profilePicture}
                            alt={storyOwner?.user?.username}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-3xl">
                            {storyOwner?.user?.username?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-white font-bold">
                        {storyOwner?.user?.username}
                      </span>
                      <p className="text-sm text-white">
                        {formatTimeAgo(currentStory?.createdAt as string)}
                      </p>
                    </div>
                  </Link>
                  <div>
                    {user?.id === currentStory?.userId && (
                      <div className="dropdown dropdown-bottom dropdown-end w-full text-right">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-xs btn-ghost hover:bg-transparent"
                        >
                          <i
                            className="ri-more-line text-white text-2xl mr-2"
                            title="menu"
                          ></i>
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow"
                        >
                          <li>
                            <fetcher.Form
                              method="delete"
                              action={`/stories/${username}`}
                            >
                              <p
                                role="button"
                                onClick={() =>
                                  fetcher.submit(
                                    {
                                      id: currentStory?.id as string,
                                      type: "deleteStory",
                                    },
                                    {
                                      method: "delete",
                                      action: `/stories/${username}`,
                                    }
                                  )
                                }
                              >
                                {fetcher.state === "submitting"
                                  ? "Deleting..."
                                  : "Delete Story"}
                              </p>
                            </fetcher.Form>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-white mt-6 text-sm">
                  {currentStory?.caption}
                </p>
              </div>
              {/* Story Content */}
              <figure className="relative overflow-hidden h-full">
                {currentMedia && (
                  <div className="rounded-lg h-full transition-transform duration-300 ease-in-out transform fade-enter fade-enter-active">
                    {currentMedia.endsWith(".mp4") ||
                    currentMedia.endsWith(".webm") ? (
                      <>
                        <video
                          src={currentMedia}
                          className={`w-full h-full object-contain aspect-square shrink-0 rounded-lg`}
                          controls={false}
                          ref={videoRef}
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
                        src={currentMedia}
                        alt={currentStory?.caption || "Story"}
                        className="w-full h-full object-cover aspect-square rounded-lg"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}
              </figure>
              <div className="absolute top-0 left-0 right-0 flex gap-1">
                {userStory
                  .flatMap((story) => story.media)
                  .filter(Boolean)
                  .map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full ${
                        index === currentImageIndex
                          ? "bg-secondary"
                          : "bg-gray-600"
                      }`}
                    />
                  ))}
              </div>
              <div className="absolute right-10 top-[93%] flex items-center gap-4">
                <Views currentStory={currentStory} />
                <fetcher.Form
                  method="patch"
                  action={`/stories/${username}`}
                  className="flex items-center"
                >
                  <p
                    className="cursor-pointer"
                    onClick={() => {
                      setIsLiked((prev) => !prev);
                      fetcher.submit(
                        {
                          id: currentStory?.id as string,
                        },
                        {
                          method: "patch",
                          action: `/stories/${username}`,
                        }
                      );
                    }}
                  >
                    <i
                      className={`${
                        isLiked
                          ? "ri-heart-fill text-red-600"
                          : "ri-heart-line text-white"
                      } text-2xl`}
                    ></i>
                  </p>
                  <span className="text-white mx-2">
                    {currentStory?.storyLikes?.length}
                  </span>
                </fetcher.Form>
                <Liked currentStory={currentStory} />
              </div>
              {/* view next story*/}
              <>
                {currentImageIndex > 0 ? (
                  <button
                    onClick={handlePrevious}
                    className="btn btn-circle btn-ghost absolute left-4 md:left-[-70px] top-1/2 z-10 bg-black/50 hover:bg-zinc/70 transition-colors"
                  >
                    <i className="ri-arrow-left-s-line text-xl text-white"></i>
                  </button>
                ) : (
                  userStory.length - 1 > 0 ||
                  (userStories.length - 1 > 0 && (
                    <button
                      onClick={viewPrevStory}
                      className="btn btn-circle btn-ghost absolute left-4 md:left-[-70px] top-1/2 z-10 bg-black/50 hover:bg-zinc/70 transition-colors"
                    >
                      <i className="ri-arrow-left-s-line text-xl text-white"></i>
                    </button>
                  ))
                )}
              </>
              <>
                {currentImageIndex <
                userStory.flatMap((story) => story.media).filter(Boolean)
                  .length -
                  1 ? (
                  <button
                    onClick={handleNext}
                    className="btn btn-circle btn-ghost absolute right-4 md:right-[-70px] top-1/2 z-10 bg-black/50 hover:bg-zinc/70 transition-colors"
                  >
                    <i className="ri-arrow-right-s-line text-xl text-white"></i>
                  </button>
                ) : (
                  userStory.length - 1 > 0 ||
                  (userStories.length - 1 > 0 && (
                    <button
                      onClick={viewNextStory}
                      className="btn btn-circle btn-ghost absolute right-4 md:right-[-70px] top-1/2 z-10 bg-black/50 hover:bg-zinc/70 transition-colors"
                    >
                      <i className="ri-arrow-right-s-line text-xl text-white"></i>
                    </button>
                  ))
                )}
              </>
            </>
          )}
          {userStory.length === 0 && (
            <p className="text-center text-white mt-20">
              No stories found
            </p>
          )}
        </div>
      </div>
    </>
  );
}

Component.displayName = "Stories";
