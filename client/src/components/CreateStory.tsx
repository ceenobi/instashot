import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useFetcher, useLocation, useNavigate } from "react-router";
import Modal from "./Modal";
import { useFiles } from "@/hooks/useFile";
import ActionButton from "./ActionButton";
import { toast } from "sonner";
import { User } from "@/types";

export default function CreateStory({ user }: { user: User }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const fetcher = useFetcher();
  const location = useLocation();
  const from = location.state?.from || "/";
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const { selectedFiles, setSelectedFiles, err, setErr, handleImage } =
    useFiles();
  const handleClose = () => setIsOpenModal(false);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message);
        reset();
        setIsOpenModal(false);
        navigate(from, { replace: true });
      } else if (fetcher.data.success === false || fetcher.data.error) {
        toast.error(fetcher.data.message || fetcher.data.error);
      }
    }
  }, [fetcher.data, from, navigate, reset]);

  const onFormSubmit: SubmitHandler<FieldValues> = (data) => {
    if (selectedFiles.length === 0) {
      setErr("At least one media file is required");
      return false;
    }
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as unknown as Blob);
    });
    selectedFiles.forEach((file) => {
      formData.append("media", file.preview as unknown as string);
    });
    formData.append("type", "createStory");
    fetcher.submit(formData, {
      method: "post",
      action: "/?index",
    });
  };

  return (
    <>
      <div className="flex flex-col justify-center">
        <button
          className="btn btn-circle btn-lg relative"
          type="button"
          title="Create story"
          onClick={() => setIsOpenModal(true)}
        >
          {user?.profilePicture ? (
            <img
              src={user?.profilePicture}
              alt={user?.username}
              className="w-12 rounded-full absolute opacity-60"
            />
          ) : (
            <span className="text-3xl opacity-60">{user?.username?.charAt(0)}</span>
          )}
          <i className="ri-image-add-fill text-xl font-bold absolute top-[80%] -right-2 -translate-y-1/2 z-30"></i>
        </button>
        <p className="text-xs font-semibold">Your story</p>
      </div>
      <Modal
        isOpen={isOpenModal}
        title="Create a story"
        id="storyModal"
        classname="max-w-xl"
      >
        <fetcher.Form className="mt-4" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="form-control w-full">
            <label
              htmlFor="story"
              className="h-[300px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-auto p-2"
            >
              {selectedFiles?.length === 0 ? (
                <div className="text-center">
                  <i className="ri-image-add-fill text-4xl"></i>
                  <p>Upload media</p>
                  <p className="text-xs text-gray-500">
                    Upload up to 10 files (max 10MB each)
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 w-full relative z-20">
                  {selectedFiles.map(({ file, preview }, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith("image") && (
                        <img
                          src={preview as string}
                          alt={`preview-${index}`}
                          className="w-full h-[120px] aspect-square object-cover rounded-lg"
                        />
                      )}
                      {file.type.startsWith("video") && (
                        <video
                          src={preview as string}
                          controls
                          className="w-full h-[120px] object-contain rounded-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </label>
            <input
              type="file"
              id="story"
              name="media"
              accept="image/*, video/*"
              multiple
              className="hidden"
              onChange={handleImage}
            />
            {err && <span className="mt-4 text-xs text-red-600">{err}</span>}
          </div>
          <div className="form-control mt-8 text-start">
            <label className="floating-label">
              <span className="label-text">Caption</span>
              <input
                type="text"
                id="caption"
                className="input input-md w-full"
                placeholder="Add a caption (optional)"
                {...register("caption")}
              />
            </label>
          </div>
          <ActionButton
            text="Share"
            type="submit"
            loading={fetcher.state !== "idle"}
            classname="mt-4 w-full btn-secondary"
          />
        </fetcher.Form>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          type="button"
          onClick={handleClose}
        >
          ✕
        </button>
      </Modal>
    </>
  );
}
