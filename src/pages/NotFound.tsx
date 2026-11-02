// Màn hình 404 Không tìm thấy trang
import { Compass, Home as HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/form/Button';
import { EmptyState } from '../components/ui/feedback/EmptyState';
import { useUserStore } from '../store/userStore';

export default function NotFound() {
  const authStatus = useUserStore((state) => state.authStatus);
  const currentUser = useUserStore((state) => state.currentUser);
  const isAuthenticated = authStatus === 'AUTHENTICATED';
  const roles = currentUser?.roles || [];
  const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

  const redirectHref = isAuthenticated ? (isAdmin ? '/admin' : '/app') : '/';
  const redirectLabel = isAuthenticated
    ? isAdmin
      ? 'Về trang quản trị'
      : 'Về trang chủ ứng dụng'
    : 'Về trang chủ';

  return (
    <PageContainer maxWidth="md" centered className="min-h-[70vh] py-12">
      <EmptyState
        size="lg"
        titleAs="h1"
        icon={<Compass className="size-12 text-primary animate-pulse" aria-hidden="true" />}
        title="404 - Không tìm thấy trang"
        description="Đường dẫn bạn vừa truy cập không tồn tại, đã bị xóa hoặc đã chuyển sang địa chỉ mới."
        action={
          <Link to={redirectHref}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<HomeIcon size={18} aria-hidden="true" />}
              className="font-bold shadow-cta"
            >
              {redirectLabel}
            </Button>
          </Link>
        }
      />
    </PageContainer>
  );
}
