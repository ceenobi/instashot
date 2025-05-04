import { useAuth } from "@/context";
import { sidebarLinks } from "@/libs/constants";
import { NavLink, useOutletContext } from "react-router";
import Search from "./Search";
import { User } from "@/types";
import CreatePost from "./CreatePost";
import { useState } from "react";

export default function Footer() {
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const { isOpenSidebar } = useAuth() as {
    isOpenSidebar: boolean;
    setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  };
  const { user } = useOutletContext() as {
    user: User;
  };

  return (
    <div className="md:hidden sticky bottom-0 z-40 py-2 px-4 bg-white dark:bg-base-200">
      <div className="flex justify-around items-center">
        {sidebarLinks.map(({ id, path, Icon }) => (
          <NavLink key={id} to={path}>
            {({ isActive }) => (
              <span>
                <i
                  className={`${Icon} text-2xl ${
                    isActive ? "text-secondary" : ""
                  }`}
                ></i>
              </span>
            )}
          </NavLink>
        ))}
        <CreatePost isOpenSidebar={isOpenSidebar} />
        <Search
          isOpenSidebar={isOpenSidebar}
          isOpen={isOpenSearch}
          setIsOpen={setIsOpenSearch}
        />
        <NavLink to={`/profile/${user?.username}`}>
          <div className="avatar avatar-placeholder">
            <div className={`border w-7 rounded-full`}>
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
        </NavLink>
      </div>
    </div>
  );
}
