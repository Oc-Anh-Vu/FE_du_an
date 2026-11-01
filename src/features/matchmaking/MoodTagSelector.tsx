import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, EmptyState, Spinner, Tag } from "../../components/ui";
import { normalizeApiError } from "../../services/apiClient";
import { addUserTag, getAllTags, getUserTags } from "../../services/tag.service";
import { useUserStore } from "../../store/userStore";
import type { TagResponse, UserTagResponse, UUID } from "../../types";

export interface MoodTagSelectorProps {
  onSelectionSaved?: (tags: UserTagResponse[]) => void;
}

export default function MoodTagSelector({ onSelectionSaved }: MoodTagSelectorProps) {
  const myTags = useUserStore((state) => state.myTags);
  const setMyTags = useUserStore((state) => state.setMyTags);
  const upsertMyTag = useUserStore((state) => state.upsertMyTag);
  const [availableTags, setAvailableTags] = useState<TagResponse[]>([]);
  const [userTags, setUserTags] = useState<UserTagResponse[]>(myTags);
  const [selectedTagIds, setSelectedTagIds] = useState<UUID[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getAllTags(), getUserTags()])
      .then(([tags, currentUserTags]) => {
        if (!active) return;
        setAvailableTags(tags);
        setUserTags(currentUserTags);
        setSelectedTagIds(
          currentUserTags.filter((userTag) => userTag.temporary).map((userTag) => userTag.tag.id),
        );
        setMyTags(currentUserTags);
      })
      .catch((requestError: unknown) => {
        if (active) setError(normalizeApiError(requestError).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadAttempt, setMyTags]);

  const userTagsById = useMemo(
    () => new Map(userTags.map((userTag) => [userTag.tag.id, userTag])),
    [userTags],
  );
  const hasUnsavedSelection = selectedTagIds.some(
    (tagId) => !userTagsById.get(tagId)?.temporary,
  );

  const toggleTag = useCallback((tagId: UUID) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((selectedId) => selectedId !== tagId)
        : [...current, tagId],
    );
    setError(null);
  }, []);

  async function saveSelection() {
    if (saving || !hasUnsavedSelection) return;

    setSaving(true);
    setError(null);
    let updatedUserTags = [...userTags];

    try {
      for (const tagId of selectedTagIds) {
        const existing = updatedUserTags.find((userTag) => userTag.tag.id === tagId);
        if (existing?.temporary) continue;
        if (existing) {
          throw new Error(
            `Tag "${existing.tag.tagName}" đang là sở thích cố định và không thể đổi thành tag tạm thời ở đây.`,
          );
        }

        const savedTag = await addUserTag(tagId, true);
        updatedUserTags = [
          ...updatedUserTags.filter((userTag) => userTag.tag.id !== tagId),
          savedTag,
        ];
        setUserTags(updatedUserTags);
        upsertMyTag(savedTag);
      }

      setMyTags(updatedUserTags);
      onSelectionSaved?.(updatedUserTags.filter((userTag) => userTag.temporary));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-8" aria-live="polite">
        <Spinner />
        <span className="text-body-sm text-muted-foreground">Đang tải tag tâm trạng...</span>
      </div>
    );
  }

  if (error && availableTags.length === 0) {
    return (
      <Alert
        variant="danger"
        title="Không tải được tag tâm trạng"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Thử lại
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const selectableTags = availableTags.filter(
    (tag) => userTagsById.get(tag.id)?.temporary !== false,
  );
  const fixedPreferenceCount = availableTags.length - selectableTags.length;
  const savedTemporaryCount = userTags.filter((userTag) => userTag.temporary).length;

  return (
    <Card
      title="Chọn tag tâm trạng"
      description="Các tag được lưu dưới dạng tạm thời bằng API tag hiện có. Điều này chưa tham gia hàng đợi ghép hội."
    >
      <div className="space-y-5">
        {error && (
          <Alert variant="danger" title="Không lưu được toàn bộ lựa chọn">
            {error} Các tag đã lưu thành công trước đó vẫn được giữ lại.
          </Alert>
        )}

        {availableTags.length === 0 ? (
          <EmptyState
            size="sm"
            title="Chưa có tag tâm trạng"
            description="Hiện hệ thống chưa trả về tag nào để chọn."
          />
        ) : (
          <div className="flex flex-wrap gap-2" aria-label="Danh sách tag tâm trạng">
            {availableTags.map((tag) => {
              const existingUserTag = userTagsById.get(tag.id);
              const isFixedPreference = existingUserTag?.temporary === false;
              const isAlreadyTemporary = existingUserTag?.temporary === true;
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <Tag
                  key={tag.id}
                  label={tag.tagName}
                  selected={isSelected}
                  disabled={saving || isFixedPreference || isAlreadyTemporary}
                  aria-label={
                    isFixedPreference
                      ? `${tag.tagName}, sở thích cố định`
                      : isAlreadyTemporary
                        ? `${tag.tagName}, đã lưu dưới dạng tạm thời`
                      : `${tag.tagName}${isSelected ? ", đã chọn" : ""}`
                  }
                  onClick={() => toggleTag(tag.id)}
                />
              );
            })}
          </div>
        )}

        {fixedPreferenceCount > 0 && (
          <p className="text-caption text-muted-foreground">
            {fixedPreferenceCount} tag sở thích cố định không thể đổi sang tạm thời tại đây để tránh
            thay đổi cài đặt sở thích hiện có.
          </p>
        )}
        {savedTemporaryCount > 0 && (
          <p className="text-caption text-muted-foreground">
            Các tag tạm thời đã lưu được giữ nguyên; chưa có quy tắc Backend xác nhận để kết thúc
            hoặc xóa chúng khi hủy ghép.
          </p>
        )}

        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          Đã chọn {selectedTagIds.length} tag tạm thời.
        </p>

        <Button
          fullWidth
          loading={saving}
          loadingText="Đang lưu tag..."
          disabled={!hasUnsavedSelection || selectedTagIds.length === 0}
          onClick={() => void saveSelection()}
        >
          {hasUnsavedSelection ? "Lưu tag tâm trạng" : "Tag tâm trạng đã được lưu"}
        </Button>
      </div>
    </Card>
  );
}
