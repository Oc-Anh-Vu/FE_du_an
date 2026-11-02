import { useCallback, useMemo, useState } from 'react';
import type {
  CreateRoomRequest,
  MemberJoinedSocketData,
  MemberLeftSocketData,
  MatchFoundSocketData,
  RoomResponse,
  RoomSocketEvent,
  UUID,
} from '../../types';
import { ApiErrorCode, RoomStatus } from '../../types';
import { roomService } from '../../services/room.service';
import { useRoomStore } from '../../store/roomStore';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';

export interface UseRoomActionsReturn {
  currentRoom: RoomResponse | null;
  activeRooms: RoomResponse[];
  isCurrentUserHost: boolean;
  isLoading: boolean;
  error: string | null;
  fetchMyActiveRooms: () => Promise<RoomResponse[]>;
  fetchRoomDetails: (
    roomId: UUID,
  ) => Promise<{ success: boolean; room?: RoomResponse; isNotFoundOrForbidden?: boolean; error?: string }>;
  createNewRoom: (payload: CreateRoomRequest) => Promise<RoomResponse | null>;
  joinRoomByCode: (roomCode: string) => Promise<RoomResponse | null>;
  startRoomSwiping: (roomId: UUID) => Promise<boolean>;
  kickRoomMember: (roomId: UUID, memberUserId: UUID) => Promise<boolean>;
  leaveCurrentRoom: (roomId: UUID) => Promise<boolean>;
  closeCurrentRoom: (roomId: UUID) => Promise<boolean>;
  deleteCurrentRoom: (roomId: UUID) => Promise<boolean>;
  handleRoomSocketEvent: (event: RoomSocketEvent) => void;
  clearError: () => void;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error && typeof error === 'object') {
    const err = error as { code?: number; message?: string; status?: number };
    if (err.code === ApiErrorCode.ROOM_NOT_FOUND) {
      return 'Không tìm thấy phòng ăn hoặc mã phòng không hợp lệ.';
    }
    if (err.code === ApiErrorCode.ROOM_NOT_OPEN) {
      return 'Phòng ăn hiện không mở để tham gia (đang quẹt thẻ hoặc đã đóng).';
    }
    if (err.code === ApiErrorCode.USER_ALREADY_IN_ROOM) {
      return 'Bạn đã là thành viên trong phòng ăn này rồi.';
    }
    if (err.code === ApiErrorCode.NOT_ROOM_MEMBER) {
      return 'Bạn không phải là thành viên của phòng ăn này.';
    }
    if (err.code === ApiErrorCode.NOT_ROOM_HOST) {
      return 'Chỉ chủ phòng mới có quyền thực hiện thao tác này.';
    }
    if (err.code === ApiErrorCode.ROOM_LOCATION_NOT_SET) {
      return 'Phòng chưa được thiết lập tọa độ vị trí GPS.';
    }
    if (err.code === ApiErrorCode.NO_PLACES_NEARBY) {
      return 'Không tìm thấy quán ăn nào trong bán kính đã chọn. Vui lòng mở rộng bán kính tìm kiếm.';
    }
    if (err.code === ApiErrorCode.CANNOT_KICK_SELF) {
      return 'Chủ phòng không thể tự xóa chính mình khỏi phòng.';
    }
    if (err.code === ApiErrorCode.ROOM_FULL) {
      return 'Phòng ăn đã đủ số lượng thành viên tối đa.';
    }
    if (err.message) {
      return err.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}

export function useRoomActions(): UseRoomActionsReturn {
  const currentRoom = useRoomStore((state) => state.currentRoom);
  const activeRooms = useRoomStore((state) => state.activeRooms);
  const currentUser = useUserStore((state) => state.currentUser);

  const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);
  const setActiveRooms = useRoomStore((state) => state.setActiveRooms);
  const updateCurrentRoomStatus = useRoomStore((state) => state.updateCurrentRoomStatus);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Kiểm tra quyền chủ phòng của người dùng hiện tại */
  const isCurrentUserHost = useMemo(() => {
    if (!currentRoom || !currentUser) return false;
    return currentRoom.host.id === currentUser.id;
  }, [currentRoom, currentUser]);

  /** Tải danh sách phòng đang hoạt động của người dùng */
  const fetchMyActiveRooms = useCallback(async (): Promise<RoomResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const rooms = await roomService.getMyRooms();
      const validRooms = Array.isArray(rooms) ? rooms : [];
      setActiveRooms(validRooms);
      return validRooms;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải danh sách phòng ăn của bạn.');
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setActiveRooms]);

  /** Tải chi tiết một phòng ăn cụ thể */
  const fetchRoomDetails = useCallback(
    async (
      roomId: UUID,
    ): Promise<{ success: boolean; room?: RoomResponse; isNotFoundOrForbidden?: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const room = await roomService.getRoomById(roomId);
        setCurrentRoom(room);
        return { success: true, room };
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tải thông tin phòng ăn.');
        setError(message);
        const errObj = err as { code?: number; status?: number } | undefined;
        const isNotFoundOrForbidden =
          errObj?.code === ApiErrorCode.ROOM_NOT_FOUND ||
          errObj?.code === ApiErrorCode.NOT_ROOM_MEMBER ||
          errObj?.status === 404 ||
          errObj?.status === 403;

        return { success: false, isNotFoundOrForbidden, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentRoom],
  );

  /** Tạo một phòng ăn mới */
  const createNewRoom = useCallback(
    async (payload: CreateRoomRequest): Promise<RoomResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const room = await roomService.createRoom(payload);
        setCurrentRoom(room);
        useUIStore.getState().showToast('success', `Đã tạo phòng ăn "${room.name || room.roomCode}" thành công!`);
        return room;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tạo phòng ăn mới.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentRoom],
  );

  /** Tham gia phòng ăn bằng mã phòng */
  const joinRoomByCode = useCallback(
    async (roomCode: string): Promise<RoomResponse | null> => {
      const cleanCode = roomCode.trim().toUpperCase();
      if (!cleanCode) {
        const message = 'Vui lòng nhập mã phòng hợp lệ.';
        setError(message);
        useUIStore.getState().showToast('warning', message);
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const room = await roomService.joinRoom(cleanCode);
        setCurrentRoom(room);
        useUIStore.getState().showToast('success', `Đã tham gia phòng "${room.name || room.roomCode}" thành công!`);
        return room;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tham gia phòng ăn bằng mã này.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentRoom],
  );

  /** Chủ phòng bấm bắt đầu quẹt thẻ */
  const startRoomSwiping = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.startRoom(roomId);
        updateCurrentRoomStatus(RoomStatus.SWIPING);
        useUIStore.getState().showToast('info', 'Phiên quẹt thẻ đã bắt đầu! Đang vào bàn quẹt...');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể bắt đầu phiên quẹt thẻ.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateCurrentRoomStatus],
  );

  /** Chủ phòng mời thành viên ra khỏi phòng */
  const kickRoomMember = useCallback(
    async (roomId: UUID, memberUserId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.kickMember(roomId, memberUserId);
        useRoomStore.getState().removeRoomMember(memberUserId);
        useUIStore.getState().showToast('success', 'Đã mời thành viên ra khỏi phòng.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể mời thành viên ra khỏi phòng.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /** Thành viên tự rời phòng */
  const leaveCurrentRoom = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.leaveRoom(roomId);
        setCurrentRoom(null);
        useUIStore.getState().showToast('info', 'Bạn đã rời khỏi phòng ăn.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể rời phòng ăn.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentRoom],
  );

  /** Chủ phòng đóng phòng */
  const closeCurrentRoom = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.closeRoom(roomId);
        updateCurrentRoomStatus(RoomStatus.CLOSED);
        useUIStore.getState().showToast('info', 'Phòng ăn đã được đóng lại.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể đóng phòng ăn.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateCurrentRoomStatus],
  );

  /** Chủ phòng xóa/giải tán phòng */
  const deleteCurrentRoom = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.deleteRoom(roomId);
        setCurrentRoom(null);
        setActiveRooms(activeRooms.filter((r) => r.id !== roomId));
        useUIStore.getState().showToast('success', 'Đã giải tán phòng ăn.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xóa phòng ăn.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [activeRooms, setActiveRooms, setCurrentRoom],
  );

  /** Xử lý sự kiện nhận được từ WebSocket STOMP */
  const handleRoomSocketEvent = useCallback((event: RoomSocketEvent) => {
    if (!event || !event.type) return;

    switch (event.type) {
      case 'MEMBER_JOINED': {
        const data = event.data as MemberJoinedSocketData;
        if (data?.user) {
          useRoomStore.getState().addRoomMember(data.user, data.currentMembersCount);
        }
        break;
      }
      case 'MEMBER_LEFT': {
        const data = event.data as MemberLeftSocketData;
        if (data?.user?.id) {
          useRoomStore.getState().removeRoomMember(data.user.id, data.currentMembersCount, data.newHostId);
        }
        break;
      }
      case 'GAME_STARTED': {
        useRoomStore.getState().updateCurrentRoomStatus(RoomStatus.SWIPING);
        break;
      }
      case 'MATCH_FOUND': {
        const data = event.data as MatchFoundSocketData;
        if (data?.matchedPlace) {
          useRoomStore.getState().setRoomMatchedPlace(data.matchedPlace);
        }
        break;
      }
      case 'ROOM_CLOSED': {
        useRoomStore.getState().updateCurrentRoomStatus(RoomStatus.CLOSED);
        break;
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentRoom,
    activeRooms,
    isCurrentUserHost,
    isLoading,
    error,
    fetchMyActiveRooms,
    fetchRoomDetails,
    createNewRoom,
    joinRoomByCode,
    startRoomSwiping,
    kickRoomMember,
    leaveCurrentRoom,
    closeCurrentRoom,
    deleteCurrentRoom,
    handleRoomSocketEvent,
    clearError,
  };
}

export default useRoomActions;
