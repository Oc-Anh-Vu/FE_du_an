// Hàm xử lý nghiệp vụ miền Xác thực, Phân quyền & Hồ sơ: đóng gói validate, gọi service, cập nhật store và chuẩn hóa lỗi cho tầng pages
import { useCallback, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { normalizeApiError } from '../../services/apiClient';
import { authService } from '../../services/auth.service';
import { tagService } from '../../services/tag.service';
import { userService } from '../../services/user.service';
import { useUIStore } from '../../store/uiStore';
import { useUserStore } from '../../store/userStore';
import {
  ApiErrorCode,
  type ApiError,
  type AuthenticationRequest,
  type ResetPasswordRequest,
  type TagResponse,
  type UserCreationRequest,
  type UserResponse,
  type UserTagResponse,
  type UserUpdateRequest,
  type UUID,
  type VerifyOtpRequest,
  type VerifyOtpResponse,
} from '../../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;

export type PersonalTagAction = 'add' | 'remove' | 'updateTemporary';

export interface ManagePersonalTagOptions {
  temporary?: boolean;
}

export interface UseAuthActionsReturn {
  isSubmitting: boolean;
  error: string | null;
  isForbiddenProfileUpdate: boolean;
  clearError: () => void;
  submitLogin: (payload: AuthenticationRequest) => Promise<UserResponse>;
  submitSignup: (payload: UserCreationRequest) => Promise<UserResponse>;
  sendVerificationOtp: (email: string) => Promise<string>;
  verifyEmailOtp: (payload: VerifyOtpRequest) => Promise<VerifyOtpResponse>;
  requestPasswordReset: (email: string) => Promise<string>;
  confirmPasswordReset: (payload: ResetPasswordRequest) => Promise<string>;
  updateProfileAndBank: (
    userIdOrPayload: UUID | UserUpdateRequest,
    payload?: UserUpdateRequest,
  ) => Promise<UserResponse | null>;
  managePersonalTag: (
    action: PersonalTagAction,
    tagId: UUID,
    options?: ManagePersonalTagOptions,
  ) => Promise<UserTagResponse | null>;
  fetchSystemTags: () => Promise<TagResponse[]>;
  fetchMyTags: () => Promise<UserTagResponse[]>;
}

function validationError(code: number, message: string): ApiError {
  return { status: 0, code, message };
}

function assertEmail(email: string): string {
  const trimmed = email.trim();
  if (!EMAIL_PATTERN.test(trimmed)) {
    throw validationError(ApiErrorCode.EMAIL_INVALID, 'Email không đúng định dạng.');
  }
  return trimmed;
}

function assertOtp(otp: string): string {
  const trimmed = otp.trim();
  if (!OTP_PATTERN.test(trimmed)) {
    throw validationError(ApiErrorCode.INVALID_OTP, 'Vui lòng nhập đủ 6 chữ số của mã OTP.');
  }
  return trimmed;
}

function assertPassword(password: string, label = 'Mật khẩu'): string {
  if (password.length < 6) {
    throw validationError(ApiErrorCode.PASSWORD_INVALID, `${label} phải có ít nhất 6 ký tự.`);
  }
  return password;
}

function assertUsername(username: string): string {
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    throw validationError(ApiErrorCode.USERNAME_INVALID, 'Tên đăng nhập phải có ít nhất 3 ký tự.');
  }
  return trimmed;
}

function messageForAuthError(error: ApiError): string {
  switch (error.code) {
    case ApiErrorCode.USER_NOT_EXISTED:
      return 'Người dùng không tồn tại. Vui lòng kiểm tra lại thông tin.';
    case ApiErrorCode.LOGIN_FAILED:
      return 'Tài khoản hoặc mật khẩu không chính xác.';
    case ApiErrorCode.USER_EXISTED:
      return 'Tên đăng nhập hoặc email đã tồn tại. Vui lòng sử dụng thông tin khác.';
    case ApiErrorCode.INVALID_OTP:
      return error.status === 0
        ? error.message
        : 'Mã OTP không hợp lệ hoặc đã hết hạn (5 phút).';
    default:
      return error.message;
  }
}

