// Hook điều phối đăng nhập, đăng xuất, khởi tạo phiên (bootstrapSession) và kiểm tra quyền RBAC
import { useCallback } from 'react';
import {
  resetSessionAndStores,
  useUserStore,
  type AuthStatus,
  type ResetSessionOptions,
} from '../store/userStore';
import type {
  AuthenticationRequest,
  RoleInput,
  UserResponse,
  UserTagResponse,
} from '../types';

export interface UseAuthReturn {
  authStatus: AuthStatus;
  token: string | null;
  currentUser: UserResponse | null;
  myTags: UserTagResponse[];
  isAuthenticated: boolean;
  isInitializing: boolean;
  bootstrapSession: () => Promise<boolean>;
  login: (payload: AuthenticationRequest) => Promise<UserResponse>;
  logout: (options?: ResetSessionOptions) => void;
  refreshProfile: () => Promise<UserResponse | null>;
  isAdmin: () => boolean;
  hasRole: (requiredRoles: RoleInput | RoleInput[]) => boolean;
}

export function useAuth(): UseAuthReturn {
  const authStatus = useUserStore((state) => state.authStatus);
  const token = useUserStore((state) => state.token);
  const currentUser = useUserStore((state) => state.currentUser);
  const myTags = useUserStore((state) => state.myTags);

  const bootstrapSession = useCallback(async (): Promise<boolean> => {
    return false;
  }, []);

  const login = useCallback(async (payload: AuthenticationRequest): Promise<UserResponse> => {
    void payload;
    throw new Error('Chưa thực thi');
  }, []);

  const logout = useCallback((options?: ResetSessionOptions): void => {
    resetSessionAndStores(options);
  }, []);

  const refreshProfile = useCallback(async (): Promise<UserResponse | null> => {
    return null;
  }, []);

  const isAdmin = useCallback((): boolean => {
    return useUserStore.getState().isAdmin();
  }, []);

  const hasRole = useCallback((requiredRoles: RoleInput | RoleInput[]): boolean => {
    void requiredRoles;
    return false;
  }, []);

  return {
    authStatus,
    token,
    currentUser,
    myTags,
    isAuthenticated: authStatus === 'AUTHENTICATED' && Boolean(token),
    isInitializing: authStatus === 'IDLE' || authStatus === 'INITIALIZING',
    bootstrapSession,
    login,
    logout,
    refreshProfile,
    isAdmin,
    hasRole,
  };
}

export default useAuth;
