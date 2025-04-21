import { useEffect, useOptimistic, useState } from "react";
import { Post, User } from "@/types";
import Modal from "../../../components/Modal";
import { Link, useFetcher } from "react-router";
import { toast } from "sonner";

export default function CardOptions({
  post,
  user,
}: {
  post: Post;
  user: User;
}) {
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useOptimistic(
    user.following?.includes(post.userId || "")
  );
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      setIsFollowing((prev) => !prev);
      if (fetcher.data.success) {
        setIsFollowing(true);
        toast.success(fetcher.data.message, { id: "follow-user" });
      } else {
        toast.error(fetcher.data.message || fetcher.data.error, {
          id: "follow-userError",
        });
      }
    }
  }, [fetcher.data, setIsFollowing]);

  return (
    <>
      <i
        className="ri-more-line text-2xl cursor-pointer"
        role="button"
        title="more options"
        onClick={() => setIsOptionsOpen(true)}
      ></i>
      <Modal
        isOpen={isOptionsOpen}
        id="create-optionsModal"
        classname="w-[90%] max-w-[400px] mx-auto p-0"
        onClose={() => setIsOptionsOpen(false)}
      >
        <div className="text-center p-3">
          {user.id !== post.userId && (
            <>
              <fetcher.Form method="patch" action={`/?index`}>
                <p
                  className="font-semibold cursor-pointer"
                  role="buton"
                  onClick={() =>
                    fetcher.submit(
                      {
                        id: post.userId as string,
                        type: "followUser",
                      },
                      { method: "patch", action: `/?index` }
                    )
                  }
                >
                  {fetcher.state === "submitting"
                    ? "Updating..."
                    : isFollowing
                    ? "Unfollow"
                    : "Follow"}
                </p>
              </fetcher.Form>
              <div className="divider my-2"></div>
            </>
          )}
          <p className="font-medium" title="View post">
            <Link to={`/post/${post.id}`}>Go to post</Link>
          </p>
          <div className="divider my-2"></div>
          <p
            onClick={() => setIsOptionsOpen(false)}
            className="font-medium cursor-pointer"
          >
            Cancel
          </p>
        </div>
      </Modal>
    </>
  );
}
