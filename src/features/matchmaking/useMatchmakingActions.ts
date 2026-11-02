import { useCallback, useState } from 'react';
import type { TagResponse, UUID } from '../../types';
import { tagService } from '../../services/tag.service';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';

const MAX_MOOD_TAGS = 2;

export interface UseMatchmakingActionsReturn {
  systemTags: TagResponse[];
  selectedTagIds: UUID[];
  isLoadingTags: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchSystemTags: () => Promise<void>;
  toggleMoodTag: (tagId: UUID) => void;
  submitTemporaryMoodTags: () => Promise<boolean>;
  clearSelection: () => void;
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
  const [systemTags, setSystemTags] = useState<TagResponse[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<UUID[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      // Lưu từng tag tạm thời (temporary = true)
      for (const tagId of selectedTagIds) {
        const savedUserTag = await tagService.addUserTag(tagId, true);
        useUserStore.getState().upsertMyTag(savedUserTag);
      }

      // Đồng bộ lại toàn bộ tags người dùng
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
  };
}

export default useMatchmakingActions;
