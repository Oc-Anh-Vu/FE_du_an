import { useCallback, useMemo, useState } from 'react';
import type {
  MatchFoundSocketData,
  PlaceResponse,
  RoomPlaceResultResponse,
  RoomResponse,
  RoomSocketEvent,
  SwipeActionSocketData,
  UUID,
  UserSwipeHistoryItem,
} from '../../types';
import { ApiErrorCode, RoomStatus } from '../../types';
import { roomService } from '../../services/room.service';
import { swipeService } from '../../services/swipe.service';
import { useRoomStore } from '../../store/roomStore';
import { useUIStore } from '../../store/uiStore';
import { isRoomAccessError } from '../room/roomAccess';

export interface SwipeReactionEvent {
  userId: string;
  username: string;
  direction: 'RIGHT' | 'LEFT';
}

export interface UseSwipeActionsReturn {
  roomDeck: PlaceResponse[];
  mySwipes: UserSwipeHistoryItem[];
  remainingDeck: PlaceResponse[];
  swipeResults: RoomPlaceResultResponse[];
  currentRoom: RoomResponse | null;
  progressPercentage: number;
  lastSwipeReaction: SwipeReactionEvent | null;
  isInitializing: boolean;
  isSwiping: boolean;
  isSelectingPlace: boolean;
  error: string | null;
  initializeSwipeSession: (roomId: UUID, signal?: AbortSignal) => Promise<void>;
  submitSwipeDecision: (roomId: UUID, place: PlaceResponse, liked: boolean) => Promise<boolean>;
  fetchRoomResults: (roomId: UUID) => Promise<RoomPlaceResultResponse[]>;
  hostSelectWinningPlace: (roomId: UUID, placeId: UUID) => Promise<boolean>;
  handleSwipeSocketEvent: (event: RoomSocketEvent) => void;
  clearError: () => void;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error && typeof error === 'object') {
    const err = error as { code?: number; message?: string; status?: number };
    if (err.code === ApiErrorCode.CANNOT_CHANGE_PLACE_AFTER_EXPENSE) {
      return 'Phòng ăn đã phát sinh hóa đơn chi phí, không thể thay đổi quán ăn đã chốt.';
    }
    if (err.code === ApiErrorCode.ALREADY_SWIPED) {
      return 'Bạn đã quẹt thẻ cho địa điểm này rồi.';
    }
    if (err.code === ApiErrorCode.ROOM_NOT_FOUND) {
      return 'Không tìm thấy phòng ăn.';
    }
    if (err.code === ApiErrorCode.NOT_ROOM_MEMBER) {
      return 'Bạn không phải là thành viên của phòng ăn này.';
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

export function useSwipeActions(onAccessLost?: (message: string) => void): UseSwipeActionsReturn {
  const roomDeck = useRoomStore((state) => state.roomDeck);
  const mySwipes = useRoomStore((state) => state.mySwipes);
  const swipeResults = useRoomStore((state) => state.swipeResults);
  const currentRoom = useRoomStore((state) => state.currentRoom);

  const setRoomDeck = useRoomStore((state) => state.setRoomDeck);
  const setMySwipes = useRoomStore((state) => state.setMySwipes);
  const addMySwipe = useRoomStore((state) => state.addMySwipe);
  const setSwipeResults = useRoomStore((state) => state.setSwipeResults);
  const setCurrentRoom = useRoomStore((state) => state.setCurrentRoom);

  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [isSelectingPlace, setIsSelectingPlace] = useState<boolean>(false);
  const [lastSwipeReaction, setLastSwipeReaction] = useState<SwipeReactionEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Mảng các ID quán đã quẹt */
  const swipedPlaceIds = useMemo(
    () => new Set(mySwipes.map((swipe) => swipe.placeId)),
    [mySwipes],
  );

  /** Bộ bài còn lại cần quẹt */
  const remainingDeck = useMemo(
    () => roomDeck.filter((place) => !swipedPlaceIds.has(place.id)),
    [roomDeck, swipedPlaceIds],
  );

  /** Phần trăm tiến độ hoàn thành bộ bài của người dùng */
  const progressPercentage = useMemo(() => {
    if (roomDeck.length === 0) return 0;
    const swipedCount = roomDeck.length - remainingDeck.length;
    return Math.min(100, Math.round((swipedCount / roomDeck.length) * 100));
  }, [roomDeck.length, remainingDeck.length]);

  /** Khởi tạo phiên quẹt: tải bộ bài (tự tạo nếu trống) + lịch sử quẹt của người dùng */
  const initializeSwipeSession = useCallback(
    async (roomId: UUID, signal?: AbortSignal): Promise<void> => {
      if (signal?.aborted) return;
      setIsInitializing(true);
      setError(null);
      try {
        const roomDetails = await roomService.getRoomDetails(roomId);
        if (signal?.aborted) return;
        let deck = await roomService.getRoomDeck(roomId);
        if (signal?.aborted) return;
        if (!deck || deck.length === 0) {
          deck = await roomService.generateDeck(roomId);
          if (signal?.aborted) return;
        }
        const myHistory = await swipeService.getMySwipesInRoom(roomId);
        if (signal?.aborted) return;

        // Chỉ ghi dữ liệu khi toàn bộ lượt tải vẫn thuộc phiên đang hoạt động.
        setCurrentRoom(roomDetails);
        setRoomDeck(deck);
        setMySwipes(myHistory);
      } catch (err) {
        if (signal?.aborted) return;
        const message = getErrorMessage(err, 'Không thể tải bộ bài phòng ăn.');
        if (isRoomAccessError(err) && onAccessLost) {
          onAccessLost(message);
          return;
        }
        setError(message);
      } finally {
        if (!signal?.aborted) setIsInitializing(false);
      }
    },
    [setCurrentRoom, setMySwipes, setRoomDeck, onAccessLost],
  );

  /** Gửi quyết định quẹt thích/không thích một quán ăn */
  const submitSwipeDecision = useCallback(
    async (roomId: UUID, place: PlaceResponse, liked: boolean): Promise<boolean> => {
      setIsSwiping(true);
      setError(null);

      // Thêm ngay vào state tạm để chuyển sang thẻ bài tiếp theo
      addMySwipe({
        placeId: place.id,
        placeName: place.name,
        liked,
      });

      try {
        await swipeService.swipe({
          roomId,
          placeId: place.id,
          liked,
        });

        return true;
      } catch (err) {
        const errObj = err as { code?: number } | undefined;
        if (errObj?.code === ApiErrorCode.ALREADY_SWIPED) {
          return true;
        }

        const message = getErrorMessage(err, 'Không thể ghi nhận lượt quẹt thẻ.');
        if (isRoomAccessError(err) && onAccessLost) {
          onAccessLost(message);
          return false;
        }
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsSwiping(false);
      }
    },
    [addMySwipe, onAccessLost],
  );

  /** Lấy bảng xếp hạng kết quả bình chọn của phòng */
  const fetchRoomResults = useCallback(
    async (roomId: UUID): Promise<RoomPlaceResultResponse[]> => {
      try {
        const [results, roomDetails] = await Promise.all([
          swipeService.getRoomSwipeResults(roomId),
          roomService.getRoomDetails(roomId).catch(() => null),
        ]);

        const validResults = Array.isArray(results) ? results : [];
        setSwipeResults(validResults);
        if (roomDetails) {
          setCurrentRoom(roomDetails);
        }
        return validResults;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tải kết quả bình chọn.');
        setError(message);
        return [];
      }
    },
    [setCurrentRoom, setSwipeResults],
  );

  /** Chủ phòng chốt quán chiến thắng */
  const hostSelectWinningPlace = useCallback(
    async (roomId: UUID, placeId: UUID): Promise<boolean> => {
      setIsSelectingPlace(true);
      setError(null);
      try {
        const updatedRoom = await roomService.selectPlace(roomId, { placeId });
        setCurrentRoom(updatedRoom);
        useUIStore.getState().showToast('success', 'Đã chốt quán ăn thành công!');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể chốt quán ăn lúc này.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsSelectingPlace(false);
      }
    },
    [setCurrentRoom],
  );

  /** Xử lý sự kiện nhận được từ WebSocket STOMP */
  const handleSwipeSocketEvent = useCallback((event: RoomSocketEvent) => {
    if (!event || !event.type) return;

    switch (event.type) {
      case 'SWIPE_ACTION': {
        const data = event.data as SwipeActionSocketData;
        if (data && data.direction) {
          setLastSwipeReaction({
            userId: data.userId,
            username: data.username || 'Một thành viên',
            direction: data.direction,
          });
        }
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
    roomDeck,
    mySwipes,
    remainingDeck,
    swipeResults,
    currentRoom,
    progressPercentage,
    lastSwipeReaction,
    isInitializing,
    isSwiping,
    isSelectingPlace,
    error,
    initializeSwipeSession,
    submitSwipeDecision,
    fetchRoomResults,
    hostSelectWinningPlace,
    handleSwipeSocketEvent,
    clearError,
  };
}

export default useSwipeActions;
