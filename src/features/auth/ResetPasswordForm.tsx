// Biểu mẫu đặt lại mật khẩu mới kèm mã OTP 6 số và phát onResetSuccess
import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button, Input, OtpInput, PasswordInput } from '../../components/ui/form';
import { Stack } from '../../components/layout/Stack';
import { normalizeApiError } from '../../services/apiClient';
import { useUIStore } from '../../store/uiStore';
import { ApiErrorCode, type ResetPasswordRequest } from '../../types';
import { cn } from '../../utils/cn';
import { useAuthActions } from './useAuthActions';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

type ResetField = 'email' | 'otp' | 'newPassword';
type ResetFieldErrors = Partial<Record<ResetField, string>>;

interface ResetPasswordValues {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordFormProps {
  initialEmail?: string;
  defaultEmail?: string;
  error?: string | null;
  onSubmit?: (payload: ResetPasswordRequest) => Promise<unknown>;
  onResendOtp?: (email: string) => Promise<unknown>;
  onResetSuccess?: (email: string) => void;
  onSuccess?: (email: string) => void;
  className?: string;
}

function validateResetField(field: ResetField, values: ResetPasswordValues): string | undefined {
  switch (field) {
    case 'email': {
      const trimmed = values.email.trim();
      if (!trimmed) {
        return 'Vui lòng nhập địa chỉ email tài khoản.';
      }
      if (!EMAIL_PATTERN.test(trimmed)) {
        return 'Email không đúng định dạng.';
      }
      return undefined;
    }
    case 'otp': {
      const clean = values.otp.trim();
      if (clean.length !== OTP_LENGTH || !/^\d{6}$/.test(clean)) {
        return 'Vui lòng nhập đủ 6 chữ số của mã OTP.';
      }
      return undefined;
    }
    case 'newPassword': {
      if (!values.newPassword) {
        return 'Vui lòng nhập mật khẩu mới.';
      }
      if (values.newPassword.length < 6) {
        return 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      }
      return undefined;
    }
  }
}

function validateAllResetFields(values: ResetPasswordValues): ResetFieldErrors {
  return {
    email: validateResetField('email', values),
    otp: validateResetField('otp', values),
    newPassword: validateResetField('newPassword', values),
  };
}

function resolveResetPasswordError(code: number, fallbackMessage: string): string {
  switch (code) {
    case ApiErrorCode.INVALID_OTP:
      return 'Mã OTP không hợp lệ hoặc đã hết hạn (5 phút). Vui lòng kiểm tra lại.';
    case ApiErrorCode.USER_NOT_EXISTED:
      return 'Không tìm thấy người dùng với địa chỉ email này.';
    case ApiErrorCode.PASSWORD_INVALID:
      return 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    case ApiErrorCode.EMAIL_INVALID:
      return 'Email không đúng định dạng.';
    default:
      return fallbackMessage || 'Không thể đặt lại mật khẩu, vui lòng thử lại.';
  }
}

export function ResetPasswordForm({
  initialEmail,
  defaultEmail: legacyDefaultEmail = '',
  error: externalError = null,
  onSubmit,
  onResendOtp,
  onResetSuccess,
  onSuccess,
  className,
}: ResetPasswordFormProps) {
  const defaultEmail = initialEmail ?? legacyDefaultEmail;
  const { confirmPasswordReset, requestPasswordReset } = useAuthActions();
  const otpLabelId = useId();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpFirstInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<ResetPasswordValues>({
    email: defaultEmail,
    otp: '',
    newPassword: '',
  });
  const [prevDefaultEmail, setPrevDefaultEmail] = useState(defaultEmail);
  const [fieldErrors, setFieldErrors] = useState<ResetFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendInfo, setResendInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  if (defaultEmail !== prevDefaultEmail) {
    setPrevDefaultEmail(defaultEmail);
    if (defaultEmail && !values.email) {
      setValues((prev) => ({ ...prev, email: defaultEmail }));
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function updateField(field: ResetField, nextValue: string) {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setServerError(null);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleInputBlur(field: 'email' | 'newPassword', event: FocusEvent<HTMLInputElement>) {
    const nextValues = { ...values, [field]: event.currentTarget.value };
    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateResetField(field, nextValues),
    }));
  }

  function focusFirstInvalidField(errors: ResetFieldErrors) {
    if (errors.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (errors.otp) {
      otpFirstInputRef.current?.focus();
      return;
    }
    if (errors.newPassword) {
      passwordInputRef.current?.focus();
    }
  }

  async function handleResendOtp() {
    setServerError(null);
    setResendInfo(null);

    const emailErr = validateResetField('email', values);
    if (emailErr) {
      setFieldErrors((prev) => ({ ...prev, email: emailErr }));
      emailInputRef.current?.focus();
      return;
    }

    const normalizedEmail = values.email.trim();
    setResendingOtp(true);
    try {
      await (onResendOtp ?? requestPasswordReset)(normalizedEmail);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setResendInfo(`Mã OTP mới đã được gửi tới ${normalizedEmail}.`);
      otpFirstInputRef.current?.focus();
    } catch (error) {
      const normalized = normalizeApiError(error);
      setServerError(resolveResetPasswordError(normalized.code, normalized.message));
    } finally {
      setResendingOtp(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validateAllResetFields(values);
    setFieldErrors(errors);
    if (errors.email || errors.otp || errors.newPassword) {
      focusFirstInvalidField(errors);
      return;
    }

    const normalizedEmail = values.email.trim();
    const normalizedOtp = values.otp.trim();

    setLoading(true);
    try {
      await (onSubmit ?? confirmPasswordReset)({
        email: normalizedEmail,
        otp: normalizedOtp,
        newPassword: values.newPassword,
      });

      useUIStore
        .getState()
        .showToast('success', 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      onResetSuccess?.(normalizedEmail);
      onSuccess?.(normalizedEmail);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === ApiErrorCode.INVALID_OTP) {
        setFieldErrors((prev) => ({
          ...prev,
          otp: 'Mã OTP không hợp lệ hoặc đã hết hạn.',
        }));
        otpFirstInputRef.current?.focus();
      } else if (normalized.code === ApiErrorCode.USER_NOT_EXISTED) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'Không tìm thấy người dùng với email này.',
        }));
        emailInputRef.current?.focus();
      } else if (normalized.code === ApiErrorCode.PASSWORD_INVALID) {
        setFieldErrors((prev) => ({
          ...prev,
          newPassword: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
        }));
        passwordInputRef.current?.focus();
      }
      setServerError(resolveResetPasswordError(normalized.code, normalized.message));
    } finally {
      setLoading(false);
    }
  }

