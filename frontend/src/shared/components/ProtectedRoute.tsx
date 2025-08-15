import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: string;
}) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Đang xác thực người dùng...</div>;
  }

  if (!isAuthenticated || !hasRole(requiredRole)) {
    return (
      <Navigate
        to="/auth/patient-login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
