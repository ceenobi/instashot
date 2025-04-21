import ActionButton from "@/components/ActionButton";
import FormFields from "@/components/FormFields";
import MetaArgs from "@/components/MetaArgs";
import { useAuth } from "@/context";
import { passwordFields } from "@/libs/constants";
import { updatePasswordSchema } from "@/libs/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { useFetcher } from "react-router";
import { toast } from "sonner";

export function Component() {
  const [isVisible, setIsVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
  });
  const fetcher = useFetcher();
  const { handleLogout } = useAuth();

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, { id: "update-password" });
        handleLogout();
      } else if (fetcher.data.success === false || fetcher.data.error) {
        toast.error(fetcher.data.message || fetcher.data.error, {
          id: "update-password",
        });
      }
    }
  }, [fetcher.data, handleLogout]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error("New password and confirm password do not match", {
        id: "update-password",
      });
    }
    fetcher.submit(data, {
      method: "patch",
      action: "/settings/update-password",
    });
  };

  return (
    <>
      <MetaArgs title={`Update password`} description="Update your password" />
      <h1 className="text-xl text-center my-6 font-bold">
        Update current password
      </h1>
      <div className="border-2 border-zinc-200 p-4 rounded-lg w-[85vw] md:w-[350px] mx-auto">
        <fetcher.Form className="w-full " onSubmit={handleSubmit(onSubmit)}>
          {passwordFields.map((field) => (
            <FormFields
              key={field.id}
              {...field}
              register={register as FieldValues["register"]}
              errors={errors}
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              classname="mb-4"
            />
          ))}
          <ActionButton
            text="Update"
            type="submit"
            loading={fetcher.state !== "idle"}
            classname="mt-4 w-full btn-secondary"
          />
        </fetcher.Form>
      </div>
    </>
  );
}

Component.displayName = "UpdatePassword";
