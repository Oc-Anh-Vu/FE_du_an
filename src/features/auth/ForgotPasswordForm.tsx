// Biểu mẫu yêu cầu gửi mã OTP khôi phục mật khẩu và phát onOtpSent(email)
import { useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button, Input } from '../../components/ui/form';
import { Stack } from '../../components/layout/Stack';
import { normalizeApiError } from '../../services/apiClient';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { ApiErrorCode } from '../../types';
import { cn } from '../../utils/cn';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ForgotPasswordFormProps {
  defaultEmail?: string;
  onOtpSent?: (email: string) => void;
  className?: string;
}

function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Vui lòng nhập địa chỉ email đã đăng ký.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Email không đúng định dạng.';
  }
  return undefined;
}

function resolveForgotPasswordError(code: number, fallbackMessage: string): string {
  switch (code) {
    case ApiErrorCode.USER_NOT_EXISTED:
      return 'Không tìm thấy người dùng nào ứng với địa chỉ email này.';
    case ApiErrorCode.EMAIL_INVALID:
      return 'Email không đúng định dạng.';
    default:
      return fallbackMessage || 'Không thể gửi yêu cầu khôi phục mật khẩu, vui lòng thử lại.';
  }
}

export function ForgotPasswordForm({
  defaultEmail = '',
  onOtpSent,
  className,
}: ForgotPasswordFormProps) {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setEmailError(validateEmail(event.currentTarget.value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const validationError = validateEmail(email);
    setEmailError(validationError);
    if (validationError) {
      emailInputRef.current?.focus();
      return;
    }

    const normalizedEmail = email.trim();
    setLoading(true);
    try {
      await authService.forgotPassword({ email: normalizedEmail });
      useUIStore
        .getState()
        .showToast(
          'success',
          'Yêu cầu khôi phục mật khẩu thành công. Vui lòng kiểm tra mã OTP.',
        );
      onOtpSent?.(normalizedEmail);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === ApiErrorCode.USER_NOT_EXISTED) {
        setEmailError('Không tìm thấy tài khoản với email này.');
        emailInputRef.current?.focus();
      }
      setServerError(resolveForgotPasswordError(normalized.code, normalized.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={cn('w-full', className)} onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Alert variant="info" title="Hỗ trợ kiểm thử trên Local ([MOCK OTP])">
          Sau khi gửi yêu cầu, mã OTP khôi phục sẽ được gửi về email hoặc in trực tiếp tại console
          Server với nhãn{' '}
          <code className="rounded bg-card px-1.5 py-0.5 font-semibold text-foreground">
            [MOCK OTP]
          </code>
          .
        </Alert>

        {serverError && (
          <Alert variant="danger" role="alert" onClose={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}

        <Input
          ref={emailInputRef}
          name="email"
          type="email"
          label="Email đăng ký tài khoản"
          placeholder="ban@example.com"
          hint="Nhập địa chỉ email bạn đã dùng khi tạo tài khoản."
          autoComplete="email"
          required
          value={email}
          error={emailError}
          disabled={loading}
          onChange={(event) => {
            setEmail(event.currentTarget.value);
            setServerError(null);
            if (emailError) setEmailError(undefined);
          }}
          onBlur={handleBlur}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          loadingText="Đang gửi mã OTP..."
        >
          Gửi mã OTP khôi phục
        </Button>
      </Stack>
    </form>
  );
}

export default ForgotPasswordForm;
