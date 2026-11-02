// Màn hình Đăng nhập
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { LoginForm } from '../../features/auth/LoginForm';
import type { UserResponse } from '../../types';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = (user: UserResponse) => {
    const userRoles = user.roles || [];
    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('ROLE_ADMIN');

    if (isAdmin) {
      // Tài khoản Admin luôn vào thẳng trang quản trị /admin
      navigate('/admin', { replace: true });
    } else {
      // Tài khoản ROLE_USER vào /app (hoặc trang trước đó nếu trang đó thuộc /app)
      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const destination = fromPath && fromPath.startsWith('/app') ? fromPath : '/app';
      navigate(destination, { replace: true });
    }
  };

  return (
    <AuthLayout
      brandName="Hôm Nay Ăn Gì"
      title="Chào mừng trở lại"
      subtitle="Đăng nhập tài khoản để bắt đầu rủ rê hội bạn cùng quẹt thẻ"
      footer={
        <div className="space-y-2 text-body-sm text-muted-foreground">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="font-bold text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <div className="flex items-center justify-center gap-3 pt-1 text-caption">
            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground hover:underline">
              Quên mật khẩu?
            </Link>
            <span>·</span>
            <Link to="/verify" className="text-muted-foreground hover:text-foreground hover:underline">
              Xác thực email
            </Link>
          </div>
        </div>
      }
    >
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </AuthLayout>
  );
}
