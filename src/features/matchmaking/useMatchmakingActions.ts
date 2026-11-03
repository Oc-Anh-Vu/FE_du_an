// Hook xử lý nghiệp vụ Ghép Hội & Phòng Công Khai
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  MatchmakingRequest,
  MatchmakingStatusResponse,
  PublicRoomResponse,
  TagResponse,
  UUID,
} from '../../types';
import { matchmakingService } from '../../services/matchmaking.service';
import { tagService } from '../../services/tag.service';
import { useUIStore } from '../../store/uiStore';
import { useUserStore } from '../../store/userStore';

const MAX_MOOD_TAGS = 2;
const DEFAULT_POLL_INTERVAL_MS = 3000;

export interface UseMatchmakingActionsReturn {
  // Quản lý Tags tâm trạng
  systemTags: TagResponse[];
  selectedTagIds: UUID[];
  isLoadingTags: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchSystemTags: () => Promise<void>;
  toggleMoodTag: (tagId: UUID) => void;
  submitTemporaryMoodTags: () => Promise<boolean>;
  clearSelection: () => void;

  // Quản lý Ghép hội Radar
  matchmakingStatus: MatchmakingStatusResponse | null;
  isQueueing: boolean;
  isPolling: boolean;
  publicRooms: PublicRoomResponse[];
  isLoadingPublicRooms: boolean;
  startMatchmaking: (request: MatchmakingRequest) => Promise<MatchmakingStatusResponse | null>;
  pollMatchStatus: () => Promise<MatchmakingStatusResponse | null>;
  startPollingStatus: (
    onMatched?: (roomCode: string, roomId?: string) => void,
    intervalMs?: number,
  ) => void;
  stopPollingStatus: () => void;
  cancelMatchmaking: () => Promise<boolean>;
  fetchNearbyPublicRooms: (
    latitude: number,
    longitude: number,
    radius?: number,
  ) => Promise<PublicRoomResponse[]>;
  handleMatchmakingSocketEvent: (payload: MatchmakingStatusResponse) => void;
  clearMatchmakingState: () => void;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: string }).message;
    if (msg) return msg;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}

