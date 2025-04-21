import Container from "@/components/Container";
import MetaArgs from "@/components/MetaArgs";
import { Post, Story, User } from "@/types";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  Link,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from "react-router";
import Skeleton from "../../components/Skeleton";
import { useAuth } from "@/context";
import ActionButton from "@/components/ActionButton";
import CreateStory from "@/components/CreateStory";
import useScroll from "@/hooks/useScroll";
import useInfiniteScrollBox from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";
const Card = lazy(() => import("./components/Card"));

export function Component() {
  const [active, setActive] = useState(0);
  const { user } = useOutletContext() as { user: User };
  const { postsFeeds, suggestions, stories } =
    (useLoaderData() as {
      postsFeeds: {
        data: {
          posts: Post[];
          pagination: { currentPage: number; hasMore: boolean };
        };
      };
      suggestions: { users: User[] };
      stories: { stories: Story[] };
    }) || {};
  const { handleLogout } = useAuth();
  const fetcher = useFetcher();
  const { storiesContainerRef, scrollPosition, handleScroll } = useScroll();
  const { posts, pagination } = postsFeeds?.data ?? {};
  const { hasMore } = pagination || {};
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>(posts || []);
  const { users } = suggestions ?? {};
  const { stories: userStories } = stories ?? {};
  const hasStory = userStories?.some((story) => story.userId === user?.id);
  const hasNextPage =
    page === 1 ? hasMore : fetcher?.data?.postsFeeds?.data?.pagination?.hasMore;
  const { infiniteRef } = useInfiniteScrollBox({
    loading: fetcher.state === "submitting",
    hasNextPage,
    loadMore: () => {
      if (hasNextPage) {
        const nextPage = page + 1;
        fetcher.submit(
          { page: nextPage },
          { method: "get", action: "/?index" }
        );
        setPage(nextPage);
      }
    },
    error: fetcher.data?.error,
  });

  useEffect(() => {
    if (page === 1) {
      setAllPosts(posts);
    } else {
      const newPosts = fetcher.data?.postsFeeds?.data?.posts;
      if (!newPosts) return;
      const existingPostIds = new Set(allPosts.map((post) => post.id));
      const postsToAdd = newPosts.filter(
        (post: Post) => !existingPostIds.has(post.id)
      );
      setAllPosts((prev) => [...prev, ...postsToAdd]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data?.postsFeeds?.data?.posts, posts, page]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, { id: "follow-user" });
      } else {
        toast.error(fetcher.data.message || fetcher.data.error, {
          id: "follow-userError",
        });
      }
    }
  }, [fetcher.data]);

  return (
    <>
      <MetaArgs title="Your Instashots feed" description="Home page" />
      <Container classname="container">
        <div className="grid grid-cols-12 gap-4 justify-between">
          <div className="col-span-12 lg:col-span-8">
            <div className="relative max-w-[600px] 2xl:max-w-[700px] mx-auto">
              <div className="mt-4 md:mt-0 flex items-center gap-4 px-4 md:px-8 lg:px-0 overflow-auto">
                <CreateStory user={user} />
                <div className="absolute left-14 top-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={() => handleScroll("left")}
                    className="btn btn-circle btn-ghost btn-sm bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    style={{ display: scrollPosition <= 0 ? "none" : "block" }}
                  >
                    <i className="ri-arrow-left-s-line text-lg"></i>
                  </button>
                </div>
                <div
                  ref={storiesContainerRef}
                  className="flex gap-4 overflow-auto scrollbarHide"
                >
                  {userStories?.map((story) => (
                    <Link
                      to={`/stories/${story.user.username}`}
                      key={story.id}
                      className="flex flex-col items-center"
                    >
                      <div className="avatar avatar-placeholder">
                        <div className="w-12 rounded-full border-2 border-secondary">
                          {story.user.profilePicture ? (
                            <img
                              src={story.user.profilePicture}
                              alt={story.user.username}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">
                              {story.user.username?.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold">
                        {story.user.username}
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                  <button
                    onClick={() => handleScroll("right")}
                    className="btn btn-circle btn-ghost btn-sm bg-black/50 text-white  hover:bg-black/70 transition-colors"
                    style={{
                      display:
                        storiesContainerRef.current &&
                        scrollPosition >=
                          storiesContainerRef.current.scrollWidth -
                            storiesContainerRef.current.clientWidth
                          ? "none"
                          : "block",
                    }}
                  >
                    <i className="ri-arrow-right-s-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full md:max-w-[450px] 2xl:max-w-[600px] mx-auto">
              <Suspense fallback={<Skeleton />}>
                <>
                  {allPosts?.length === 0 && (
                    <h1 className="my-8 text-center text-lg font-bold">
                      No posts yet
                    </h1>
                  )}
                </>
                {allPosts?.map((post) => (
                  <Card
                    post={post}
                    key={post.id}
                    user={user}
                    userStories={userStories}
                  />
                ))}
              </Suspense>
              {hasNextPage && (
                <div className="col-span-3 text-center" ref={infiniteRef}>
                  <span className="loading loading-spinner"></span>
                </div>
              )}
            </div>
          </div>
          <div className="hidden lg:block col-span-12 lg:col-span-4">
            <div className="mt-2 flex justify-between items-center">
              <Link
                to={`/profile/${user?.username}`}
                className="flex items-center gap-4"
              >
                <div className="avatar avatar-placeholder">
                  <div
                    className={`w-10 rounded-full ${
                      !user?.profilePicture
                        ? "border"
                        : hasStory
                        ? "border-secondary"
                        : ""
                    }`}
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user?.profilePicture}
                        alt={user?.username}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl">
                        {user?.username?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-start">
                  <p className="font-semibold">{user?.username}</p>
                  <p className="text-sm">{user?.fullname}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </div>
            {users?.length > 0 && (
              <div className="mt-10">
                <h1 className="text-gray-600 font-semibold">
                  Suggested for you
                </h1>
                {users?.map((connect, index) => (
                  <div className="my-4 flex justify-between items-center" key={index}>
                    <Link
                      to={`/profile/${connect.username}`}
                      className="flex items-center gap-4"
                    >
                      <div className=" avatar avatar-placeholder">
                        <div className="w-10 rounded-full border border-gray-300">
                          {connect.profilePicture ? (
                            <img
                              src={connect.profilePicture}
                              alt={connect.username}
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-3xl">
                              {connect.username?.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-start">
                        <p className="font-semibold">{connect.username}</p>
                        <p className="text-sm">{connect.fullname}</p>
                      </div>
                    </Link>
                    <fetcher.Form method="patch" action={`/?index`}>
                      <ActionButton
                        type="button"
                        loading={
                          active === index && fetcher.state === "submitting"
                        }
                        disabled={
                          active === index && fetcher.state === "submitting"
                        }
                        text={
                          active === index && fetcher.state === "submitting"
                            ? "Updating..."
                            : user.following?.includes(connect.id)
                            ? "Unfollow"
                            : "Follow"
                        }
                        classname="btn btn-sm btn-primary w-[120px]"
                        onClick={() => {
                          setActive(index);
                          fetcher.submit(
                            {
                              id: connect.id,
                              type: "followUser",
                            },
                            {
                              method: "patch",
                              action: `/?index`,
                            }
                          );
                        }}
                      />
                    </fetcher.Form>
                  </div>
                ))}
              </div>
            )}
            <h1 className="mt-10 text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Instashots from Cobi
            </h1>
          </div>
        </div>
      </Container>
    </>
  );
}

Component.displayName = "Home";
