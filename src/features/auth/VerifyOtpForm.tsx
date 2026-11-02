// Biểu mẫu gửi và xác thực mã OTP 6 chữ số, bắt lỗi 1004/1009 kèm hướng dẫn [MOCK OTP]
import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button, Input, OtpInput } from '../../components/ui/form';
import { Stack } from '../../components/layout/Stack';
import { normalizeApiError } from '../../services/apiClient';
import { authService } from '../../services/auth.service';
import { useUIStore } from '../../store/uiStore';
import { ApiErrorCode } from '../../types';
import { cn } from '../../utils/cn';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export interface VerifyOtpFormProps {
  defaultEmail?: string;
  onVerified?: (email: string) => void;
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

function validateOtpCode(otp: string): string | undefined {
  const clean = otp.trim();
  if (clean.length !== OTP_LENGTH || !/^\d{6}$/.test(clean)) {
    return 'Vui lòng nhập đủ 6 chữ số của mã OTP.';
  }
  return undefined;
}

function resolveOtpErrorMessage(code: number, fallbackMessage: string): string {
  switch (code) {
    case ApiErrorCode.USER_NOT_EXISTED:
      return 'Không tìm thấy người dùng với địa chỉ email này.';
    case ApiErrorCode.INVALID_OTP:
      return 'Mã OTP không hợp lệ hoặc đã hết hạn (5 phút).';
    case ApiErrorCode.EMAIL_INVALID:
      return 'Email không đúng định dạng.';
    default:
      return fallbackMessage || 'Xác thực OTP không thành công, vui lòng thử lại.';
  }
}

export function VerifyOtpForm({
  defaultEmail = '',
  onVerified,
  onOtpSent,
  className,
}: VerifyOtpFormProps) {
  const otpLabelId = useId();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpFirstInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(defaultEmail);
  const [prevDefaultEmail, setPrevDefaultEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [otpError, setOtpError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  if (defaultEmail !== prevDefaultEmail) {
    setPrevDefaultEmail(defaultEmail);
    if (defaultEmail && !email) {
      setEmail(defaultEmail);
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function handleEmailBlur(event: FocusEvent<HTMLInputElement>) {
    setEmailError(validateEmail(event.currentTarget.value));
  }

  async function handleSendOtp() {
    setServerError(null);
    setStatusMessage(null);

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    if (nextEmailError) {
      emailInputRef.current?.focus();
      return;
    }

    const normalizedEmail = email.trim();
    setSendingOtp(true);
    try {
      await authService.sendOtp({ email: normalizedEmail });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStatusMessage(
        `Mã OTP 6 chữ số đã được gửi tới ${normalizedEmail}. Mã có hiệu lực trong 5 phút.`,
      );
      useUIStore
        .getState()
        .showToast('info', 'Đã gửi mã OTP đến email của bạn.');
      onOtpSent?.(normalizedEmail);
      otpFirstInputRef.current?.focus();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === ApiErrorCode.USER_NOT_EXISTED) {
        setEmailError('Không tìm thấy tài khoản với email này.');
      }
      setServerError(resolveOtpErrorMessage(normalized.code, normalized.message));
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const nextEmailError = validateEmail(email);
    const nextOtpError = validateOtpCode(otp);
    setEmailError(nextEmailError);
    setOtpError(nextOtpError);

    if (nextEmailError) {
      emailInputRef.current?.focus();
      return;
    }
    if (nextOtpError) {
      otpFirstInputRef.current?.focus();
      return;
    }

    const normalizedEmail = email.trim();
    const normalizedOtp = otp.trim();

    setVerifyingOtp(true);
    try {
      const response = await authService.verifyOtp({
        email: normalizedEmail,
        otp: normalizedOtp,
      });

      if (!response?.verified) {
        setOtpError('Mã OTP không hợp lệ hoặc đã hết hạn.');
        setServerError('Mã OTP không hợp lệ hoặc đã hết hạn (5 phút).');
        otpFirstInputRef.current?.focus();
        return;
      }

      useUIStore
        .getState()
        .showToast('success', 'Xác thực mã OTP thành công!');
      onVerified?.(normalizedEmail);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === ApiErrorCode.INVALID_OTP) {
        setOtpError('Mã OTP không hợp lệ hoặc đã hết hạn.');
        otpFirstInputRef.current?.focus();
      } else if (normalized.code === ApiErrorCode.USER_NOT_EXISTED) {
        setEmailError('Không tìm thấy tài khoản với email này.');
        emailInputRef.current?.focus();
      }
      setServerError(resolveOtpErrorMessage(normalized.code, normalized.message));
    } finally {
      setVerifyingOtp(false);
    }
  }

  const isBusy = sendingOtp || verifyingOtp;

  return (
    <form className={cn('w-full', className)} onSubmit={handleVerifySubmit} noValidate>
      <Stack gap={4}>
        <Alert variant="info" title="Hỗ trợ kiểm thử trên Local ([MOCK OTP])">
          Khi chạy Backend ở môi trường Local chưa cấu hình SMTP, bạn có thể xem trực tiếp mã OTP 6
          số trong cửa sổ console của Server (dòng log{' '}
          <code className="rounded bg-card px-1.5 py-0.5 font-semibold text-foreground">
            [MOCK OTP]
          </code>
          ).
        </Alert>

        {statusMessage && (
          <Alert variant="success" role="status" onClose={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        )}

        {serverError && (
          <Alert variant="danger" role="alert" onClose={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}

        <Input
          ref={emailInputRef}
          name="email"
          type="email"
          label="Email tài khoản"
          placeholder="ban@example.com"
          autoComplete="email"
          required
          value={email}
          error={emailError}
          disabled={isBusy}
          onChange={(event) => {
            setEmail(event.currentTarget.value);
            setServerError(null);
            if (emailError) setEmailError(undefined);
          }}
          onBlur={handleEmailBlur}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={sendingOtp}
            loadingText="Đang gửi mã..."
            disabled={isBusy || cooldown > 0}
            onClick={() => void handleSendOtp()}
          >
            {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : 'Gửi mã OTP về Email'}
          </Button>
        </div>

        <div className="space-y-1.5">
          <label
            id={otpLabelId}
            className="block text-body-sm font-semibold text-foreground"
          >
            Mã xác thực OTP (6 chữ số) <span aria-hidden="true" className="text-danger">*</span>
          </label>
          <OtpInput
            ref={otpFirstInputRef}
            length={OTP_LENGTH}
            mode="numeric"
            value={otp}
            error={otpError}
            disabled={isBusy}
            aria-label="Mã xác thực OTP 6 chữ số"
            onValueChange={(nextValue) => {
              setOtp(nextValue);
              setServerError(null);
              if (otpError) setOtpError(undefined);
            }}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={verifyingOtp}
          loadingText="Đang xác thực..."
          disabled={isBusy}
        >
          Xác nhận mã OTP
        </Button>
      </Stack>
    </form>
  );
}

export default VerifyOtpForm;
