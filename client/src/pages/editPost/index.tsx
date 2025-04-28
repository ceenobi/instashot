import MetaArgs from "@/components/MetaArgs";
import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import {
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { postFields } from "@/libs/constants";
import FormFields from "@/components/FormFields";
import useTag from "@/hooks/useTag";
import ActionButton from "@/components/ActionButton";
import { Post } from "@/types";
import { toast } from "sonner";

export function Component() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { id } = useParams();
  const { data } = useLoaderData() as { data: { post: Post } };
  const path = location.pathname === `/post/edit/${id}`;
  const { post } = data ?? {};
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const { tags, handleTags, removeTag, setTags } = useTag();

  useEffect(() => {
    if (path) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [path]);

  useEffect(() => {
    if (post.tags && post.tags.length > 0) {
      setTags([...post.tags]);
    }
  }, [post.tags, setTags]);

  useEffect(() => {
    if (post) {
      setValue("caption", post.caption);
      setValue("description", post.description);
      setValue("isPublic", post.isPublic);
    }
  }, [setValue, post]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message);
        setIsOpen(false);
        setTags([]);
        navigate(`/post/${id}`);
      } else if (fetcher.data.success === false || fetcher.data.error) {
        toast.error(fetcher.data.message || fetcher.data.error);
      }
    }
  }, [fetcher.data, id, navigate, setTags]);

  const handleClose = () => {
    setIsOpen(false);
    navigate(`/post/${id}`);
  };

  const onFormSubmit: SubmitHandler<FieldValues> = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as unknown as Blob);
    });
    formData.append("tags", tags.join(","));
    formData.append("id", post.id as string);
    fetcher.submit(formData, {
      method: "patch",
      action: `/post/edit/${id}`,
    });
  };

  const filteredMedia = post?.media.filter(
    (item: string) => !item.endsWith(".mp4") && !item.endsWith(".webm")
  );

  return (
    <>
      <MetaArgs title="Edit your post" description="Edit post" />
      <Modal
        isOpen={isOpen}
        id="editPostModal"
        classname="w-[90%] max-w-[1024px] mx-auto p-0"
      >
        <div className="grid grid-cols-12 h-[700px]">
          <div className="col-span-12 md:col-span-6">
            <div className="flex flex-wrap w-full h-full">
              <img
                src={filteredMedia[0]}
                className={`w-full h-full object-cover aspect-square `}
                alt={`Post ${1}`}
                loading="lazy"
              />
            </div>
          </div>
          <div className="mt-6 lg:mt-20 col-span-12 md:col-span-6 px-5 md:px-10 py-4">
            <h1 className="text-center font-bold">Edit post</h1>
            <fetcher.Form
              className="mt-4"
              onSubmit={handleSubmit(onFormSubmit)}
              method="patch"
              action={`/post/edit/${id}`}
            >
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
                  defaultChecked={post?.isPublic}
                />
              </label>
              <ActionButton
                text="Update"
                type="submit"
                loading={fetcher.state === "submitting"}
                classname="mt-4 w-full btn-secondary"
              />
            </fetcher.Form>
          </div>
        </div>
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

Component.displayName = "EditPost";
