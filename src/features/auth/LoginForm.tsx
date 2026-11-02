// Biểu mẫu đăng nhập bằng username & password, bắt lỗi 1004/1006 và phát callback onLoginSuccess
import { useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button, Input, PasswordInput } from '../../components/ui/form';
import { Stack } from '../../components/layout/Stack';
import { useAuth } from '../../hooks/useAuth';
import { normalizeApiError } from '../../services/apiClient';
import { useUIStore } from '../../store/uiStore';
import { ApiErrorCode, type UserResponse } from '../../types';
import { cn } from '../../utils/cn';

type LoginField = 'username' | 'password';
type LoginFieldErrors = Partial<Record<LoginField, string>>;

interface LoginFormValues {
  username: string;
  password: string;
}

export interface LoginFormProps {
  defaultUsername?: string;
  infoMessage?: string | null;
  onLoginSuccess?: (user: UserResponse) => void;
  className?: string;
}

function validateLoginField(field: LoginField, values: LoginFormValues): string | undefined {
  if (field === 'username') {
    const trimmed = values.username.trim();
    if (!trimmed) {
      return 'Vui lòng nhập tên đăng nhập.';
    }
    if (trimmed.length < 3) {
      return 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    }
    return undefined;
  }

  if (!values.password) {
    return 'Vui lòng nhập mật khẩu.';
  }
  return undefined;
}

function validateAllFields(values: LoginFormValues): LoginFieldErrors {
  return {
    username: validateLoginField('username', values),
    password: validateLoginField('password', values),
  };
}

function resolveLoginErrorMessage(code: number, fallbackMessage: string): string {
  switch (code) {
    case ApiErrorCode.USER_NOT_EXISTED:
      return 'Người dùng không tồn tại. Vui lòng kiểm tra lại tên đăng nhập.';
    case ApiErrorCode.LOGIN_FAILED:
      return 'Tài khoản hoặc mật khẩu không chính xác.';
    case ApiErrorCode.USERNAME_INVALID:
      return 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    case ApiErrorCode.PASSWORD_INVALID:
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    default:
      return fallbackMessage || 'Đăng nhập không thành công, vui lòng thử lại.';
  }
}

export function LoginForm({
  defaultUsername = '',
  infoMessage = null,
  onLoginSuccess,
  className,
}: LoginFormProps) {
  const { login } = useAuth();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<LoginFormValues>({
    username: defaultUsername,
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: LoginField, nextValue: string) {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setServerError(null);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleBlur(field: LoginField, event: FocusEvent<HTMLInputElement>) {
    const nextValues = { ...values, [field]: event.currentTarget.value };
    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateLoginField(field, nextValues),
    }));
  }

  function focusFirstInvalidField(errors: LoginFieldErrors) {
    if (errors.username) {
      usernameInputRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validateAllFields(values);
    setFieldErrors(errors);
    if (errors.username || errors.password) {
      focusFirstInvalidField(errors);
      return;
    }

    setLoading(true);
    try {
      const userProfile = await login({
        username: values.username.trim(),
        password: values.password,
      });

      useUIStore
        .getState()
        .showToast('success', `Chào mừng ${userProfile.username} quay trở lại!`);
      onLoginSuccess?.(userProfile);
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === ApiErrorCode.USER_NOT_EXISTED) {
        setFieldErrors((prev) => ({
          ...prev,
          username: 'Người dùng không tồn tại.',
        }));
      }
      setServerError(resolveLoginErrorMessage(normalized.code, normalized.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={cn('w-full', className)} onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        {infoMessage && (
          <Alert variant="info" role="status">
            {infoMessage}
          </Alert>
        )}

        {serverError && (
          <Alert variant="danger" role="alert" onClose={() => setServerError(null)}>
            {serverError}
          </Alert>
        )}

        <Input
          ref={usernameInputRef}
          name="username"
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập (username)"
          hint="Sử dụng tên đăng nhập đã tạo (không nhập địa chỉ email)."
          autoComplete="username"
          required
          value={values.username}
          error={fieldErrors.username}
          disabled={loading}
          onChange={(event) => updateField('username', event.currentTarget.value)}
          onBlur={(event) => handleBlur('username', event)}
        />

        <PasswordInput
          ref={passwordInputRef}
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
          autoComplete="current-password"
          required
          value={values.password}
          error={fieldErrors.password}
          disabled={loading}
          onChange={(event) => updateField('password', event.currentTarget.value)}
          onBlur={(event) => handleBlur('password', event)}
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading}
          loadingText="Đang đăng nhập..."
        >
          Đăng nhập
        </Button>
      </Stack>
    </form>
  );
}

export default LoginForm;
