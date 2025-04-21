import Modal from "@/components/Modal";
import { Story } from "@/types";
import { useState } from "react";
import { Link } from "react-router";

export default function Liked({
  currentStory,
}: {
  currentStory: Story | null;
}) {
  const [isLikesOpen, setIsLikesOpen] = useState<boolean>(false);

  return (
    <>
      <div
        role="button"
        className="cursor-pointer"
        onClick={() => setIsLikesOpen(true)}
      >
        <i className="ri-more-2-fill text-white text-xl"></i>
      </div>
      <Modal
        isOpen={isLikesOpen}
        id="LikesoptionsModal"
        title="Story Likes"
        classname="w-[90%] max-w-[400px] mx-auto py-3 px-0"
        onClose={() => setIsLikesOpen(false)}
      >
        {currentStory?.storyLikes && currentStory?.storyLikes?.length > 0 ? (
          <>
            {currentStory?.storyLikes?.map((item, index) => (
              <div
                key={index}
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
                        <span className="text-3xl">
                          {item.username?.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="ml-2 font-semibold">{item.username}</p>
                </Link>
              </div>
            ))}
          </>
        ) : (
          <p className="text-center">No likes yet</p>
        )}
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
