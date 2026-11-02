// Màn hình Yêu cầu khôi phục mật khẩu
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { ForgotPasswordForm } from '../../features/auth/ForgotPasswordForm';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleOtpSent = (email: string) => {
    // Gửi mã OTP thành công, chuyển tiếp sang màn hình đặt lại mật khẩu kèm email
    navigate(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <AuthLayout
      brandName="Hôm Nay Ăn Gì"
      title="Khôi phục mật khẩu"
      subtitle="Nhập địa chỉ email đăng ký để nhận mã OTP xác thực"
      footer={
        <p className="text-body-sm text-muted-foreground">
          Đã nhớ lại mật khẩu?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Quay lại Đăng nhập
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm onOtpSent={handleOtpSent} />
    </AuthLayout>
  );
}