export function useMatchmakingActions(): UseMatchmakingActionsReturn {
  // State: Tags tâm trạng
  const [systemTags, setSystemTags] = useState<TagResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<UUID[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State: Ghép hội Radar & Phòng công khai
  const [matchmakingStatus, setMatchmakingStatus] = useState<MatchmakingStatusResponse | null>(null);
  const [isQueueing, setIsQueueing] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoomResponse[]>([]);
  const [isLoadingPublicRooms, setIsLoadingPublicRooms] = useState<boolean>(false);

  // Refs điều phối Polling
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingInFlightRef = useRef(false);
  const onMatchedRef = useRef<((roomCode: string, roomId?: string) => void) | undefined>(undefined);

  // Dọn dẹp Polling timer khi unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  /** Lấy danh sách tags hệ thống và khởi tạo tag tâm trạng đã chọn nếu có */
  const fetchSystemTags = useCallback(async () => {
    setIsLoadingTags(true);
    setError(null);
    try {
      const tags = await tagService.getAllTags();
      setSystemTags(Array.isArray(tags) ? tags : []);

      // Đọc các tag tạm thời hiện tại của user
      const myTags = useUserStore.getState().myTags;
      const temporaryTagIds = myTags.filter((t) => t.temporary).map((t) => t.tag.id);
      setSelectedTagIds(temporaryTagIds.slice(0, MAX_MOOD_TAGS));
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải danh sách sở thích ẩm thực.');
      setError(message);
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  /** Chọn hoặc bỏ chọn một tag tâm trạng (tối đa 2 tag) */
  const toggleMoodTag = useCallback(
    (tagId: UUID) => {
      if (selectedTagIds.includes(tagId)) {
        setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
        return;
      }
      if (selectedTagIds.length >= MAX_MOOD_TAGS) {
        useUIStore.getState().showToast('warning', `Bạn chỉ có thể chọn tối đa ${MAX_MOOD_TAGS} tâm trạng ẩm thực.`);
        return;
      }
      setSelectedTagIds((prev) => [...prev, tagId]);
    },
    [selectedTagIds],
  );

  /** Xóa toàn bộ lựa chọn */
  const clearSelection = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  /** Gửi các tag tâm trạng đã chọn lên server dưới dạng tag tạm thời */
  const submitTemporaryMoodTags = useCallback(async (): Promise<boolean> => {
    if (selectedTagIds.length === 0) {
      useUIStore.getState().showToast('warning', 'Vui lòng chọn ít nhất 1 tâm trạng ẩm thực hôm nay.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Gắn lần lượt các tag đã chọn với temporary=true
      for (const tagId of selectedTagIds) {
        await tagService.addUserTag(tagId, true);
      }

      // Cập nhật lại store
      const updatedTags = await tagService.getMyTags();
      useUserStore.getState().setMyTags(updatedTags);

      useUIStore.getState().showToast('success', 'Đã cập nhật tâm trạng ăn uống hôm nay!');
      return true;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể lưu tâm trạng ẩm thực.');
      setError(message);
      useUIStore.getState().showToast('danger', message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTagIds]);

  /** Đưa người dùng vào hàng đợi Radar tìm phòng ghép */
  const startMatchmaking = useCallback(
    async (request: MatchmakingRequest): Promise<MatchmakingStatusResponse | null> => {
      setIsQueueing(true);
      setError(null);
      try {
        // Hủy bỏ bất kỳ trạng thái/kết quả ghép cũ còn sót lại trong Redis trước khi tạo yêu cầu mới
        try {
          await matchmakingService.cancelMatch();
        } catch {
          // Bỏ qua nếu không có phiên ghép trước đó
        }
        const response = await matchmakingService.findOrQueueMatch(request);
        setMatchmakingStatus(response);
        return response;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tham gia hàng đợi ghép phòng lúc này.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        setIsQueueing(false);
        return null;
      }
    },
    [],
  );

  /** Kiểm tra một lần trạng thái hàng đợi */
  const pollMatchStatus = useCallback(async (): Promise<MatchmakingStatusResponse | null> => {
    if (isPollingInFlightRef.current) return null;
    isPollingInFlightRef.current = true;
    try {
      const status = await matchmakingService.getMatchStatus();
      setMatchmakingStatus(status);
      setError(null);
      return status;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể kiểm tra trạng thái hàng đợi ghép phòng.');
      setError(message);
      return null;
    } finally {
      isPollingInFlightRef.current = false;
    }
  }, []);

  /** Dừng Polling */
  const stopPollingStatus = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /** Bắt đầu Polling định kỳ kiểm tra trạng thái hàng đợi */
  const startPollingStatus = useCallback(
    (onMatched?: (roomCode: string, roomId?: string) => void, intervalMs = DEFAULT_POLL_INTERVAL_MS) => {
      stopPollingStatus();
      onMatchedRef.current = onMatched;
      setIsPolling(true);

      const check = async () => {
        const result = await pollMatchStatus();
        if (result && result.status === 'MATCHED') {
          stopPollingStatus();
          setIsQueueing(false);
          if (onMatchedRef.current && result.roomCode) {
            onMatchedRef.current(result.roomCode, result.roomId ?? undefined);
          }
        }
      };

      // Chạy ngay lượt đầu
      void check();
      // Khởi tạo interval
      pollingTimerRef.current = setInterval(() => {
        void check();
      }, intervalMs);
    },
    [pollMatchStatus, stopPollingStatus],
  );

  /** Hủy tìm kiếm và rút khỏi hàng đợi */
  const cancelMatchmaking = useCallback(async (): Promise<boolean> => {
    stopPollingStatus();
    setIsSubmitting(true);
    setError(null);
    try {
      await matchmakingService.cancelMatch();
      setMatchmakingStatus(null);
      setIsQueueing(false);
      return true;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể hủy ghép phòng lúc này.');
      setError(message);
      useUIStore.getState().showToast('danger', message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [stopPollingStatus]);

  /** Nạp danh sách phòng công khai lân cận */
  const fetchNearbyPublicRooms = useCallback(
    async (
      latitude: number,
      longitude: number,
      radius?: number,
    ): Promise<PublicRoomResponse[]> => {
      setIsLoadingPublicRooms(true);
      try {
        const rooms = await matchmakingService.getNearbyPublicRooms(latitude, longitude, radius);
        const safeRooms = Array.isArray(rooms) ? rooms : [];
        setPublicRooms(safeRooms);
        return safeRooms;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tải danh sách phòng công khai.');
        setError(message);
        return [];
      } finally {
        setIsLoadingPublicRooms(false);
      }
    },
    [],
  );

  /** Tiếp nhận sự kiện gói tin từ WebSocket STOMP */
  const handleMatchmakingSocketEvent = useCallback(
    (payload: MatchmakingStatusResponse) => {
      if (!payload) return;
      setMatchmakingStatus(payload);
      if (payload.status === 'MATCHED') {
        stopPollingStatus();
        setIsQueueing(false);
        if (onMatchedRef.current && payload.roomCode) {
          onMatchedRef.current(payload.roomCode, payload.roomId ?? undefined);
        }
      }
    },
    [stopPollingStatus],
  );

  /** Làm sạch toàn bộ trạng thái matchmaking */
  const clearMatchmakingState = useCallback(() => {
    stopPollingStatus();
    setMatchmakingStatus(null);
    setIsQueueing(false);
    setPublicRooms([]);
    setError(null);
  }, [stopPollingStatus]);

  return {
    systemTags,
    selectedTagIds,
    isLoadingTags,
    isSubmitting,
    error,
    fetchSystemTags,
    toggleMoodTag,
    submitTemporaryMoodTags,
    clearSelection,
    matchmakingStatus,
    isQueueing,
    isPolling,
    publicRooms,
    isLoadingPublicRooms,
    startMatchmaking,
    pollMatchStatus,
    startPollingStatus,
    stopPollingStatus,
    cancelMatchmaking,
    fetchNearbyPublicRooms,
    handleMatchmakingSocketEvent,
    clearMatchmakingState,
  };
}

export default useMatchmakingActions;
