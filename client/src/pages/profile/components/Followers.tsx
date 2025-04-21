import ActionButton from "@/components/ActionButton";
import MetaArgs from "@/components/MetaArgs";
import Modal from "@/components/Modal";
import { User } from "@/types";
import { useEffect, useState } from "react";
import {
  Link,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { toast } from "sonner";

export function Component() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { username } = useParams();
  const { data } = useLoaderData();
  const location = useLocation();
  const { user } = useOutletContext<{ user: User }>();
  const [active, setActive] = useState(0);
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const path =
    location.pathname === `/profile/${username}/followers/connections`;

  useEffect(() => {
    if (path) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [path]);

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

  const handleClose = () => {
    setIsOpen(false);
    navigate(`/profile/${username}`);
  };

  return (
    <>
      <MetaArgs title={`@${username} followers`} description="Profile page" />
      <Modal
        isOpen={isOpen}
        id="followersModal"
        title="Followers"
        classname="w-[90%] max-w-[400px] mx-auto py-3 px-0"
      >
        {data?.connections.length === 0 && (
          <p className="text-center p-3">No followers</p>
        )}
        {data?.connections.map((connect: User, index: number) => (
          <div
            key={connect.id}
            className="flex justify-between items-center text-center p-3"
          >
            <Link
              to={`/profile/${connect.username}`}
              className="flex items-center gap-2"
            >
              <div className=" avatar avatar-placeholder">
                <div className="w-10 rounded-full border border-gray-300">
                  {connect.profilePicture ? (
                    <img
                      src={connect.profilePicture}
                      alt={connect.username}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-3xl">
                      {connect.username?.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-start">
                <p className="font-semibold">{connect.username}</p>
                <p className="text-sm text-gray-800">{connect.fullname}</p>
              </div>
            </Link>
            {user.id !== connect.id && (
              <fetcher.Form
                method="patch"
                action={`/profile/${username}/followers/connections`}
              >
                <ActionButton
                  type="button"
                  loading={active === index && fetcher.state === "submitting"}
                  disabled={user.id === connect.id}
                  text={
                    active === index && fetcher.state === "submitting"
                      ? "Updating..."
                      : user.following?.includes(connect.id)
                      ? "Unfollow"
                      : "Follow"
                  }
                  classname="btn btn-sm btn-primary w-[120px]"
                  onClick={() => {
                    setActive(index);
                    fetcher.submit(
                      {
                        id: connect.id,
                      },
                      {
                        method: "patch",
                        action: `/profile/${username}/followers/connections`,
                      }
                    );
                  }}
                />
              </fetcher.Form>
            )}
          </div>
        ))}
        <button
          className="btn btn-circle lg:btn-ghost absolute z-50 right-2 top-1"
          type="button"
          onClick={handleClose}
        >
          ✕
        </button>
      </Modal>
    </>
  );
}

Component.displayName = "Followers";
