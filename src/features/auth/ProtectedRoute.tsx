// Route Guard bảo vệ cụm /app/*: yêu cầu đã xác thực (ROLE_USER), lưu state.from khi chuyển về /login, ngăn chặn Admin truy cập
import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import { SessionLoadingScreen } from './SessionBootstrap';

export interface ProtectedRouteProps {
  children?: ReactNode;
  redirectTo?: string;
  adminRedirectTo?: string;
  allowAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  adminRedirectTo = '/admin',
  allowAdmin = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { authStatus, isAuthenticated, isInitializing, bootstrapSession, isAdmin } = useAuth();
  const hasShownAdminBlockNoticeRef = useRef(false);
  const userIsAdmin = isAdmin();

  useEffect(() => {
    if (authStatus === 'IDLE') {
      void bootstrapSession();
    }
  }, [authStatus, bootstrapSession]);

  useEffect(() => {
    if (!isInitializing && isAuthenticated && userIsAdmin && !allowAdmin && !hasShownAdminBlockNoticeRef.current) {
      hasShownAdminBlockNoticeRef.current = true;
      useUIStore
        .getState()
        .showToast('info', 'Tài khoản Quản trị viên chỉ có quyền truy cập khu vực quản trị.');
    }
  }, [allowAdmin, isAuthenticated, isInitializing, userIsAdmin]);

  if (isInitializing) {
    return <SessionLoadingScreen label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Ngăn cản tài khoản có quyền Admin truy cập vào khu vực /app của người dùng thông thường
  if (userIsAdmin && !allowAdmin) {
    return <Navigate to={adminRedirectTo} replace />;
  }

  return children !== undefined ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
