import { Link, Outlet, useNavigate, useOutletContext } from "react-router";
import { User } from "@/types";
import { PrivateRoutes } from "@/routes/protected";

export function Component() {
  const navigate = useNavigate();
  const { accessToken, setAccessToken, user } = useOutletContext() as {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    user: User;
  };

  return (
    <PrivateRoutes accessToken={accessToken} user={user}>
      <div className="bg-black/90 min-h-screen">
        <div className={`container mx-auto z-40 py-6 px-2 relative`}>
          <Link
            to="/"
            className={`absolute top-4 left-2 italic text-2xl font-bold text-zinc-100`}
          >
            Instashots
          </Link>
          <i
            onClick={() => navigate("/")}
            role="button"
            className={`ri-close-line cursor-pointer text-4xl text-zinc-100 absolute top-4 right-2 `}
          />
        </div>
        <div className="container mx-auto">
          <Outlet context={{ accessToken, setAccessToken, user }} />
        </div>
      </div>
    </PrivateRoutes>
  );
}

Component.displayName = "ViewPost";
