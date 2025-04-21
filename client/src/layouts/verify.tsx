import { VerifyMailRoute } from "@/routes/protected";
import { User } from "@/types";
import { Outlet, useOutletContext } from "react-router";

export function Component() {
  const { accessToken, setAccessToken, user } = useOutletContext() as {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    user: User;
  };
  return (
    <VerifyMailRoute user={user} accessToken={accessToken}>
      <Outlet context={{ accessToken, setAccessToken, user }} />
    </VerifyMailRoute>
  );
}
Component.displayName = "VerifyLayout";