import MetaArgs from "@/components/MetaArgs";
import { userRegistrationSchema } from "@/libs/dataSchema";
import { useEffect, useState } from "react";
import { Link, useFetcher, useOutletContext } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import ActionButton from "@/components/ActionButton";
import FormFields from "@/components/FormFields";
import { authRegisterFields } from "@/libs/constants";

export function Component() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const fetcher = useFetcher();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userRegistrationSchema),
  });
  const { setAccessToken } = useOutletContext() as {
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  };
  const busy = fetcher.state !== "idle";

  useEffect(() => {
    const handleLoginSuccess = (accessToken: string, message: string) => {
      setAccessToken(accessToken);
      toast.success(message, { id: "auth-success" });
      window.location.href = "/";
    };
    const handleLoginError = (message: string) => {
      toast.error(message);
    };
    if (fetcher.data?.success) {
      handleLoginSuccess(fetcher.data.accessToken, fetcher.data.message);
    } else if (fetcher.data?.message) {
      handleLoginError(fetcher.data.message);
    }
  }, [fetcher.data, setAccessToken]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    fetcher.submit(data, {
      method: "post",
      action: "/auth/register",
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_GOOGLE_AUTH_URL
    }/auth/google`;
  };

  return (
    <>
      <MetaArgs
        title="Register, Get started with Instashots"
        description="Register an account"
      />
      <h1 className="text-4xl lg:text-7xl font-bold text-center lg:text-start">
        Happening now
      </h1>
      <p className="font-bold text-3xl my-6 text-center lg:text-start">
        Join today.
      </p>
      <div className="w-[85vw] md:w-[320px]">
        <fetcher.Form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          {authRegisterFields.map((field) => (
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
            text="Create Account"
            type="submit"
            loading={busy}
            classname="mt-4 w-full btn-secondary"
          />
        </fetcher.Form>
        <div className="divider">OR</div>
        <button className="btn btn-success w-full" onClick={handleGoogleLogin}>
          <i className="ri-google-fill"></i>Continue with Google
        </button>
        <div className="mt-8 space-y-4">
          <p className="font-bold">Already have an account?</p>
          <Link to="/auth/login">
            <button className="btn btn-outline btn-primary w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

Component.displayName = "Register";
