import { User } from "@/types";
import { Navigate, useLocation } from "react-router";

type RoutesProps = {
  children: React.ReactNode;
  accessToken?: string | null;
  user?: User;
};

export const PrivateRoutes = ({ children, accessToken, user }: RoutesProps) => {
  const location = useLocation();
  if (!accessToken) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }
  if (user && !user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  return children;
};

export const PublicRoutes = ({ children, accessToken }: RoutesProps) => {
  const location = useLocation();
  const from = location.state?.from || "/";
  if (accessToken) {
    return <Navigate to={from} replace />;
  }
  return children;
};

export const VerifyMailRoute = ({
  children,
  user,
  accessToken,
}: RoutesProps) => {
  const location = useLocation();
  const from = location.state?.from || "/";
  if (!accessToken) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }
  if (user && user?.isVerified) {
    return <Navigate to={from} replace />;
  }

  return children;
};
