// Dịch vụ quản lý tài khoản và hồ sơ người dùng
import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';
import type { UUID, UserCreationRequest, UserResponse, UserUpdateRequest } from '../types';

const USERS_BASE_PATH = '/api/v1/users';

export function getMyInfo(): Promise<UserResponse> {
  return apiGet<UserResponse>(`${USERS_BASE_PATH}/me`);
}

export function createUser(payload: UserCreationRequest): Promise<UserResponse> {
  return apiPost<UserResponse, UserCreationRequest>(USERS_BASE_PATH, payload);
}

export function getUsers(name?: string): Promise<UserResponse[]> {
  const query = name && name.trim() ? `?name=${encodeURIComponent(name.trim())}` : '';
  return apiGet<UserResponse[]>(`${USERS_BASE_PATH}${query}`);
}

export function getUserById(userId: UUID): Promise<UserResponse> {
  return apiGet<UserResponse>(`${USERS_BASE_PATH}/${encodeURIComponent(userId)}`);
}

export const getUser = getUserById;

export function updateUser(userId: UUID, payload: UserUpdateRequest): Promise<UserResponse> {
  return apiPut<UserResponse, UserUpdateRequest>(
    `${USERS_BASE_PATH}/${encodeURIComponent(userId)}`,
    payload,
  );
}

export function deleteUser(userId: UUID): Promise<string> {
  return apiDelete<string>(`${USERS_BASE_PATH}/${encodeURIComponent(userId)}`);
}

export const userService = {
  getMyInfo,
  createUser,
  getUsers,
  getUserById,
  getUser,
  updateUser,
  deleteUser,
};

export default userService;
