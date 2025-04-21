import { Outlet, useOutletContext } from "react-router";
import Instagram from "@/assets/logo_instagram.png";
import { PublicRoutes } from "@/routes/protected";
import { User } from "@/types";

export function Component() {
  const { accessToken, setAccessToken } = useOutletContext() as {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    user: User;
  };
  return (
    <PublicRoutes accessToken={accessToken}>
      <section className="container mx-auto grid grid-cols-12 items-center justify-center min-h-screen">
        <div className="hidden lg:block col-span-6 mx-auto">
          <img src={Instagram} alt="logo" />
        </div>
        <div className="col-span-12 lg:col-span-6 mx-auto">
          <div className="flex md:hidden justify-center mb-4">
            <img src={Instagram} alt="logo" className="w-16 h-16" />
          </div>
          <Outlet context={{ accessToken, setAccessToken }} />
        </div>
      </section>
      <div className="my-12 max-w-[320px] mx-auto">
        <h1 className="text-center text-sm">
          &copy; {new Date().getFullYear()} Instashots
        </h1>
      </div>
    </PublicRoutes>
  );
}

Component.displayName = "AuthLayout";
