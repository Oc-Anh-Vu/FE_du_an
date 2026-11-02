// Màn hình Xác thực OTP Email
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { VerifyOtpForm } from '../../features/auth/VerifyOtpForm';

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || undefined;

  const handleVerifySuccess = () => {
    // Xác thực OTP thành công, chuyển hướng về trang đăng nhập
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout
      brandName="Hôm Nay Ăn Gì"
      title="Xác thực Email"
      subtitle="Nhập mã OTP 6 số để xác nhận địa chỉ email của bạn"
      footer={
        <p className="text-body-sm text-muted-foreground">
          Đã xác thực xong?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Quay lại Đăng nhập
          </Link>
        </p>
      }
    >
      <VerifyOtpForm
        initialEmail={initialEmail}
        onVerified={handleVerifySuccess}
      />
    </AuthLayout>
  );
}
