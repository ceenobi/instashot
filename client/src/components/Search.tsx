import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Form, Link } from "react-router";
import { search } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function Search({
  isOpen,
  setIsOpen,
  isOpenSidebar,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenSidebar: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearch, setRecentSearch] = useLocalStorage("recentSearch", null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: () => search(searchTerm),
    enabled: !!searchTerm,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    meta: {
      debounce: {
        wait: 500,
        leading: false,
        trailing: true,
      },
    },
  });
  const { users, posts } = data?.data || { users: [], posts: [] };
  const searchResults = useMemo(() => {
    return [
      ...users,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...posts.map((post: any) => ({
        ...post,
        caption: post.caption,
        tags: post.tags.find((tag: string) => tag === searchTerm),
      })),
    ];
  }, [users, posts, searchTerm]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (searchResults?.length > 0) {
      const uniqueUsernames = new Set<string>();
      const currentRecent =
        recentSearch?.filter((user: User) => {
          const isUnique = !uniqueUsernames.has(
            user.username || (user.caption as unknown as string)
          );
          if (isUnique)
            uniqueUsernames.add(
              user.username || (user.caption as unknown as string)
            );
          return isUnique;
        }) || [];

      const newUsers = searchResults.filter((user: User) => {
        const isUnique = !uniqueUsernames.has(
          user.username || (user.caption as unknown as string)
        );
        if (isUnique)
          uniqueUsernames.add(
            user.username || (user.caption as unknown as string)
          );
        return isUnique;
      });
      const limitedRecent = [...newUsers, ...currentRecent].slice(0, 10);
      // Only update if the recent search has actually changed
      if (JSON.stringify(recentSearch) !== JSON.stringify(limitedRecent)) {
        setRecentSearch(limitedRecent);
      }
    }
  }, [searchResults, recentSearch, setRecentSearch]);

  const clearAll = useCallback(() => {
    setRecentSearch(null);
    localStorage.removeItem("recentSearch");
  }, [setRecentSearch]);

  const deleteRecentSearch = useCallback(
    (index: number) => {
      setRecentSearch(
        recentSearch.filter((_: unknown, i: number) => i !== index)
      );
    },
    [recentSearch, setRecentSearch]
  );

  return (
    <>
      <div
        className={`tooltip tooltip-right flex gap-3 items-center p-3 cursor-pointer hover:font-bold hover:text-zinc-800 dark:hover:text-zinc-200 hover:transition duration-150 ease-out rounded-lg z-50 ${
          isOpenSidebar
            ? "md:hover:bg-zinc-100 md:dark:hover:bg-zinc-500"
            : "border border-amber-50 rounded-lg"
        }`}
        data-tip={isOpenSidebar ? undefined : "Search"}
        onClick={isOpen ? handleClose : handleOpen}
      >
        <i
          className={`ri-search-line text-2xl ${
            isOpen ? "font-bold text-secondary" : ""
          }`}
        ></i>
        {isOpenSidebar && (
          <span className="hidden md:block md:tooltiptext text-md">Search</span>
        )}
      </div>
      <div
        className={`drawer fixed top-0 md:left-[80px] z-50 ${
          isOpen ? "drawer-open" : ""
        }`}
      >
        <input
          type="checkbox"
          className="drawer-toggle"
          checked={isOpen}
          onChange={() => setIsOpen(!isOpen)}
        />
        <div className="drawer-side">
          <label
            className="drawer-overlay"
            onClick={() => setIsOpen(false)}
          ></label>
          <div className="menu w-90 h-screen bg-base-200 text-base-content p-4">
            <div className="md:mt-2 mb-4">
              <h1 className="text-lg font-bold mb-2">Search</h1>
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                type="button"
                onClick={handleClose}
              >
                ✕
              </button>
              <Form role="search" id="search-InstaShots" className="relative">
                <input
                  type="text"
                  ref={inputRef}
                  placeholder="Search users or tags"
                  className="input input-bordered w-full"
                  value={searchTerm}
                  aria-label="Search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isLoading ? (
                  <span className="loading loading-dots loading-xs absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2"></span>
                ) : (
                  <button
                    type="button"
                    className="absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="ri-close-circle-line text-xl cursor-pointer"></i>
                  </button>
                )}
              </Form>
              <div className="divider"></div>
              {error && <p className="text-red-500">{error.message}</p>}
              {searchTerm && searchResults?.length === 0 ? (
                <p className="text-center p-3">No results</p>
              ) : (
                <>
                  {recentSearch?.length > 0 && !searchTerm ? (
                    <>
                      <div className="mb-4 flex justify-between items-center">
                        <h1 className="font-bold">Recent</h1>
                        <button
                          type="button"
                          className="text-blue-600 cursor-pointer"
                          onClick={clearAll}
                        >
                          Clear all
                        </button>
                      </div>
                      {recentSearch?.map((result: User, index: number) => (
                        <div
                          key={result.id}
                          className="flex justify-between items-center hover:bg-base-300 p-3 rounded-lg"
                        >
                          <Link
                            to={
                              result.username
                                ? `/profile/${result.username}`
                                : `/tag/${searchTerm}`
                            }
                            className="flex items-center gap-4"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className=" avatar avatar-placeholder">
                              <div className="w-10 rounded-full border border-gray-300">
                                {result.profilePicture ? (
                                  <img
                                    src={result.profilePicture}
                                    alt={result.username}
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-3xl">
                                    {result.username?.charAt(0) || "#"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold">
                                {result.username || (result.caption as string)}
                              </p>
                              <p className="text-sm">
                                {result.fullname || (result.tags as string)}
                              </p>
                            </div>
                          </Link>
                          <i
                            className="ri-close-line text-xl cursor-pointer"
                            role="button"
                            onClick={() => deleteRecentSearch(index)}
                          ></i>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {searchResults?.map((result) => (
                        <Link
                          to={
                            result.username
                              ? `/profile/${result.username}`
                              : `/tag/${searchTerm}`
                          }
                          className="flex items-center gap-4 hover:bg-base-300 p-3 rounded-lg"
                          key={result.id}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className=" avatar avatar-placeholder">
                            <div className="w-10 rounded-full border border-gray-300">
                              {result.profilePicture ? (
                                <img
                                  src={result.profilePicture}
                                  alt={result.username}
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-3xl">
                                  {result?.username
                                    ? result.username?.charAt(0)
                                    : "#"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {result.username || result.tags}
                            </p>
                            <p className="text-sm">
                              {result.fullname ||
                                `${searchResults.length} posts`}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
