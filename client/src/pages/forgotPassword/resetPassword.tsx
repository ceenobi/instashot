import ActionButton from "@/components/ActionButton";
import FormFields from "@/components/FormFields";
import MetaArgs from "@/components/MetaArgs";
import { authRegisterFields } from "@/libs/constants";
import { resetPasswordSchema } from "@/libs/dataSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Link, useFetcher, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Component() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { id, token } = useParams();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, {
          id: "resetPassword-success",
        });
        navigate("/auth/login", { replace: true });
      } else if (fetcher.data.success === false) {
        toast.error(fetcher.data.message);
        navigate("/auth/forgot-password", { replace: true });
      }
    }
  }, [fetcher.data, navigate]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const formData = new FormData();
    formData.append("id", id as string);
    formData.append("token", token as string);
    formData.append("password", data.password);
    fetcher.submit(formData, {
      method: "patch",
      action: `/auth/reset-password/${id}/${token}`,
    });
  };

  return (
    <>
      <MetaArgs
        title="Recover your password? Let's help you recover it."
        description="Recover Password page"
      />
      <h1 className="text-2xl lg:text-3xl my-6 font-bold text-center lg:text-start">
        Reset your password?
      </h1>
      <div className="w-[85vw] md:w-[320px]">
        <fetcher.Form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          {authRegisterFields
            .filter((item) => ["password"].includes(item.name))
            .map((field) => (
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
            text="Reset"
            type="submit"
            loading={fetcher.state === "submitting"}
            classname="w-full btn-secondary"
          />
        </fetcher.Form>
        <div className="divider">OR</div>
        <div className="mt-8 space-y-4">
          <p className="font-bold">Already have an account?</p>
          <Link to="/auth/login">
            <button className="btn btn-outline btn-primary w-full">
              Login
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

Component.displayName = "ResetPassword";
