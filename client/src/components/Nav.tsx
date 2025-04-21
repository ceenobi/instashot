import { NavLink } from "react-router";
import Instashots from "@/assets/logo_instagram.png";
import { useAuth } from "@/context";
import Notification from "./Notification";
import { useState } from "react";

export default function Nav() {
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const { handleLogout, isOpenSidebar } = useAuth();
  return (
    <>
      <div className="md:hidden w-full fixed top-0 z-40 py-2 px-4 shadow bg-white dark:bg-base-200">
        <div className="flex justify-between items-center">
          <NavLink
            to="/"
            className="text-2xl font-bold italic flex items-center gap-1"
          >
            <img src={Instashots} alt="logo" className="w-[40px] h-[40px]" />
            <span>Instashots</span>
          </NavLink>
          <div className="flex gap-5 items-center px-4">
            {/* <i className="ri-notification-line text-2xl"></i> */}
            <Notification
              isOpenSidebar={isOpenSidebar}
              isOpen={isOpenNotification}
              setIsOpen={setIsOpenNotification}
            />
            <NavLink to="/settings">
              <i className="ri-settings-line text-2xl"></i>
            </NavLink>
            <a onClick={handleLogout}>
              <i className="ri-shut-down-line text-2xl"></i>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
