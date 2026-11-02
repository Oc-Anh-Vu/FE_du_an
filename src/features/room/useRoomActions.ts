import { useCallback, useMemo, useState } from 'react';
import type { CreateRoomRequest, RoomResponse, UUID } from '../../types';
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

  /** Lấy chi tiết phòng ăn và bắt mã lỗi 2001/2007 để Page điều hướng */
  const fetchRoomDetails = useCallback(
    async (
      roomId: UUID,
    ): Promise<{ success: boolean; room?: RoomResponse; isNotFoundOrForbidden?: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const room = await roomService.getRoomDetails(roomId);
        setCurrentRoom(room);
        return { success: true, room };
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tải thông tin phòng ăn.');
        setError(message);

        const errorCode =
          err && typeof err === 'object' && 'code' in err
            ? (err as { code: number }).code
            : undefined;

        const isNotFoundOrForbidden =
          errorCode === ApiErrorCode.ROOM_NOT_FOUND ||
          errorCode === ApiErrorCode.NOT_ROOM_MEMBER;

        return {
          success: false,
          isNotFoundOrForbidden,
          error: message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentRoom],
  );

  /** Tạo phòng ăn mới */
  const createNewRoom = useCallback(
    async (payload: CreateRoomRequest): Promise<RoomResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const newRoom = await roomService.createRoom(payload);
        setCurrentRoom(newRoom);
        useUIStore.getState().showToast('success', 'Đã tạo phòng ăn mới thành công!');
        return newRoom;
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

  /** Tham gia phòng ăn bằng mã code 6 ký tự */
  const joinRoomByCode = useCallback(
    async (roomCode: string): Promise<RoomResponse | null> => {
      const normalizedCode = roomCode.trim().toUpperCase();
      if (!normalizedCode) {
        useUIStore.getState().showToast('warning', 'Vui lòng nhập mã phòng gồm 6 ký tự.');
        return null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const joinedRoom = await roomService.joinRoom(normalizedCode);
        setCurrentRoom(joinedRoom);
        useUIStore.getState().showToast('success', 'Đã tham gia phòng ăn thành công!');
        return joinedRoom;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tham gia phòng ăn.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentRoom],
  );

  /** Bắt đầu phiên quẹt thẻ chọn quán ăn (độc quyền Host) */
  const startRoomSwiping = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.startSwiping(roomId);
        updateCurrentRoomStatus(RoomStatus.SWIPING);
        useUIStore.getState().showToast('success', 'Đã bắt đầu phiên quẹt thẻ chọn quán!');
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

  /** Đá thành viên khỏi phòng (độc quyền Host) */
  const kickRoomMember = useCallback(
    async (roomId: UUID, memberUserId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.kickMember(roomId, memberUserId);

        // Cập nhật lại danh sách thành viên trong state phòng hiện tại
        if (currentRoom && currentRoom.id === roomId && Array.isArray(currentRoom.members)) {
          const updatedMembers = currentRoom.members.filter((m) => m.id !== memberUserId);
          setCurrentRoom({ ...currentRoom, members: updatedMembers });
        }

        useUIStore.getState().showToast('info', 'Đã xóa thành viên khỏi phòng ăn.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xóa thành viên khỏi phòng.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentRoom, setCurrentRoom],
  );

  /** Rời khỏi phòng ăn hiện tại */
  const leaveCurrentRoom = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.leaveRoom(roomId);
        setCurrentRoom(null);
        setActiveRooms(activeRooms.filter((r) => r.id !== roomId));
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
    [activeRooms, setActiveRooms, setCurrentRoom],
  );

  /** Đóng phòng ăn (độc quyền Host) */
  const closeCurrentRoom = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.closeRoom(roomId);
        updateCurrentRoomStatus(RoomStatus.CLOSED);
        useUIStore.getState().showToast('info', 'Đã đóng phòng ăn thành công.');
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

  /** Xóa hoàn toàn phòng ăn (độc quyền Host) */
  const deleteCurrentRoom = useCallback(
    async (roomId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await roomService.deleteRoom(roomId);
        setCurrentRoom(null);
        setActiveRooms(activeRooms.filter((r) => r.id !== roomId));
        useUIStore.getState().showToast('info', 'Đã xóa phòng ăn.');
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
    clearError,
  };
}

export default useRoomActions;
