import { useAuth } from "@/context";
import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

interface ErrorResponse {
  data?: string;
  error?: string;
  message?: string;
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
}

interface RouteErrorResponse extends ErrorResponse {
  status: number;
}

export function ErrorBoundary() {
  const { setupTokenRefresh } = useAuth();
  const error = useRouteError() as RouteErrorResponse;
  if (import.meta.env.VITE_APP_MODE === "development") {
    console.error(error);
  }
  const errorMessage: string =
    error?.data ||
    error?.error ||
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "An unknown error occurred";

  useEffect(() => {
    if (errorMessage.includes("Unauthorized")) {
      setupTokenRefresh();
    }
  }, [errorMessage, setupTokenRefresh]);

  if (isRouteErrorResponse(error)) {
    return (
      <div className="pt-16 p-4 container mx-auto flex flex-col justify-center items-center h-screen">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{errorMessage}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="pt-16 p-4 container mx-auto flex flex-col justify-center items-center h-screen">
        <h1 className="text-4xl mb-2">Error</h1>
        {error.status === 500 && <p>Server error, please try again.</p>}
        <p>{errorMessage}</p>
        {/* <p>The stack trace is:</p>
        <pre>{error.stack}</pre> */}
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
