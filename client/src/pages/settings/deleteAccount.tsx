import ActionButton from "@/components/ActionButton";
import MetaArgs from "@/components/MetaArgs";
import { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";

export function Component() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const redirect = () => {
    navigate("/");
  };

  useEffect(() => {
    const response = fetcher.data?.data;
    if (!response) return;
    if (response.success) {
      toast.success(response.message, { id: "deleteAccount-success" });
    } else {
      toast.error(response.message);
    }
    navigate("/");
  }, [fetcher.data, navigate]);

  return (
    <>
      <MetaArgs title={`Delete Account`} description="Delete your account" />
      <h1 className="text-xl text-center my-6 font-bold">Delete Account</h1>
      <div className="border-2 border-zinc-200 p-4 rounded-lg w-[85vw] md:w-[500px] mx-auto">
        <div className="rounded-lg p-3">
          <p className="text-md font-semibold">Notice</p>
          <span className="text-sm mt-4">
            This action is irreversible and will delete your account and all of
            your posts, stories, and comments. This action cannot be undone.
          </span>
        </div>
        <div className="mt-4 flex gap-4 items-center justify-end">
          <button className="btn btn-primary" onClick={redirect}>
            Cancel
          </button>
          <fetcher.Form method="delete" action="/settings/delete-account">
            <ActionButton
              classname="btn btn-secondary"
              type="submit"
              loading={fetcher.state !== "idle"}
              text="Delete Account"
            />
          </fetcher.Form>
        </div>
      </div>
    </>
  );
}

Component.displayName = "DeleteAccount";
