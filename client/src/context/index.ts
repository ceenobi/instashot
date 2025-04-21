import { User } from "@/types";
import { createContext, useContext } from "react";

export const AuthContext = createContext<
  | {
      accessToken: string;
      setAccessToken: React.Dispatch<React.SetStateAction<string>>;
      handleLogout: () => void;
      isOpenSidebar: boolean;
      setIsOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
      user: User | null;
      setUser: React.Dispatch<React.SetStateAction<User | null>>;
    }
  | undefined
>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
