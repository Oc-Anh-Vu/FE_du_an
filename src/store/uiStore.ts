// Khung store giao diện toàn cục (Toast & Modal lời mời vào phòng)
import { create } from 'zustand';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastState {
  isVisible: boolean;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface InviteModalPayload {
  roomId?: string;
  roomCode: string;
  roomName?: string | null;
  inviterName: string;
  inviterAvatarUrl?: string | null;
}

export interface InviteModalState {
  isOpen: boolean;
  payload: InviteModalPayload | null;
}

export interface UIStoreState {
  toast: ToastState;
  inviteModal: InviteModalState;
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: () => void;
  openInviteModal: (payload: InviteModalPayload) => void;
  closeInviteModal: () => void;
}

export const initialToastState: ToastState = {
  isVisible: false,
  type: 'info',
  message: '',
};

export const initialInviteModalState: InviteModalState = {
  isOpen: false,
  payload: null,
};

export const useUIStore = create<UIStoreState>(() => ({
  toast: initialToastState,
  inviteModal: initialInviteModalState,
  showToast: () => {
    // coming soon
  },
  hideToast: () => {
    // coming soon
  },
  openInviteModal: () => {
    // coming soon
  },
  closeInviteModal: () => {
    // coming soon
  },
}));

export default useUIStore;
