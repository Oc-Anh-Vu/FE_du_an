// Khởi tạo phiên đăng nhập (bootstrapSession) khi authStatus === 'IDLE' và chặn mount sớm các route bảo vệ
import { useEffect, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { useAuth } from '../../hooks/useAuth';

export interface SessionLoadingScreenProps {
  label?: string;
}

export function SessionLoadingScreen({
  label = 'Đang kiểm tra phiên đăng nhập...',
}: SessionLoadingScreenProps) {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-4 text-center text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="lg" label={label} />
      <p className="text-body-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export interface SessionBootstrapProps {
  children?: ReactNode;
  blockWhileInitializing?: boolean;
  loadingLabel?: string;
}

export function SessionBootstrap({
  children,
  blockWhileInitializing = true,
  loadingLabel = 'Đang kiểm tra phiên đăng nhập...',
}: SessionBootstrapProps) {
  const { authStatus, isInitializing, bootstrapSession } = useAuth();

  useEffect(() => {
    if (authStatus === 'IDLE') {
      void bootstrapSession();
    }
  }, [authStatus, bootstrapSession]);

  if (blockWhileInitializing && isInitializing) {
    return <SessionLoadingScreen label={loadingLabel} />;
  }

  return children !== undefined ? <>{children}</> : <Outlet />;
}

export default SessionBootstrap;
