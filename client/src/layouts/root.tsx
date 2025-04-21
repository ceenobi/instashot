import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Sidebar from "@/components/Sidebar";
import { PrivateRoutes } from "@/routes/protected";
import { User } from "@/types";
import { Outlet, useOutletContext } from "react-router";

export function Component() {
  const { accessToken, setAccessToken, user } = useOutletContext() as {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    user: User;
  };

  return (
    <PrivateRoutes accessToken={accessToken} user={user}>
      <section>
        <Nav />
        <Sidebar />
        <div className="md:ml-[220px] xl:ml-[240px] min-h-[100dvh] mt-14 md:mt-0">
          <div className="container mx-auto">
            <Outlet context={{ accessToken, setAccessToken, user }} />
          </div>
        </div>
        <Footer />
      </section>
    </PrivateRoutes>
  );
}

Component.displayName = "RootLayout";
