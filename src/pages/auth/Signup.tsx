// Màn hình Đăng ký tài khoản mới
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { SignupForm } from '../../features/auth/SignupForm';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    // Chuyển hướng sang trang đăng nhập sau khi tạo tài khoản thành công
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout
      brandName="Hôm Nay Ăn Gì"
      title="Tạo tài khoản mới"
      subtitle="Đăng ký thành viên để cùng bạn bè khám phá hàng ngàn quán ngon"
      footer={
        <p className="text-body-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      }
    >
      <SignupForm onSignupSuccess={handleSignupSuccess} />
    </AuthLayout>
  );
}
