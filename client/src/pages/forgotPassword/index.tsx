import MetaArgs from "@/components/MetaArgs";
import { Link, useFetcher, useNavigate } from "react-router";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ActionButton from "@/components/ActionButton";
import FormFields from "@/components/FormFields";
import { forgotPasswordSchema } from "@/libs/dataSchema";
import { authRegisterFields } from "@/libs/constants";
import { useEffect } from "react";

export function Component() {
  const fetcher = useFetcher();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, {
          id: "resetPassword-success",
        });
        navigate("/", { replace: true });
      } else if (fetcher.data.success === false) {
        toast.error(fetcher.data.message);
      }
    }
  }, [fetcher.data, navigate]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    fetcher.submit(data, {
      method: "post",
      action: "/auth/forgot-password",
    });
  };

  return (
    <>
      <MetaArgs
        title="Forgot your password? Let's help you recover it."
        description="Forgot Password page"
      />
      <h1 className="text-4xl lg:text-5xl font-bold text-center lg:text-start">
        Forgot your password?
      </h1>
      <p className="font-bold text-3xl my-6 text-center lg:text-start">
        Let's help you recover it.
      </p>
      <div className="w-[85vw] md:w-[320px]">
        <fetcher.Form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          {authRegisterFields
            .filter((item) => ["email"].includes(item.name))
            .map((field) => (
              <FormFields
                key={field.id}
                {...field}
                register={register as FieldValues["register"]}
                errors={errors}
                classname="mb-4"
              />
            ))}
          <ActionButton
            text="Recover"
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

Component.displayName = "ForgotPassword";
