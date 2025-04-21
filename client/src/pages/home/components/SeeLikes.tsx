import ActionButton from "@/components/ActionButton";
import Modal from "@/components/Modal";
import { Post, User } from "@/types";
import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router";
import { toast } from "sonner";

export default function SeeLikes({
  post,
  user,
  likeCount,
}: {
  post: Post;
  user: User;
  likeCount: number;
}) {
  const [isLikesOpen, setIsLikesOpen] = useState<boolean>(false);
  const [active, setActive] = useState(0);
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, { id: "follow-user" });
      } else {
        toast.error(fetcher.data.message || fetcher.data.error, {
          id: "follow-userError",
        });
      }
    }
  }, [fetcher.data]);

  return (
    <>
      <p
        className="cursor-pointer hover:text-gray-500 px-4 md:px-0"
        title="See who liked post"
        onClick={() => setIsLikesOpen(true)}
      >
        {likeCount || 0} likes
      </p>
      <Modal
        isOpen={isLikesOpen}
        id="create-optionsModal"
        title="Likes"
        classname="w-[90%] max-w-[400px] mx-auto py-3 px-0"
        onClose={() => setIsLikesOpen(false)}
      >
        {post?.likes?.length === 0 && <p className="text-center my-6">No likes yet</p>}
        {post?.likes?.map((item, index) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-center p-3"
          >
            <Link
              to={`/profile/${item.username}`}
              className="flex items-center"
            >
              <div className=" avatar avatar-placeholder">
                <div className="w-9 rounded-full border border-gray-300">
                  {item.profilePicture ? (
                    <img
                      src={item.profilePicture}
                      alt={item.username}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-3xl">{item.username?.charAt(0)}</span>
                  )}
                </div>
              </div>
              <p className="ml-2 font-semibold">{item.username}</p>
            </Link>
            {user.id !== item.id && (
              <fetcher.Form method="patch" action={`/?index`}>
                <ActionButton
                  type="button"
                  loading={active === index && fetcher.state === "submitting"}
                  disabled={user.id === item.id}
                  text={
                    active === index && fetcher.state === "submitting"
                      ? "Updating..."
                      : user.following?.includes(item.id)
                      ? "Unfollow"
                      : "Follow"
                  }
                  classname="btn btn-sm btn-primary w-[120px]"
                  onClick={() => {
                    setActive(index);
                    fetcher.submit(
                      {
                        id: item.id,
                        type: "followUser",
                      },
                      {
                        method: "patch",
                        action: `/?index`,
                      }
                    );
                  }}
                />
              </fetcher.Form>
            )}
          </div>
        ))}
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          type="button"
          onClick={() => setIsLikesOpen(false)}
        >
          ✕
        </button>
      </Modal>
    </>
  );
}
