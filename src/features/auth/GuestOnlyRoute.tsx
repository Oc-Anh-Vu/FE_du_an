// Route Guard bảo vệ cụm Auth (/login, /signup, /verify, /forgot-password, /reset-password) chỉ dành cho Guest
import { useEffect, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SessionLoadingScreen } from './SessionBootstrap';

export interface GuestOnlyRouteProps {
  children?: ReactNode;
}

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { authStatus, isAuthenticated, isInitializing, bootstrapSession, isAdmin } = useAuth();

  useEffect(() => {
    if (authStatus === 'IDLE') {
      void bootstrapSession();
    }
  }, [authStatus, bootstrapSession]);

  if (isInitializing) {
    return <SessionLoadingScreen label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin() ? '/admin' : '/app'} replace />;
  }

  return children !== undefined ? <>{children}</> : <Outlet />;
}

export default GuestOnlyRoute;
