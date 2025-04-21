import ActionButton from "@/components/ActionButton";
import { useAuth } from "@/context";
import { User } from "@/types";
import { useEffect } from "react";
import { useFetcher, useOutletContext } from "react-router";
import { toast } from "sonner";

export function Component() {
  const { user } = useOutletContext() as {
    user: User;
  };
  const { handleLogout } = useAuth();
  const fetcher = useFetcher();

  useEffect(() => {
    const logoutTimer = setTimeout(() => {
      handleLogout();
    }, 30 * 60 * 1000);
    return () => clearTimeout(logoutTimer);
  }, [handleLogout]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, {
          id: "verifyEmail-success",
        });
      } else {
        toast.error(fetcher.data.message);
      }
    }
  }, [fetcher.data]);

  return (
    <>
      <section className="max-w-[750px] mx-auto py-6 px-4">
        <div className="flex justify-center items-center min-h-screen flex-col text-center">
          <h1 className="text-4xl mb-2">Hi, {user?.fullname}</h1>
          <p className="text-xl font-medium">
            You have yet to verify your email
          </p>
          <p className="mb-4">
            Please click the button below to send a new verification email
          </p>
          <fetcher.Form method="post" action="/verify-email">
            <ActionButton
              classname="btn btn-primary w-[250px]"
              type="submit"
              loading={fetcher.state !== "idle"}
              text="Send new verification email"
            />
          </fetcher.Form>
          <p className="mt-4 text-sm">
            If you have not received a verification email, please check your
            spam/junk folder. You will be automatically logged out in 30 minutes
            if you do not verify your email.
          </p>
        </div>
      </section>
    </>
  );
}

Component.displayName = "VerifyEmail";
