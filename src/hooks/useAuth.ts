// Hook điều phối đăng nhập, đăng xuất, khởi tạo phiên (bootstrapSession) và kiểm tra quyền RBAC
import { useCallback } from 'react';
import { getAccessToken } from '../services/apiClient';
import { authService } from '../services/auth.service';
import { tagService } from '../services/tag.service';
import { userService } from '../services/user.service';
import { useUIStore } from '../store/uiStore';
import {
  resetSessionAndStores,
  useUserStore,
  type AuthStatus,
  type ResetSessionOptions,
} from '../store/userStore';
import {
  Role,
  type AuthenticationRequest,
  type RoleInput,
  type UserResponse,
  type UserTagResponse,
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

// Khóa singleton tránh gọi introspect/getMyInfo trùng lặp khi nhiều Route Guards cùng mount
let activeBootstrapPromise: Promise<boolean> | null = null;

function normalizeRoleName(role: RoleInput): string {
  const clean = String(role).trim().toUpperCase();
  if (!clean) return '';
  return clean.startsWith('ROLE_') ? clean : `ROLE_${clean}`;
}

async function fetchMyTagsSafely(): Promise<UserTagResponse[]> {
  try {
    return await tagService.getMyTags();
  } catch {
    return [];
  }
}

export async function runSessionBootstrap(): Promise<boolean> {
  const storeState = useUserStore.getState();
  if (storeState.authStatus === 'AUTHENTICATED' && storeState.token && storeState.currentUser) {
    return true;
  }

  if (activeBootstrapPromise) {
    return activeBootstrapPromise;
  }

  activeBootstrapPromise = (async (): Promise<boolean> => {
    const storedToken = useUserStore.getState().token ?? getAccessToken();

    if (!storedToken) {
      useUserStore.getState().setAuthStatus('UNAUTHENTICATED');
      return false;
    }

    useUserStore.getState().setToken(storedToken);
    useUserStore.getState().setAuthStatus('INITIALIZING');

    try {
      const introspectResult = await authService.introspect({ token: storedToken });
      if (!introspectResult?.valid) {
        resetSessionAndStores();
        return false;
      }

      const [userProfile, userTags] = await Promise.all([
        userService.getMyInfo(),
        fetchMyTagsSafely(),
      ]);

      useUserStore.getState().setSession(storedToken, userProfile, userTags);
      return true;
    } catch {
      resetSessionAndStores();
      return false;
    } finally {
      activeBootstrapPromise = null;
    }
  })();

  return activeBootstrapPromise;
}

export function useAuth(): UseAuthReturn {
  const authStatus = useUserStore((state) => state.authStatus);
  const token = useUserStore((state) => state.token);
  const currentUser = useUserStore((state) => state.currentUser);
  const myTags = useUserStore((state) => state.myTags);

  const bootstrapSession = useCallback((): Promise<boolean> => {
    return runSessionBootstrap();
  }, []);

  const login = useCallback(async (payload: AuthenticationRequest): Promise<UserResponse> => {
    const authResp = await authService.login({
      username: payload.username.trim(),
      password: payload.password,
    });

    const nextToken = authResp.token;
    // Lưu token trước để Axios Request Interceptor đính kèm Bearer token cho getMyInfo & getMyTags
    useUserStore.getState().setToken(nextToken);

    try {
      const [userProfile, userTags] = await Promise.all([
        userService.getMyInfo(),
        fetchMyTagsSafely(),
      ]);

      useUserStore.getState().setSession(nextToken, userProfile, userTags);
      return userProfile;
    } catch (error) {
      resetSessionAndStores();
      throw error;
    }
  }, []);

  const logout = useCallback((options?: ResetSessionOptions): void => {
    resetSessionAndStores(options);
    useUIStore.getState().showToast('info', 'Bạn đã đăng xuất khỏi hệ thống.');
  }, []);

  const refreshProfile = useCallback(async (): Promise<UserResponse | null> => {
    if (!useUserStore.getState().token) {
      return null;
    }
    try {
      const [userProfile, userTags] = await Promise.all([
        userService.getMyInfo(),
        fetchMyTagsSafely(),
      ]);
      useUserStore.getState().setCurrentUser(userProfile);
      useUserStore.getState().setMyTags(userTags);
      return userProfile;
    } catch {
      return null;
    }
  }, []);

  const isAdmin = useCallback((): boolean => {
    const roles = currentUser?.roles ?? useUserStore.getState().currentUser?.roles;
    if (!Array.isArray(roles)) {
      return false;
    }
    return roles.some((role) => normalizeRoleName(role) === Role.ROLE_ADMIN);
  }, [currentUser]);

  const hasRole = useCallback(
    (requiredRoles: RoleInput | RoleInput[]): boolean => {
      const roles = currentUser?.roles ?? useUserStore.getState().currentUser?.roles;
      if (!Array.isArray(roles) || roles.length === 0) {
        return false;
      }
      const userRoleSet = new Set(roles.map((r) => normalizeRoleName(r)));
      const targets = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return targets.some((target) => {
        const normalizedTarget = normalizeRoleName(target);
        return Boolean(normalizedTarget && userRoleSet.has(normalizedTarget));
      });
    },
    [currentUser],
  );

  return {
    authStatus,
    token,
    currentUser,
    myTags,
    isAuthenticated: authStatus === 'AUTHENTICATED' && Boolean(token) && Boolean(currentUser),
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
