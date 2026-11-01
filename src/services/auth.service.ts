// Dịch vụ xác thực và quản lý OTP/mật khẩu
import { apiPost } from './apiClient';
import type {
  AuthenticationRequest,
  AuthenticationResponse,
  IntrospectRequest,
  IntrospectResponse,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../types';

const AUTH_BASE_PATH = '/api/v1/auth';

export function login(payload: AuthenticationRequest): Promise<AuthenticationResponse> {
  return apiPost<AuthenticationResponse, AuthenticationRequest>(`${AUTH_BASE_PATH}/token`, payload);
}

export function introspect(payload: IntrospectRequest): Promise<IntrospectResponse> {
  return apiPost<IntrospectResponse, IntrospectRequest>(`${AUTH_BASE_PATH}/introspect`, payload);
}

export function sendOtp(payload: SendOtpRequest): Promise<string> {
  return apiPost<string, SendOtpRequest>(`${AUTH_BASE_PATH}/send-otp`, payload);
}

export function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  return apiPost<VerifyOtpResponse, VerifyOtpRequest>(`${AUTH_BASE_PATH}/verify-otp`, payload);
}

export function forgotPassword(payload: SendOtpRequest): Promise<string> {
  return apiPost<string, SendOtpRequest>(`${AUTH_BASE_PATH}/forgot-password`, payload);
}

export function resetPassword(payload: ResetPasswordRequest): Promise<string> {
  return apiPost<string, ResetPasswordRequest>(`${AUTH_BASE_PATH}/reset-password`, payload);
}

export const authService = {
  login,
  introspect,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};

export default authService;
