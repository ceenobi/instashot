import { useEffect, useMemo, useState } from "react";
import { Link, useRouteLoaderData } from "react-router";

interface Notification {
  notificationId: string;
  message: string;
  type: string;
  postId: string;
  fromUser: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  timestamp: number;
}

export default function Notification({
  isOpen,
  setIsOpen,
  isOpenSidebar,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenSidebar: boolean;
}) {
  const { data } = useRouteLoaderData("notifications");
  const notifications = useMemo(
    () => data?.notifications || [],
    [data?.notifications]
  );
  const [readIds, setReadIds] = useState<string[]>([]);
  const [visibleNotifications, setVisibleNotifications] =
    useState<Notification[]>(notifications);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const deleteNotification = (id: string) => {
    setVisibleNotifications((prev) =>
      prev.filter((n) => n.notificationId !== id)
    );
    setReadIds((prev) => prev.filter((readId) => readId !== id));
  };

  const clearNotifications = () => {
    setVisibleNotifications([]);
    setReadIds([]);
  };
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div
        className={`tooltip tooltip-right flex gap-3 items-center p-3 cursor-pointer hover:font-bold hover:text-zinc-800 dark:hover:text-zinc-200 hover:transition duration-150 ease-out rounded-lg z-50 relative ${
          isOpenSidebar
            ? "md:hover:bg-zinc-100 md:dark:hover:bg-zinc-500"
            : "border border-amber-50 rounded-lg"
        }`}
        data-tip={isOpenSidebar ? undefined : "Notifications"}
        onClick={isOpen ? handleClose : handleOpen}
      >
        <i
          className={`ri-notification-line text-2xl ${
            isOpen ? "font-bold text-secondary" : ""
          }`}
        >
          {notifications.some(
            (n: Notification) => !readIds.includes(n.notificationId)
          ) && (
            <div className="absolute top-2 left-1 badge badge-secondary badge-xs"></div>
          )}
        </i>
        {isOpenSidebar && (
          <span className="hidden md:block md:tooltiptext text-md">
            Notifications
          </span>
        )}
      </div>
      <div
        className={`drawer fixed top-0 left-0 md:left-[80px] z-50 ${
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
              <h1 className="text-lg font-bold mb-2">Notifications</h1>
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                type="button"
                onClick={handleClose}
              >
                ✕
              </button>
              <div className="divider"></div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  {visibleNotifications.length - readIds.length} unread
                </span>
                <button
                  onClick={clearNotifications}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                  type="button"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {visibleNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </div>
                ) : (
                  visibleNotifications.map((notification) => (
                    <div
                      key={notification.notificationId}
                      className={`flex items-center gap-3 p-3 rounded-lg shadow transition-colors duration-200 cursor-pointer ${
                        !readIds.includes(notification.notificationId)
                          ? "bg-amber-50 dark:bg-amber-900/30"
                          : "bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      }`}
                      onClick={() => markAsRead(notification.notificationId)}
                    >
                      <img
                        src={
                          notification.fromUser?.profilePicture ||
                          "/default-avatar.png"
                        }
                        alt={notification.fromUser?.username}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <Link
                        to={`/post/${notification.postId}`}
                        className="flex-1"
                        onClick={handleClose}
                      >
                        <span className="font-semibold text-sm">
                          {notification.fromUser?.username}
                        </span>
                        <span className="ml-1 text-sm">
                          {notification.message.replace(
                            `${notification.fromUser?.username} `,
                            ""
                          )}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </Link>
                      {!readIds.includes(notification.notificationId) && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.notificationId);
                        }}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 ml-2"
                        title="Delete"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

{
  // useEffect(() => {
  //   const storedNotifications = localStorage.getItem("notifications");
  //   if (storedNotifications) {
  //     const parsed = JSON.parse(storedNotifications);
  //     setNotifications(parsed);
  //     setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
  //   }
  // }, []);
  // useEffect(() => {
  //   const storyChannel = pusher.subscribe("story-channel");
  //   const postChannel = pusher.subscribe("post-channel");
  //   const handleNewNotification = (data: unknown) => {
  //     // Check if this notification is meant for the current user
  //     const isForCurrentUser =
  //       data &&
  //       ((data as { userId?: string }).userId === userId ||
  //         (data as { storyOwner?: string }).storyOwner === userId);
  //     if (isForCurrentUser) {
  //       const newNotification: Notification = {
  //         id: (data as { notificationId: string }).notificationId,
  //         message: (data as { message: string }).message,
  //         type: (data as { type: "POST_LIKE" | "STORY_LIKE" | "STORY_VIEW" })
  //           .type,
  //         timestamp: new Date().toISOString(),
  //         read: false,
  //       };
  //       setNotifications((prev) => [newNotification, ...prev]);
  //       setUnreadCount((prev) => prev + 1);
  //       // Save to localStorage
  //       localStorage.setItem(
  //         "notifications",
  //         JSON.stringify([newNotification, ...notifications])
  //       );
  //     }
  //   };
  //   storyChannel.bind("like-story", handleNewNotification);
  //   storyChannel.bind("story-viewed", handleNewNotification);
  //   postChannel.bind("like-post", handleNewNotification);
  //   return () => {
  //     storyChannel.unbind("like-story");
  //     storyChannel.unbind("story-viewed");
  //     postChannel.unbind("like-post");
  //     pusher.unsubscribe("story-channel");
  //     pusher.unsubscribe("post-channel");
  //   };
  // }, [notifications, userId]);
  // const deleteNotification = (id: string) => {
  //   setNotifications((prev) => prev.filter((n) => n.id !== id));
  //   setUnreadCount((prev) => {
  //     const unreadCount =
  //       prev - Number(!notifications.find((n) => n.id === id)?.read);
  //     return unreadCount < 0 ? 0 : unreadCount;
  //   });
  //   localStorage.setItem(
  //     "notifications",
  //     JSON.stringify(notifications.filter((n) => n.id !== id))
  //   );
  // };
  // const markAsRead = (id: string) => {
  //   setNotifications((prev) =>
  //     prev.map((n) => (n.id === id ? { ...n, read: true } : n))
  //   );
  //   setUnreadCount((prev) => prev - 1);
  //   localStorage.setItem("notifications", JSON.stringify(notifications));
  // };
  // const clearNotifications = () => {
  //   setNotifications([]);
  //   setUnreadCount(0);
  //   localStorage.removeItem("notifications");
  // };
  /* <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  {unreadCount} unread
                </span>
                <button
                  onClick={clearNotifications}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                  type="button"
                >
                  Clear all
                </button>
              </div> */
}
{
  /* <div className="flex flex-col gap-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`flex items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer ${
                        !notification.read
                          ? "bg-amber-50 dark:bg-amber-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-500"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div> */
}
