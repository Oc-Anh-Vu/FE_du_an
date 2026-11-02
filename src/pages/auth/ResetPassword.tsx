// Màn hình Đặt lại mật khẩu mới
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { ResetPasswordForm } from '../../features/auth/ResetPasswordForm';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || undefined;

  const handleResetSuccess = () => {
    // Đặt lại mật khẩu thành công, chuyển hướng về trang đăng nhập
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout
      brandName="Hôm Nay Ăn Gì"
      title="Đặt lại mật khẩu"
      subtitle="Nhập mã OTP 6 số và thiết lập mật khẩu mới an toàn"
      footer={
        <p className="text-body-sm text-muted-foreground">
          <Link to="/login" className="font-bold text-primary hover:underline">
            Quay lại Đăng nhập
          </Link>
        </p>
      }
    >
      <ResetPasswordForm
        initialEmail={emailParam}
        onResetSuccess={handleResetSuccess}
      />
    </AuthLayout>
  );
}
