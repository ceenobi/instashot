import Instashots from "@/assets/logo_instagram.png";
import { useAuth } from "@/context";
import { sidebarLinks } from "@/libs/constants";
import { User } from "@/types";
import { NavLink, useOutletContext } from "react-router";
import CreatePost from "./CreatePost";
import Search from "./Search";
import Notification from "./Notification";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const { handleLogout, isOpenSidebar, setIsOpenSidebar } = useAuth() as {
    handleLogout: () => void;
    isOpenSidebar: boolean;
    setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  };
  const { user } = useOutletContext() as { user: User };

  useEffect(() => {
    if (isOpenSearch) {
      setIsOpenSidebar(false);
      setIsOpenNotification(false);
    } else if (isOpenNotification || isOpenSearch) {
      setIsOpenSearch(false);
      setIsOpenSidebar(false);
    } else {
      setIsOpenSidebar(true);
    }
  }, [
    isOpenSearch,
    setIsOpenSidebar,
    isOpenNotification,
    setIsOpenNotification,
  ]);

  return (
    <div
      className={`hidden md:block min-h-screen fixed z-50 shadow border-r border-gray-200 ${
        isOpenSidebar ? "w-[220px] xl:w-[240px]" : "w-[80px]"
      }`}
    >
      <div
        className={`flex flex-col min-h-screen justify-between py-6 px-4 ${
          isOpenSidebar ? "" : "items-center"
        }`}
      >
        <div>
          <div
            className={`flex gap-3 items-center mb-10 ${
              !isOpenSidebar ? "justify-center" : ""
            }`}
          >
            <img src={Instashots} alt="logo" className="w-[40px] h-[40px]" />
            {isOpenSidebar && (
              <h1 className="text-2xl font-bold italic">Instashots</h1>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {sidebarLinks.map(({ id, Icon, name, path }) => (
              <NavLink
                key={id}
                to={path}
                className="tooltip tooltip-right z-50"
                data-tip={isOpenSidebar ? undefined : name}
                viewTransition
                end
              >
                {({ isActive }) => (
                  <span
                    className={`flex items-center gap-3 p-3 hover:font-bold light:hover:text-zinc-800 hover:transition duration-150 ease-out text-md hover:bg-zinc-100  dark:hover:bg-zinc-500 rounded-lg ${
                      isActive ? "font-bold" : ""
                    }`}
                  >
                    <i className={`${Icon} text-2xl`}></i>
                    {isOpenSidebar && name}
                  </span>
                )}
              </NavLink>
            ))}
            <Search
              isOpenSidebar={isOpenSidebar}
              isOpen={isOpenSearch}
              setIsOpen={setIsOpenSearch}
            />
            <Notification
              isOpenSidebar={isOpenSidebar}
              isOpen={isOpenNotification}
              setIsOpen={setIsOpenNotification}
            />
            <CreatePost isOpenSidebar={isOpenSidebar} />
            <NavLink
              className={({ isActive }) =>
                `flex gap-3 items-center hover:font-bold light:hover:text-zinc-800 hover:transition duration-150 ease-out p-3 hover:bg-zinc-100 dark:hover:bg-zinc-500 tooltip tooltip-right rounded-lg z-50 ${
                  isActive ? "font-bold" : ""
                }`
              }
              to={`/profile/${user?.username}`}
              data-tip={isOpenSidebar ? undefined : "Profile"}
              viewTransition
            >
              <div className="avatar avatar-placeholder">
                <div
                  className={`${
                    !user?.profilePicture ? "border" : ""
                  } w-7 rounded-full`}
                >
                  {user?.profilePicture ? (
                    <img
                      src={user?.profilePicture}
                      alt={user?.username}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-md">{user?.username?.charAt(0)}</span>
                  )}
                </div>
              </div>
              {isOpenSidebar && <p className="text-md">Profile</p>}
            </NavLink>
          </div>
        </div>
        <div className="dropdown dropdown-top">
          <div
            tabIndex={0}
            role="button"
            className="m-1 flex items-center cursor-pointer"
          >
            <i className="ri-menu-line text-2xl mr-2"></i>
            {isOpenSidebar && <span className="text-lg">More</span>}
          </div>
          <ul
            tabIndex={0}
            className={`dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm ${
              isOpenSidebar ? "w-full" : "w-[200px]"
            }`}
          >
            <li>
              <NavLink to="/settings">
                <i className="ri-settings-line text-2xl"></i> Settings
              </NavLink>
            </li>
            <li>
              <a onClick={handleLogout}>
                <i className="ri-logout-box-line text-2xl"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
