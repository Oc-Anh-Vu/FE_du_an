// Khung store quản lý phiên đăng nhập, thông tin người dùng, GPS, tags và hàm resetSessionAndStores()
import { create } from 'zustand';
import type { UserResponse, UserTagResponse, UUID } from '../types';

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

export const initialUserState: UserStoreData = {
  authStatus: 'IDLE',
  token: null,
  currentUser: null,
  coordinates: null,
  myTags: [],
};

export const useUserStore = create<UserStoreState>(() => ({
  ...initialUserState,
  setAuthStatus: () => {
    // coming soon
  },
  setToken: () => {
    // coming soon
  },
  setCurrentUser: () => {
    // coming soon
  },
  setSession: () => {
    // coming soon
  },
  setCoordinates: () => {
    // coming soon
  },
  setMyTags: () => {
    // coming soon
  },
  upsertMyTag: () => {
    // coming soon
  },
  removeMyTag: () => {
    // coming soon
  },
  isAdmin: () => {
    // coming soon
    return false;
  },
  clearUserSession: () => {
    // coming soon
  },
}));

// Hàm dọn dẹp tập trung khi Logout hoặc gặp HTTP 401
export function resetSessionAndStores(): void {
  // coming soon
}

export default useUserStore;
