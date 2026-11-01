import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "../ui/feedback/Spinner";
import { useAuth } from "../../hooks/useAuth";

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { authStatus, isAdmin, isInitializing, bootstrapSession } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (authStatus === "IDLE") {
      void bootstrapSession();
    }
  }, [authStatus, bootstrapSession]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-body-sm text-muted-foreground" role="status">
        <Spinner label="Đang xác minh quyền quản trị" />
        Đang xác minh phiên đăng nhập...
      </div>
    );
  }

  if (authStatus !== "AUTHENTICATED") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin()) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
