import { useFetcher, useOutletContext } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "@/types";
import Modal from "@/components/Modal";
import { useFile } from "@/hooks/useFile";
import { toast } from "sonner";

export default function ProfileImage({ profileData }: { profileData: User }) {
  const { user } = useOutletContext() as { user: User };
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const fetcher = useFetcher();
  const { selectedFile, setSelectedFile, handleFile } = useFile();
  const fileRef = useRef<string | null>(null);
  const hasSubmittedRef = useRef(false);

  const onFormSubmit = useCallback(() => {
    if (fileRef.current && !hasSubmittedRef.current) {
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);
      formData.append("type", "profilePicture");
      fetcher.submit(formData, {
        method: "patch",
        action: `/profile/${profileData?.username}`,
      });
      hasSubmittedRef.current = true;
    }
  }, [fetcher, profileData?.username, selectedFile]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message);
        setIsOpen(false);
        setSelectedFile("");
      } else if (fetcher.data.success === false || fetcher.data.error) {
        toast.error(fetcher.data.message || fetcher.data.error);
        setSelectedFile("");
        hasSubmittedRef.current = false;
      }
    }
  }, [fetcher.data, setSelectedFile]);

  useEffect(() => {
    fileRef.current = selectedFile;
    if (selectedFile !== "") {
      onFormSubmit();
    }
    setSelectedFile("");
  }, [selectedFile, onFormSubmit, setSelectedFile]);

  return (
    <>
      <div
        className={`avatar flex justify-center ${
          user?.username === profileData?.username ? "cursor-pointer" : ""
        }`}
        onClick={
          user?.username === profileData?.username
            ? () => setIsOpen(true)
            : () => {}
        }
      >
        <div className="avatar avatar-placeholder">
          <div
            className={`w-20 md:w-[160px] rounded-full border border-gray-300 `}
          >
            {profileData?.profilePicture ? (
              <img
                src={profileData?.profilePicture}
                alt={profileData?.username}
                title="change profile photo"
              />
            ) : (
              <span className="text-7xl" title="change profile photo">
                {profileData?.username?.charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        id="updateModal"
        title="Change Profile Image"
        classname="w-[90%] max-w-[400px] mx-auto py-3 px-0"
        onClose={() => setIsOpen(false)}
      >
        <div className="divider"></div>
        <fetcher.Form
          className="px-4 text-center"
          method="patch"
          action={`/profile/${profileData?.username}`}
        >
          <div className="form-control w-full">
            <label htmlFor="profilePicture" className="label">
              <span className="cursor-pointer">
                {fetcher.state === "idle"
                  ? "Upload new profile photo"
                  : "Uploading..."}
              </span>
            </label>
            <input
              type="file"
              name="profilePicture"
              id="profilePicture"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </fetcher.Form>
        <div className="divider"></div>
        <p
          className="text-center cursor-pointer"
          onClick={() => {
            setSelectedFile("");
            setIsOpen(false);
            hasSubmittedRef.current = false;
          }}
        >
          Cancel
        </p>
      </Modal>
    </>
  );
}
