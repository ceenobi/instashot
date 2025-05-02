import {
  Outlet,
  ScrollRestoration,
  // useNavigation,
  useRouteLoaderData,
} from "react-router";
import { useAuth } from "@/context";
// import { DataSpinner } from "@/components/Spinner";
import { User } from "@/types";

export function Component() {
  const { accessToken, setAccessToken } = useAuth();
  const routeData =
    (useRouteLoaderData("authUser") as {
      data: { user: User };
    }) || {};
  //const navigation = useNavigation();
  //const isNavigating = Boolean(navigation.location);
const user = routeData?.data?.user

  return (
    <>
      {/* {isNavigating ? (
        <DataSpinner />
      ) : ( */}
      <>
        <Outlet context={{ accessToken, setAccessToken, user }} />
        <ScrollRestoration />
      </>
    </>
  );
}

Component.displayName = "Root";
