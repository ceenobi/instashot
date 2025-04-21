import Container from "@/components/Container";
import MetaArgs from "@/components/MetaArgs";
import {
  useLoaderData,
  useOutletContext,
  useParams,
  Outlet,
  Link,
  NavLink,
  useMatch,
  useFetcher,
} from "react-router";
import ProfileImage from "./components/ProfileImage";
import EditProfile from "./components/EditProfile";
import { User } from "@/types";
import { lazy, Suspense } from "react";
const Posts = lazy(() => import("./components/Posts"));

export function Component() {
  const { username } = useParams();
  const { user } = useOutletContext() as { user: User };
  const { data } = useLoaderData();
  const fetcher = useFetcher();
  const match = useMatch(`/profile/${username}`);
  const { user: profileData } = data;

  const profileLinks = [
    {
      path: `/profile/${username}`,
      icon: <i className="ri-layout-grid-line"></i>,
      name: "Posts",
    },
    {
      path: `/profile/${username}/saved`,
      icon: <i className="ri-bookmark-line"></i>,
      name: "Saved",
    },
    {
      path: `/profile/${username}/likes`,
      icon: <i className="ri-heart-line"></i>,
      name: "Likes",
    },
  ];

  return (
    <>
      <MetaArgs
        title={`Your Instapics profile - (@${username})`}
        description="Profile page"
      />
      <Container classname="max-w-[950px] xl:max-w-[1024px] px-4">
        <div className="mt-2 grid md:grid-cols-12 gap-4 md:gap-8 max-w-[700px] justify-center mx-auto px-4">
          <div className="md:col-span-4">
            <div className="flex gap-6">
              <ProfileImage profileData={profileData} />
              {/* mobile */}
              <div className="md:hidden">
                <h1 className="text-lg font-semibold">{username}</h1>
                <div className="mt-2 flex items-center gap-4">
                  {user?.username === username && <EditProfile />}
                  {user?.id !== profileData?.id && (
                    <button
                      className="btn btn-primary focus:outline-none w-[120px]"
                      onClick={() => {
                        fetcher.submit(
                          {
                            id: profileData?.id,
                            type: "followUser",
                          },
                          {
                            method: "patch",
                            action: `/profile/${username}`,
                          }
                        );
                      }}
                    >
                      {fetcher.state !== "idle" ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : profileData?.followers?.includes(user?.id) ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                  <button className="btn btn-soft light:btn-neutral dark:btn-secondary focus:outline-none w-[120px]">
                    {profileData?.isVerified ? "Verified" : "Not Verified"}{" "}
                    <i className="ri-verified-badge-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-8">
            {/* large screen */}
            <div className="hidden md:flex items-center gap-4">
              <h1 className="text-lg font-semibold flex-1">{username}</h1>
              <div className="flex items-center gap-4">
                {user?.username === username && <EditProfile />}
                {user?.id !== profileData?.id && (
                  <button
                    className="btn btn-primary focus:outline-none w-[120px]"
                    title={
                      profileData?.following?.includes(user?.id)
                        ? "Unfollow"
                        : "Follow"
                    }
                    onClick={() => {
                      fetcher.submit(
                        {
                          id: profileData?.id,
                          type: "followUser",
                        },
                        {
                          method: "patch",
                          action: `/profile/${username}`,
                        }
                      );
                    }}
                  >
                    {fetcher.state !== "idle" ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : profileData?.followers?.includes(user?.id) ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
                <button className="btn btn-soft light:btn-neutral dark:btn-secondary  focus:outline-none w-[120px] cursor-not-allowed">
                  {profileData?.isVerified ? "Verified" : "Not Verified"}{" "}
                  <i className="ri-verified-badge-fill"></i>
                </button>
              </div>
            </div>
            <div className="hidden mt-6 md:flex items-center">
              <h1 className="text-lg flex-1">
                <span className="font-bold mr-2">
                  {profileData?.posts?.length}
                </span>
                <span className="text-gray-500">Posts</span>
              </h1>
              <div className="flex items-center gap-4 text-center">
                <Link to={`/profile/${username}/followers/connections`}>
                  <h1 className="text-lg w-[130px] cursor-pointer">
                    <span className="font-bold">
                      {profileData?.followers?.length}
                    </span>{" "}
                    <span className="text-gray-500">followers</span>
                  </h1>
                </Link>
                <Link to={`/profile/${username}/following/connects`}>
                  <h1 className="text-lg w-[130px] cursor-pointer">
                    <span className="font-bold">
                      {profileData?.following?.length}
                    </span>{" "}
                    <span className="text-gray-500">following</span>
                  </h1>
                </Link>
              </div>
            </div>
            <h1 className="my-2 text-sm font-bold">{profileData?.fullname}</h1>
            <p className="text-md">
              {profileData?.bio || "Like what you see? Come get at me!"}
            </p>
          </div>
        </div>
      </Container>
      <div className="border-t border-b border-gray-500 flex justify-between items-center md:hidden px-12 md:px-4 text-center py-1">
        <div>
          <p className="font-bold">{profileData?.posts?.length}</p>
          <span className="text-gray-500 text-sm">posts</span>
        </div>
        <Link to={`/profile/${username}/followers/connections`}>
          <p className="text-lg cursor-pointer">
            {profileData?.followers?.length}
          </p>
          <span className="text-gray-500 text-sm">followers</span>
        </Link>
        <Link
          to={`/profile/${username}/following/connects`}
          className="text-center"
        >
          <p className="text-lg cursor-pointer">
            {profileData?.following?.length}
          </p>
          <span className="text-gray-500 text-sm">following</span>
        </Link>
      </div>
      <Container classname="max-w-[950px] px-4">
        <div className="flex justify-center items-center gap-6 px-4 md:px-0">
          {profileLinks.map(({ path, name, icon }) => (
            <NavLink
              key={path}
              className="flex flex-col justify-center items-center"
              to={path}
              end
            >
              {({ isActive }) => (
                <span
                  className={`mb-2 mt-0 p-3 flex gap-2 items-center ${
                    isActive ? "font-semibold text-secondary" : ""
                  }`}
                >
                  {icon}
                  {name}
                </span>
              )}
            </NavLink>
          ))}
        </div>
        {(user?.isPublic ||
          (!profileData?.isPublic &&
            user?.following?.includes(profileData?.id)) ||
          profileData?.id === user?.id) && (
          <>
            {match ? (
              <Suspense
                fallback={
                  <div className="text-center mt-20">
                    <span className="loading loading-bars loading-md text-secondary"></span>
                  </div>
                }
              >
                <Posts posts={profileData?.posts} />
              </Suspense>
            ) : (
              <Outlet context={{ user }} />
            )}
          </>
        )}
      </Container>
    </>
  );
}

Component.displayName = "Profile";