export function useAuthActions(): UseAuthActionsReturn {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForbiddenProfileUpdate, setIsForbiddenProfileUpdate] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
    setIsForbiddenProfileUpdate(false);
  }, []);

  // Bọc mọi thao tác: bật/tắt isSubmitting, chuẩn hóa lỗi thành ApiError (message thân thiện) rồi ném lại cho Page/Form
  const run = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await task();
    } catch (raw) {
      const normalized = normalizeApiError(raw);
      const friendly: ApiError = { ...normalized, message: messageForAuthError(normalized) };
      setError(friendly.message);
      throw friendly;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const submitLogin = useCallback(
    (payload: AuthenticationRequest) =>
      run(async () => {
        const username = assertUsername(payload.username);
        if (!payload.password) {
          throw validationError(ApiErrorCode.PASSWORD_INVALID, 'Vui lòng nhập mật khẩu.');
        }
        return login({ username, password: payload.password });
      }),
    [login, run],
  );

  const submitSignup = useCallback(
    (payload: UserCreationRequest) =>
      run(async () =>
        userService.createUser({
          ...payload,
          username: assertUsername(payload.username),
          email: assertEmail(payload.email),
          password: assertPassword(payload.password),
        }),
      ),
    [run],
  );

  const sendVerificationOtp = useCallback(
    (email: string) => run(() => authService.sendOtp({ email: assertEmail(email) })),
    [run],
  );

  const verifyEmailOtp = useCallback(
    (payload: VerifyOtpRequest) =>
      run(async () => {
        const result = await authService.verifyOtp({
          email: assertEmail(payload.email),
          otp: assertOtp(payload.otp),
        });
        if (!result?.verified) {
          throw validationError(ApiErrorCode.INVALID_OTP, 'Mã OTP không hợp lệ hoặc đã hết hạn (5 phút).');
        }
        return result;
      }),
    [run],
  );

  const requestPasswordReset = useCallback(
    (email: string) => run(() => authService.forgotPassword({ email: assertEmail(email) })),
    [run],
  );

  const confirmPasswordReset = useCallback(
    (payload: ResetPasswordRequest) =>
      run(() =>
        authService.resetPassword({
          email: assertEmail(payload.email),
          otp: assertOtp(payload.otp),
          newPassword: assertPassword(payload.newPassword, 'Mật khẩu mới'),
        }),
      ),
    [run],
  );

  const updateProfileAndBank = useCallback(
    async (userId: UUID, payload: UserUpdateRequest): Promise<UserResponse | null> => {
      setIsForbiddenProfileUpdate(false);
      try {
        const updated = await run(() => userService.updateMyInfo(payload));
        useUserStore.getState().setCurrentUser(updated);
        useUIStore.getState().showToast('success', 'Đã cập nhật hồ sơ thành công.');
        return updated;
      } catch (raw) {
        const apiError = normalizeApiError(raw);
        // SecurityConfig.java dòng 120 chưa mở PUT /users/{id} cho ROLE_USER -> 403 (1003): báo thân thiện, KHÔNG xóa phiên
        if (apiError.status === 403 || apiError.code === ApiErrorCode.UNAUTHORIZED) {
          const message =
            'Máy chủ hiện chưa cấp quyền cập nhật hồ sơ cho tài khoản của bạn (403). Phiên đăng nhập vẫn được giữ nguyên.';
          setIsForbiddenProfileUpdate(true);
          setError(message);
          useUIStore.getState().showToast('warning', message);
          return null;
        }
        throw raw;
      }
    },
    [run],
  );

  const managePersonalTag = useCallback(
    async (
      action: PersonalTagAction,
      tagId: UUID,
      options?: ManagePersonalTagOptions,
    ): Promise<UserTagResponse | null> =>
      run(async () => {
        const store = useUserStore.getState();
        if (action === 'remove') {
          await tagService.removeUserTag(tagId);
          store.removeMyTag(tagId);
          return null;
        }
        const result =
          action === 'add'
            ? await tagService.addUserTag(tagId, options?.temporary ?? false)
            : await tagService.updateUserTag(tagId, Boolean(options?.temporary));
        store.upsertMyTag(result);
        return result;
      }),
    [run],
  );

  const fetchSystemTags = useCallback(async (): Promise<TagResponse[]> => {
    try {
      return await tagService.getAllTags();
    } catch {
      return [];
    }
  }, []);

  const fetchMyTags = useCallback(async (): Promise<UserTagResponse[]> => {
    try {
      const tags = await tagService.getUserTags();
      useUserStore.getState().setMyTags(tags);
      return tags;
    } catch {
      return [];
    }
  }, []);

  return {
    isSubmitting,
    error,
    isForbiddenProfileUpdate,
    clearError,
    submitLogin,
    submitSignup,
    sendVerificationOtp,
    verifyEmailOtp,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfileAndBank,
    managePersonalTag,
    fetchSystemTags,
    fetchMyTags,
  };
}

export default useAuthActions;
