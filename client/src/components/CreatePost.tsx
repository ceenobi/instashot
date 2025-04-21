import { useFiles } from "@/hooks/useFile";
import { useEffect, useState } from "react";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { useFetcher, useLocation } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema } from "@/libs/dataSchema";
import Modal from "./Modal";
import { postFields } from "@/libs/constants";
import FormFields from "./FormFields";
import useTag from "@/hooks/useTag";
import ActionButton from "./ActionButton";
import { toast } from "sonner";

export default function CreatePost({
  isOpenSidebar,
}: {
  isOpenSidebar: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const {
    selectedFiles: mediaFiles,
    setSelectedFiles,
    err,
    setErr,
    handleImage,
  } = useFiles();
  const { tags, handleTags, removeTag, setTags } = useTag();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      isPublic: true,
    },
  });
  const fetcher = useFetcher();
  const location = useLocation();
  const from = location.state?.from || "/";

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message);
        reset();
        setIsOpen(false);
        setTags([]);
      } else if (fetcher.data.success === false || fetcher.data.error) {
        toast.error(fetcher.data.message || fetcher.data.error);
      }
    }
  }, [fetcher.data, from, reset, setTags]);

  const busy = fetcher.state === "submitting";

  const handleClose = () => setIsOpen(false);
  const handleNext = () => {
    setStep((prev) => prev + 1);
  };
  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const onFormSubmit: SubmitHandler<FieldValues> = (data) => {
    if (mediaFiles.length === 0) {
      setErr("At least one media file is required");
      return false;
    }
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as unknown as Blob);
    });
    mediaFiles.forEach((file) => {
      formData.append("media", file.preview as unknown as string);
    });
    formData.append("tags", tags.join(","));
    fetcher.submit(formData, {
      method: "post",
      action: "/?index",
    });
  };

  return (
    <>
      <div
        className={`flex gap-3 items-center p-3 cursor-pointer hover:font-bold light:hover:text-zinc-800 rounded-lg hover:transition duration-150 ease-out tooltip tooltip-right z-50 md:hover:bg-zinc-100 md:dark:hover:bg-zinc-500`}
        role="button"
        tabIndex={0}
        data-tip={isOpenSidebar ? undefined : "Create post"}
        onClick={() => setIsOpen(true)}
      >
        <i className="hidden md:block ri-add-box-line text-2xl"></i>
        <i className="md:hidden ri-add-box-line text-2xl"></i>
        {isOpenSidebar && (
          <span className="hidden md:block tooltiptext text-md">
            Create post
          </span>
        )}
      </div>
      <Modal
        isOpen={isOpen}
        title={step === 1 ? "Create new post" : "Add post details"}
        id="create-postModal"
        classname="max-w-xl"
      >
        <fetcher.Form className="mt-4" onSubmit={handleSubmit(onFormSubmit)}>
          <>
            {step === 1 && (
              <div className="form-control w-full">
                <label
                  htmlFor="media"
                  className="h-[300px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-auto p-2"
                >
                  {mediaFiles.length === 0 ? (
                    <div className="text-center">
                      <i className="ri-image-add-fill text-4xl"></i>
                      <p>Upload media</p>
                      <p className="text-xs text-gray-500">
                        Upload up to 10 files (max 10MB each)
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 w-full relative z-20">
                      {mediaFiles.map(({ file, preview }, index) => (
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
                  id="media"
                  name="media"
                  accept="image/*, video/*"
                  multiple
                  className="hidden"
                  onChange={handleImage}
                />
                {err && (
                  <span className="mt-4 text-xs text-red-600">{err}</span>
                )}
              </div>
            )}
          </>
          <>
            {step === 2 && (
              <>
                {postFields.map((field) => (
                  <FormFields
                    key={field.id}
                    {...field}
                    register={register as FieldValues["register"]}
                    errors={errors}
                    onKeyDown={handleTags}
                    classname="mb-4"
                  />
                ))}
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <div
                      key={index}
                      className="badge badge-neutral gap-2 cursor-pointer"
                      onClick={() => removeTag(index)}
                    >
                      {tag}
                      <span>&times;</span>
                    </div>
                  ))}
                </div>
                <label className="my-4 label cursor-pointer">
                  <span className="label-text">Public post</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-error"
                    {...register("isPublic")}
                    defaultChecked
                  />
                </label>
                <ActionButton
                  text="Post"
                  type="submit"
                  loading={busy}
                  classname="mt-4 w-full btn-secondary"
                />
              </>
            )}
          </>
          <div className="modal-action items-center">
            {step && mediaFiles.length > 0 && (
              <div className="flex gap-4">
                <button
                  className="btn btn-sm"
                  onClick={handlePrev}
                  disabled={step === 1}
                  type="button"
                >
                  Prev
                </button>
                <button
                  className="btn btn-sm btn-neutral"
                  onClick={handleNext}
                  disabled={step === 2}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
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
