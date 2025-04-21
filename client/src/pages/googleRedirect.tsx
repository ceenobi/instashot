import { PrivateRoutes } from "@/routes/protected";
import { User } from "@/types";
import { useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router";
import { toast } from "sonner";

export function Component() {
  const { accessToken, setAccessToken, user } = useOutletContext() as {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    user: User;
  };
  const [searchParams] = useSearchParams();
  const googleAccessToken = searchParams.get("accessToken");

  useEffect(() => {
    if (googleAccessToken) {
      setAccessToken(googleAccessToken);
      toast.success("Authentication successfull", {
        id: "googleRedirect-success",
      });
    }
    const redirect = setTimeout(() => {
      window.location.href = "/";
    }, 500);
    return () => clearTimeout(redirect);
  }, [googleAccessToken, setAccessToken]);

  return (
    <PrivateRoutes accessToken={accessToken} user={user}>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-center items-center min-h-screen flex-col gap-4">
          <p className="text-gray-600">Redirecting you to the home page...</p>
        </div>
      </div>
    </PrivateRoutes>
  );
}

Component.displayName = "GoogleRedirect";
