// Store quản lý trạng thái giao diện toàn cục: Toast thông báo & Modal lời mời vào phòng (FE_SPEC.md Mục 5.2)
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

export const useUIStore = create<UIStoreState>((set) => ({
  toast: initialToastState,
  inviteModal: initialInviteModalState,

  showToast: (type, message, duration) =>
    set({
      toast: {
        isVisible: true,
        type,
        message,
        ...(duration !== undefined ? { duration } : {}),
      },
    }),

  hideToast: () =>
    set((state) => ({
      toast: {
        ...state.toast,
        isVisible: false,
      },
    })),

  openInviteModal: (payload) =>
    set({
      inviteModal: {
        isOpen: true,
        payload,
      },
    }),

  closeInviteModal: () =>
    set({
      inviteModal: initialInviteModalState,
    }),
}));

export default useUIStore;
