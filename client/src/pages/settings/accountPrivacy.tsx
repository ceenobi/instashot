import MetaArgs from "@/components/MetaArgs";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { useFetcher, useOutletContext } from "react-router";
import { toast } from "sonner";

export function Component() {
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const { user } = useOutletContext() as {
    user: User;
  };
  const fetcher = useFetcher();

  const handleToggle = () => {
    setIsPublic((prev) => !prev);
    fetcher.submit(
      { isPublic },
      { method: "patch", action: "/settings/account-privacy" }
    );
  };

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, { id: "update-privacy" });
      } else if (fetcher.data.success === false || fetcher.data.error) {
        toast.error(fetcher.data.message || fetcher.data.error, {
          id: "update-privacy",
        });
      }
    }
  }, [fetcher.data]);

  return (
    <>
      <MetaArgs
        title={`Account Privacy`}
        description="Update your account privacy"
      />
      <h1 className="text-xl text-center my-6 font-bold">Account Privacy</h1>
      <div className="border-2 border-zinc-200 p-4 rounded-lg w-[85vw] md:w-[500px] mx-auto">
        <div className="rounded-lg p-3">
          <p className="text-md font-semibold">Private account</p>
          <span className="text-sm mt-4">
            When your account is public, your profile and posts can be seen by
            anyone. When your account is private, only the followers you approve
            can see what you share, including your photos or hashtag, and your
            followers and following lists. Certain info on your profile, like
            your profile picture and username, is visible to everyone on
            Instapics.
          </span>
        </div>
        <fetcher.Form
          className="w-full "
          method="patch"
          action="/settings/account-privacy"
        >
          <div className="mt-4 flex gap-4 items-center justify-end">
            <span className="text-black font-semibold">
              Toggle status: {user?.isPublic ? "Public" : "Private"}
            </span>
            <input
              type="checkbox"
              onChange={handleToggle}
              className="toggle"
              defaultChecked={Boolean(user?.isPublic)}
            />
          </div>
        </fetcher.Form>
      </div>
    </>
  );
}

Component.displayName = "AccountPrivacy";
