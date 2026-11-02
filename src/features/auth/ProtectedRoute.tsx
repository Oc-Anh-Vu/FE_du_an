// Route Guard bảo vệ cụm /app/*: yêu cầu đã xác thực (User hoặc Admin), lưu state.from khi chuyển về /login
import { useEffect, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SessionLoadingScreen } from './SessionBootstrap';

export interface ProtectedRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const location = useLocation();
  const { authStatus, isAuthenticated, isInitializing, bootstrapSession } = useAuth();

  useEffect(() => {
    if (authStatus === 'IDLE') {
      void bootstrapSession();
    }
  }, [authStatus, bootstrapSession]);

  if (isInitializing) {
    return <SessionLoadingScreen label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children !== undefined ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
