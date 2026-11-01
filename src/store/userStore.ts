// Store quản lý phiên đăng nhập, người dùng hiện tại, tọa độ GPS, tags sở thích & dọn dẹp phiên (FE_SPEC.md Mục 5.1, 5.2, 5.3)
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  AUTH_STORAGE_KEY,
  clearStoredAccessToken,
  configureApiClient,
} from '../services/apiClient';
import { socketClient } from '../services/socketClient';
import {
  Role,
  type UserResponse,
  type UserTagResponse,
  type UUID,
} from '../types';
import { useBillingStore } from './billingStore';
import { useRoomStore } from './roomStore';
import { useUIStore } from './uiStore';

export type AuthStatus = 'IDLE' | 'INITIALIZING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface UserStoreData {
  authStatus: AuthStatus;
  token: string | null;
  currentUser: UserResponse | null;
  coordinates: GeoCoordinates | null;
  myTags: UserTagResponse[];
}

interface PersistedUserStoreSlice {
  token: string | null;
  currentUser: UserResponse | null;
}

export interface UserStoreState extends UserStoreData {
  setAuthStatus: (status: AuthStatus) => void;
  setToken: (token: string | null) => void;
  setCurrentUser: (user: UserResponse | null) => void;
  setSession: (token: string, user: UserResponse, tags?: UserTagResponse[]) => void;
  setCoordinates: (coords: GeoCoordinates | null) => void;
  setMyTags: (tags: UserTagResponse[]) => void;
  upsertMyTag: (userTag: UserTagResponse) => void;
  removeMyTag: (tagId: UUID) => void;
  isAdmin: () => boolean;
  clearUserSession: () => void;
}

export interface ResetSessionOptions {
  navigate?: (to: string, options?: { replace?: boolean }) => void;
}

export const initialUserState: UserStoreData = {
  authStatus: 'IDLE',
  token: null,
  currentUser: null,
  coordinates: null,
  myTags: [],
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      ...initialUserState,

      setAuthStatus: (status) =>
        set({
          authStatus: status,
        }),

      setToken: (token) =>
        set({
          token,
        }),

      setCurrentUser: (user) =>
        set({
          currentUser: user,
        }),

      setSession: (token, user, tags) =>
        set((state) => ({
          token,
          currentUser: user,
          authStatus: 'AUTHENTICATED',
          myTags: tags !== undefined ? tags : state.myTags,
        })),

      setCoordinates: (coords) =>
        set({
          coordinates: coords,
        }),

      setMyTags: (tags) =>
        set({
          myTags: Array.isArray(tags) ? tags : [],
        }),

      upsertMyTag: (userTag) =>
        set((state) => {
          const existingIndex = state.myTags.findIndex(
            (item) => item.tag.id === userTag.tag.id,
          );
          if (existingIndex === -1) {
            return {
              myTags: [...state.myTags, userTag],
            };
          }
          const nextTags = [...state.myTags];
          nextTags[existingIndex] = userTag;
          return {
            myTags: nextTags,
          };
        }),

      removeMyTag: (tagId) =>
        set((state) => ({
          myTags: state.myTags.filter((item) => item.tag.id !== tagId),
        })),

      isAdmin: () => {
        const roles = get().currentUser?.roles;
        if (!Array.isArray(roles)) {
          return false;
        }
        return roles.some((role) => {
          const normalized = String(role).trim().toUpperCase();
          return normalized === Role.ROLE_ADMIN || normalized === 'ADMIN';
        });
      },

      clearUserSession: () => {
        // Giữ lại coordinates nếu trình duyệt đã cấp quyền GPS
        set((state) => ({
          authStatus: 'UNAUTHENTICATED',
          token: null,
          currentUser: null,
          myTags: [],
          coordinates: state.coordinates,
        }));
        clearStoredAccessToken();
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => window.localStorage),
      // Chỉ persist token và currentUser dưới khóa hnag-auth-storage
      partialize: (state): PersistedUserStoreSlice => ({
        token: state.token,
        currentUser: state.currentUser,
      }),
      // Ép authStatus luôn khởi tạo là 'IDLE' khi tải trang để buộc SessionBootstrap chạy introspect
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<PersistedUserStoreSlice> | undefined) ?? {};
        return {
          ...currentState,
          token: typeof persisted.token === 'string' ? persisted.token : null,
          currentUser: persisted.currentUser ?? null,
          authStatus: 'IDLE',
        };
      },
    },
  ),
);

export function resetSessionAndStores(options?: ResetSessionOptions): void {
  socketClient.disconnect();
  useUserStore.getState().clearUserSession();
  useRoomStore.getState().resetRoomStore();
  useBillingStore.getState().resetBillingStore();
  useUIStore.getState().closeInviteModal();
  if (options?.navigate) {
    options.navigate('/login', { replace: true });
  }
}

// Đăng ký callback lấy token và xử lý HTTP 401 tập trung vào apiClient ngay khi khởi tạo module
configureApiClient({
  getToken: () => useUserStore.getState().token,
  onUnauthorized: () => {
    resetSessionAndStores();
  },
});

export default useUserStore;
