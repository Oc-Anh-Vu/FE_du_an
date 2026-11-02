// Barrel export miền Xác thực, Phân quyền & Hồ sơ
export { useAuthActions } from './useAuthActions';
export type {
  UseAuthActionsReturn,
  PersonalTagAction,
  ManagePersonalTagOptions,
} from './useAuthActions';

export { SessionBootstrap, SessionLoadingScreen } from './SessionBootstrap';
export type { SessionBootstrapProps, SessionLoadingScreenProps } from './SessionBootstrap';
export { ProtectedRoute } from './ProtectedRoute';
export type { ProtectedRouteProps } from './ProtectedRoute';
export { GuestOnlyRoute } from './GuestOnlyRoute';
export type { GuestOnlyRouteProps } from './GuestOnlyRoute';
export { AdminRoute } from './AdminRoute';
export type { AdminRouteProps } from './AdminRoute';

export { LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm';
export { SignupForm } from './SignupForm';
export type { SignupFormProps } from './SignupForm';
export { VerifyOtpForm } from './VerifyOtpForm';
export type { VerifyOtpFormProps } from './VerifyOtpForm';
export { ForgotPasswordForm } from './ForgotPasswordForm';
export type { ForgotPasswordFormProps } from './ForgotPasswordForm';
export { ResetPasswordForm } from './ResetPasswordForm';
export type { ResetPasswordFormProps } from './ResetPasswordForm';
export { LocationPrompt } from './LocationPrompt';
export type { LocationPromptProps } from './LocationPrompt';
