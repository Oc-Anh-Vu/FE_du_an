// Biểu mẫu đăng ký tài khoản mới: kiểm tra mã lỗi 1101, 1102, 1103, 1005 và phát onSignupSuccess
import { useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button, Input, PasswordInput } from '../../components/ui/form';
import { Stack } from '../../components/layout/Stack';
import { normalizeApiError } from '../../services/apiClient';
import { useUIStore } from '../../store/uiStore';
import { ApiErrorCode, type UserCreationRequest, type UserResponse } from '../../types';
import { cn } from '../../utils/cn';
import { useAuthActions } from './useAuthActions';

type SignupField = 'username' | 'email' | 'password';
type SignupFieldErrors = Partial<Record<SignupField, string>>;

interface SignupFormValues {
  username: string;
  email: string;
  password: string;
}

export interface SignupFormProps {
  defaultUsername?: string;
  defaultEmail?: string;
  error?: string | null;
  loading?: boolean;
  onSubmit?: (payload: UserCreationRequest) => Promise<UserResponse | void>;
  onSuccess?: (result: { email: string; username: string; user?: UserResponse }) => void;
  onSignupSuccess?: (email: string, username: string, user?: UserResponse) => void;
  className?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupField(field: SignupField, values: SignupFormValues): string | undefined {
  switch (field) {
    case 'username': {
      const trimmed = values.username.trim();
      if (!trimmed) {
        return 'Vui lòng nhập tên đăng nhập.';
      }
      if (trimmed.length < 3) {
        return 'Tên đăng nhập phải có ít nhất 3 ký tự.';
      }
      return undefined;
    }
    case 'email': {
      const trimmed = values.email.trim();
      if (!trimmed) {
        return 'Vui lòng nhập địa chỉ email.';
      }
      if (!EMAIL_PATTERN.test(trimmed)) {
        return 'Email không đúng định dạng.';
      }
      return undefined;
    }
    case 'password': {
      if (!values.password) {
        return 'Vui lòng nhập mật khẩu.';
      }
      if (values.password.length < 6) {
        return 'Mật khẩu phải có ít nhất 6 ký tự.';
      }
      return undefined;
    }
  }
}

function validateAllSignupFields(values: SignupFormValues): SignupFieldErrors {
  return {
    username: validateSignupField('username', values),
    email: validateSignupField('email', values),
    password: validateSignupField('password', values),
  };
}

function resolveSignupServerError(code: number, fallbackMessage: string): string {
  switch (code) {
    case ApiErrorCode.USER_EXISTED:
      return 'Tên đăng nhập hoặc email đã tồn tại. Vui lòng sử dụng thông tin khác.';
    case ApiErrorCode.USERNAME_INVALID:
      return 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    case ApiErrorCode.PASSWORD_INVALID:
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    case ApiErrorCode.EMAIL_INVALID:
      return 'Email không đúng định dạng.';
    default:
      return fallbackMessage || 'Không thể tạo tài khoản, vui lòng thử lại.';
  }
}

export function SignupForm({
  defaultUsername = '',
  defaultEmail = '',
  error: externalError = null,
  loading: externalLoading = false,
  onSubmit,
  onSuccess,
  onSignupSuccess,
  className,
}: SignupFormProps) {
  const { submitSignup } = useAuthActions();
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<SignupFormValues>({
    username: defaultUsername,
    email: defaultEmail,
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loading = submitting || externalLoading;

  function updateField(field: SignupField, nextValue: string) {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setServerError(null);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleBlur(field: SignupField, event: FocusEvent<HTMLInputElement>) {
    const nextValues = { ...values, [field]: event.currentTarget.value };
    setFieldErrors((prev) => ({
      ...prev,
      [field]: validateSignupField(field, nextValues),
    }));
  }

  function focusFirstInvalidField(errors: SignupFieldErrors) {
    if (errors.username) {
      usernameInputRef.current?.focus();
      return;
    }
    if (errors.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const errors = validateAllSignupFields(values);
    setFieldErrors(errors);
    if (errors.username || errors.email || errors.password) {
      focusFirstInvalidField(errors);
      return;
    }

    const normalizedUsername = values.username.trim();
    const normalizedEmail = values.email.trim();

    setSubmitting(true);
    try {
      const request = {
        username: normalizedUsername,
        email: normalizedEmail,
        password: values.password,
      };
      const createdUser = onSubmit ? await onSubmit(request) : await submitSignup(request);

      useUIStore
        .getState()
        .showToast('success', 'Đăng ký tài khoản thành công!');
      const user = createdUser || undefined;
      onSuccess?.({ email: normalizedEmail, username: normalizedUsername, user });
      onSignupSuccess?.(normalizedEmail, normalizedUsername, user);
    } catch (error) {
      const normalized = normalizeApiError(error);

      if (normalized.code === ApiErrorCode.USERNAME_INVALID) {
        setFieldErrors((prev) => ({
          ...prev,
          username: 'Tên đăng nhập phải có ít nhất 3 ký tự.',
        }));
        usernameInputRef.current?.focus();
      } else if (normalized.code === ApiErrorCode.EMAIL_INVALID) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'Email không đúng định dạng.',
        }));
        emailInputRef.current?.focus();
      } else if (normalized.code === ApiErrorCode.PASSWORD_INVALID) {
        setFieldErrors((prev) => ({
          ...prev,
          password: 'Mật khẩu phải có ít nhất 6 ký tự.',
        }));
        passwordInputRef.current?.focus();
      }

      setServerError(resolveSignupServerError(normalized.code, normalized.message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={cn('w-full', className)} onSubmit={handleSubmit} noValidate>
      <Stack gap={4}>
        {(serverError ?? externalError) && (
          <Alert variant="danger" role="alert" onClose={() => setServerError(null)}>
            {serverError ?? externalError}
          </Alert>
        )}

        <Input
          ref={usernameInputRef}
          name="username"
          label="Tên đăng nhập"
          placeholder="Tối thiểu 3 ký tự (ví dụ: minhtri)"
          autoComplete="username"
          required
          value={values.username}
          error={fieldErrors.username}
          disabled={loading}
          onChange={(event) => updateField('username', event.currentTarget.value)}
          onBlur={(event) => handleBlur('username', event)}
        />

        <Input
          ref={emailInputRef}
          name="email"
          type="email"
          label="Email"
          placeholder="ban@example.com"
          autoComplete="email"
          required
          value={values.email}
          error={fieldErrors.email}
          disabled={loading}
          onChange={(event) => updateField('email', event.currentTarget.value)}
          onBlur={(event) => handleBlur('email', event)}
        />

        <PasswordInput
          ref={passwordInputRef}
          name="password"
          label="Mật khẩu"
          placeholder="Tối thiểu 6 ký tự"
          hint="Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt để tăng độ bảo mật."
          autoComplete="new-password"
          required
          showStrengthMeter
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
          loadingText="Đang tạo tài khoản..."
        >
          Đăng ký tài khoản
        </Button>
      </Stack>
    </form>
  );
}

export default SignupForm;
