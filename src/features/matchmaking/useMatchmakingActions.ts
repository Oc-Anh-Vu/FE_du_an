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

      // Khởi tạo các tag tạm thời đã có trong store của người dùng
      const existingMyTags = useUserStore.getState().myTags;
      const temporaryTagIds = existingMyTags
        .filter((userTag) => userTag.temporary)
        .map((userTag) => userTag.tag.id)
        .slice(0, MAX_MOOD_TAGS);

      if (temporaryTagIds.length > 0) {
        setSelectedTagIds(temporaryTagIds);
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải danh sách tag tâm trạng từ hệ thống.');
      setError(message);
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  /** Chọn hoặc bỏ chọn tag tâm trạng (tối đa 2 tag) */
  const toggleMoodTag = useCallback((tagId: UUID) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }

      if (prev.length >= MAX_MOOD_TAGS) {
        useUIStore
          .getState()
          .showToast('warning', `Bạn chỉ được chọn tối đa ${MAX_MOOD_TAGS} tag tâm trạng!`);
        return prev;
      }

      return [...prev, tagId];
    });
  }, []);

  /** Lưu các tag tâm trạng tạm thời đã chọn lên server và cập nhật userStore */
  const submitTemporaryMoodTags = useCallback(async (): Promise<boolean> => {
    if (selectedTagIds.length === 0) {
      useUIStore.getState().showToast('warning', 'Vui lòng chọn ít nhất 1 tag tâm trạng hôm nay.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Dọn dẹp các tag tạm thời cũ không còn nằm trong danh sách chọn
      const currentMyTags = useUserStore.getState().myTags;
      const oldTemporaryTags = currentMyTags.filter(
        (ut) => ut.temporary && !selectedTagIds.includes(ut.tag.id),
      );

      for (const oldTag of oldTemporaryTags) {
        try {
          await tagService.removeUserTag(oldTag.tag.id);
          useUserStore.getState().removeMyTag(oldTag.tag.id);
        } catch {
          // Bỏ qua nếu tag đã được dọn trước đó
        }
      }

      // 2. Lưu từng tag tạm thời (temporary = true)
      for (const tagId of selectedTagIds) {
        const savedUserTag = await tagService.addUserTag(tagId, true);
        useUserStore.getState().upsertMyTag(savedUserTag);
      }

      // 3. Đồng bộ lại toàn bộ tags người dùng
      try {
        const refreshedUserTags = await tagService.getUserTags();
        useUserStore.getState().setMyTags(refreshedUserTags);
      } catch {
        // Bỏ qua nếu việc tải lại nền thất bại
      }

      useUIStore.getState().showToast('success', 'Đã lưu tâm trạng ăn uống hôm nay!');
      return true;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể lưu tag tâm trạng. Vui lòng thử lại.');
      setError(message);
      useUIStore.getState().showToast('danger', message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTagIds]);

  const clearSelection = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  /** Bắt đầu quét radar hoặc đưa vào hàng đợi Redis */
  const startMatchmaking = useCallback(
    async (request: MatchmakingRequest): Promise<MatchmakingStatusResponse | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const res = await matchmakingService.findOrQueueMatch(request);
        setMatchmakingStatus(res);
        setIsQueueing(res.status === 'WAITING');
        if (res.status === 'MATCHED') {
          useUIStore.getState().showToast('success', 'Đã tìm thấy phòng ghép phù hợp!');
        }
        return res;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể bắt đầu ghép phòng lúc này.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  /** Lấy trạng thái ghép mới nhất từ Backend (1 lần) */
  const pollMatchStatus = useCallback(async (): Promise<MatchmakingStatusResponse | null> => {
    if (isPollingInFlightRef.current) {
      return null;
    }
    isPollingInFlightRef.current = true;
    try {
      const res = await matchmakingService.getMatchStatus();
      setMatchmakingStatus(res);

      if (res.status === 'MATCHED') {
        setIsQueueing(false);
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
        setIsPolling(false);
        useUIStore.getState().showToast('success', 'Đã tìm thấy phòng ghép!');
        if (onMatchedRef.current && res.roomCode) {
          onMatchedRef.current(res.roomCode, res.roomId ?? undefined);
        }
      } else if (res.status === 'CANCELLED' || res.status === 'TIMEOUT') {
        setIsQueueing(false);
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
        setIsPolling(false);
      } else {
        setIsQueueing(true);
      }
      return res;
    } catch (err) {
      // Polling thất bại không ném lỗi lớn gây sập UI
      const message = getErrorMessage(err, 'Lỗi kiểm tra trạng thái hàng đợi.');
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

  /** Bắt đầu Polling định kỳ kiểm tra trạng thái ghép phòng */
  const startPollingStatus = useCallback(
    (
      onMatched?: (roomCode: string, roomId?: string) => void,
      intervalMs: number = DEFAULT_POLL_INTERVAL_MS,
    ) => {
      onMatchedRef.current = onMatched;
      stopPollingStatus();
      setIsPolling(true);

      // Gọi ngay lượt đầu
      void pollMatchStatus();

      // Thiết lập chu kỳ Polling
      pollingTimerRef.current = setInterval(() => {
        void pollMatchStatus();
      }, intervalMs);
    },
    [pollMatchStatus, stopPollingStatus],
  );

  /** Hủy tìm kiếm ghép phòng */
  const cancelMatchmaking = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    stopPollingStatus();
    try {
      await matchmakingService.cancelMatch();
      setMatchmakingStatus(null);
      setIsQueueing(false);
      useUIStore.getState().showToast('info', 'Đã hủy tìm kiếm ghép phòng.');
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
    clearMatchmakingState,
  };
}

export default useMatchmakingActions;
