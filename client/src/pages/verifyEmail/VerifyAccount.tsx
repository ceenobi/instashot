import { useEffect } from "react";
import { useFetcher, useParams, useNavigate } from "react-router";
import { toast } from "sonner";

export function Component() {
  const { id, token } = useParams();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && token) {
      fetcher.submit(
        {},
        { action: `/verify-email/${id}/${token}`, method: "patch" }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast.success(fetcher.data.message, {
          id: "verifyAccount-success",
        });
        setTimeout(() => (window.location.href = "/"), 1500);
      } else {
        if (isMounted) {
          toast.error(fetcher.data.message || fetcher.data);
        }
      }
    }
    return () => {
      isMounted = false;
    };
  }, [fetcher.data]);

  return (
    <section className="container mx-auto py-6 px-4">
      <div className="flex justify-center items-center min-h-screen flex-col gap-4">
        {fetcher.state !== "idle" ? (
          <div>Verification in progress...</div>
        ) : (
          <>
            {fetcher.data?.success ? (
              <>
                <h1 className="text-2xl text-center">
                  You have successfully verified your email
                </h1>
                <p className="text-gray-600">
                  Redirecting you to the home page...
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl mb-4 text-center">
                  There was a problem verifying your email
                </h1>
                <button
                  className="btn btn-primary w-[250px]"
                  onClick={() => navigate("/verify-email")}
                >
                  Try again
                </button>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

Component.displayName = "VerifyAccount";
