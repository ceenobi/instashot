import useLocalStorage from "@/hooks/useLocalStorage";
import React, { useCallback, useEffect, useState } from "react";
import { AuthContext } from ".";
import { jwtDecode } from "jwt-decode";
import { logoutUser, refreshToken } from "@/api/auth";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { User } from "@/types";

const queryClient = new QueryClient();

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useLocalStorage(
    "instaPixAccessToken",
    null
  );
  const [isOpenSidebar, setIsOpenSidebar] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      const { data } = await logoutUser();
      if (data.success) {
        setAccessToken(null);
        queryClient.clear();
      }
    } catch (error) {
      setAccessToken(null);
      queryClient.clear();
      console.error("Logout failed:", error);
      toast.error("There was an error while trying to log you out.", {
        id: "logout-error",
      });
    }
  }, [setAccessToken]);

  const setupTokenRefresh = useCallback(() => {
    if (!accessToken) return;
    try {
      const decodedToken = jwtDecode(accessToken);
      const expirationTime = decodedToken?.exp ?? 0;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime * 1000 - currentTime;
      const refreshBuffer = 5 * 60 * 1000;
      const timeUntilRefresh = timeUntilExpiry - refreshBuffer;

      if (timeUntilRefresh <= 0) {
        refreshToken()
          .then(({ data }) => {
            setAccessToken(data.accessToken);
            window.location.reload();
          })
          .catch((error) => {
            console.error(error);
            handleLogout();
          });
      } else {
        const refreshTimer = setTimeout(async () => {
          try {
            const { data } = await refreshToken();
            setAccessToken(data.accessToken);
            window.location.reload();
          } catch (error) {
            console.error(error);
            handleLogout();
          }
        }, timeUntilRefresh);

        return () => clearTimeout(refreshTimer);
      }
    } catch (error) {
      console.error("Error setting up token refresh:", error);
      handleLogout();
    }
  }, [accessToken, setAccessToken, handleLogout]);

  useEffect(() => {
    const cleanup = setupTokenRefresh();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupTokenRefresh]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        handleLogout,
        isOpenSidebar,
        setIsOpenSidebar,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
