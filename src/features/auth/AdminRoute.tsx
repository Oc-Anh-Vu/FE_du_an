// Route Guard bảo vệ cụm /admin/*: yêu cầu quyền ROLE_ADMIN, hiển thị Toast danger và chuyển về /app nếu không đủ quyền
import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { SessionLoadingScreen } from './SessionBootstrap';

export interface AdminRouteProps {
  children?: ReactNode;
  loginRedirectTo?: string;
  fallbackRedirectTo?: string;
}

export function AdminRoute({
  children,
  loginRedirectTo = '/login',
  fallbackRedirectTo = '/app',
}: AdminRouteProps) {
  const location = useLocation();
  const { authStatus, isAuthenticated, isInitializing, bootstrapSession, isAdmin } = useAuth();
  const hasShownDeniedToastRef = useRef(false);
  const userHasAdminRole = isAdmin();

  useEffect(() => {
    if (authStatus === 'IDLE') {
      void bootstrapSession();
    }
  }, [authStatus, bootstrapSession]);

  useEffect(() => {
    if (!isInitializing && isAuthenticated && !userHasAdminRole && !hasShownDeniedToastRef.current) {
      hasShownDeniedToastRef.current = true;
      useUIStore
        .getState()
        .showToast('danger', 'Bạn không có quyền truy cập khu vực quản trị');
    }
  }, [isAuthenticated, isInitializing, userHasAdminRole]);

  if (isInitializing) {
    return <SessionLoadingScreen label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginRedirectTo} state={{ from: location }} replace />;
  }

  if (!userHasAdminRole) {
    return <Navigate to={fallbackRedirectTo} replace />;
  }

  return children !== undefined ? <>{children}</> : <Outlet />;
}

export default AdminRoute;