  const isBusy = loading || resendingOtp;

  return (
    <form className={cn('w-full', className)} onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        <Alert variant="info" title="Hỗ trợ kiểm thử trên Local ([MOCK OTP])">
          Nhập mã OTP 6 chữ số đã nhận qua email (hoặc xem dòng log{' '}
          <code className="rounded bg-card px-1.5 py-0.5 font-semibold text-foreground">
            [MOCK OTP]
          </code>{' '}
          trên console Server khi chạy Local) để đặt lại mật khẩu mới.
        </Alert>

        {resendInfo && (
          <Alert variant="success" role="status" onClose={() => setResendInfo(null)}>
            {resendInfo}
          </Alert>
        )}

        {(serverError ?? externalError) && (
          <Alert variant="danger" role="alert" onClose={() => setServerError(null)}>
            {serverError ?? externalError}
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
          value={values.email}
          error={fieldErrors.email}
          disabled={isBusy}
          onChange={(event) => updateField('email', event.currentTarget.value)}
          onBlur={(event) => handleInputBlur('email', event)}
        />

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              id={otpLabelId}
              className="block text-body-sm font-semibold text-foreground"
            >
              Mã OTP khôi phục (6 chữ số) <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              loading={resendingOtp}
              loadingText="Đang gửi..."
              disabled={isBusy || cooldown > 0}
              onClick={() => void handleResendOtp()}
            >
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã OTP'}
            </Button>
          </div>
          <OtpInput
            ref={otpFirstInputRef}
            length={OTP_LENGTH}
            mode="numeric"
            value={values.otp}
            error={fieldErrors.otp}
            disabled={isBusy}
            aria-label="Mã OTP khôi phục 6 chữ số"
            onValueChange={(nextOtp) => updateField('otp', nextOtp)}
          />
        </div>

        <PasswordInput
          ref={passwordInputRef}
          name="newPassword"
          label="Mật khẩu mới"
          placeholder="Tối thiểu 6 ký tự"
          hint="Mật khẩu mới sẽ có hiệu lực ngay sau khi xác nhận."
          autoComplete="new-password"
          required
          showStrengthMeter
          value={values.newPassword}
          error={fieldErrors.newPassword}
          disabled={isBusy}
          onChange={(event) => updateField('newPassword', event.currentTarget.value)}
          onBlur={(event) => handleInputBlur('newPassword', event)}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          loadingText="Đang cập nhật mật khẩu..."
          disabled={isBusy}
        >
          Đặt lại mật khẩu
        </Button>
      </Stack>
    </form>
  );
}

export default ResetPasswordForm;
