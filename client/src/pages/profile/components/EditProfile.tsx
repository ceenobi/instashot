import { useEffect, useState } from "react";
import { useFetcher, useOutletContext } from "react-router";
import { User } from "@/types";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import { updateProfileFields } from "@/libs/constants";
import FormFields from "@/components/FormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/libs/dataSchema";
import ActionButton from "@/components/ActionButton";
import { toast } from "sonner";

export default function EditProfile() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useOutletContext<{ user: User }>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
  });
  const fetcher = useFetcher();

  useEffect(() => {
    setValue("username", user.username);
    setValue("email", user.email);
    setValue("fullname", user.fullname);
    setValue("bio", user.bio || "");
    setValue("isPublic", user.isPublic);
  }, [user, setValue]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message);
        setIsOpen(false);
      } else if (fetcher.data.success === false || fetcher.data.error) {
        toast.error(fetcher.data.message || fetcher.data.error);
      }
    }
  }, [fetcher.data]);

  const onFormSubmit: SubmitHandler<FieldValues> = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as unknown as Blob);
    });
    formData.append("type", "updateProfile");
    fetcher.submit(formData, {
      method: "patch",
      action: `/profile/${user.username}`,
    });
  };

  return (
    <>
      <button
        className="btn light:btn-neutral dark:btn-secondary btn-soft focus:outline-none w-[120px]"
        onClick={() => setIsOpen(true)}
      >
        Edit profile
      </button>
      <Modal
        isOpen={isOpen}
        id="editProfileModal"
        title="Edit Profile"
        classname="w-[90%] max-w-[500px] mx-auto py-6 px-0"
      >
        <fetcher.Form
          className="mt-6 w-[90%] max-w-[400px] mx-auto"
          method="patch"
          action={`/profile/${user.username}`}
          onSubmit={handleSubmit(onFormSubmit)}
        >
          {updateProfileFields.map((field) => (
            <FormFields
              key={field.id}
              {...field}
              register={register as FieldValues["register"]}
              errors={errors}
              classname="mb-4"
            />
          ))}
          <label className="my-3 label cursor-pointer">
            <span className="label-text">Public profile</span>
            <input
              type="checkbox"
              className="toggle toggle-error"
              {...register("isPublic")}
            />
          </label>
          <ActionButton
            text="Update"
            type="submit"
            loading={fetcher.state === "submitting"}
            classname="mt-4 w-full btn-secondary"
          />
        </fetcher.Form>
        <button
          className="btn btn-circle lg:btn-ghost absolute z-50 right-2 top-1"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </Modal>
    </>
  );
}
