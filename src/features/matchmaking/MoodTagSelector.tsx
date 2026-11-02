import type { TagResponse, UUID } from '../../types';
import { Tag } from '../../components/ui/form/Tag';
import { Button } from '../../components/ui/form/Button';
import { Badge } from '../../components/ui/display/Badge';
import { Alert } from '../../components/ui/feedback/Alert';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Sparkles, Utensils } from 'lucide-react';

export interface MoodTagSelectorProps {
  tags?: TagResponse[];
  selectedTagIds?: UUID[];
  onToggleTag?: (tagId: UUID) => void;
  onConfirmClick?: () => void | Promise<void>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onRetry?: () => void;
  maxTags?: number;
}

export default function MoodTagSelector({
  tags = [],
  selectedTagIds = [],
  onToggleTag,
  onConfirmClick,
  isLoading = false,
  isSubmitting = false,
  error = null,
  onRetry,
  maxTags = 2,
}: MoodTagSelectorProps) {
  const selectedCount = selectedTagIds.length;
  const isMaxReached = selectedCount >= maxTags;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12" aria-live="polite">
        <Spinner size="lg" label="Đang tải danh sách tag tâm trạng..." />
      </div>
    );
  }

  if (error && tags.length === 0) {
    return (
      <Alert
        variant="danger"
        title="Không thể tải danh sách tag"
        action={
          onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          )
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-heading-sm font-bold text-foreground">
            <Utensils size={20} className="text-primary" />
            Hôm nay bạn muốn ăn gì?
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Chọn tối đa {maxTags} hương vị hoặc tâm trạng để hệ thống gợi ý và ghép hội phù hợp.
          </p>
        </div>

        <Badge
          variant={isMaxReached ? 'success' : selectedCount > 0 ? 'info' : 'default'}
          size="md"
        >
          {selectedCount}/{maxTags} đã chọn
        </Badge>
      </header>

      {error && (
        <Alert variant="danger" title="Lỗi">
          {error}
        </Alert>
      )}

      {tags.length === 0 ? (
        <EmptyState
          title="Chưa có tag tâm trạng nào"
          description="Hệ thống đang cập nhật danh mục tag. Vui lòng quay lại sau."
          size="sm"
        />
      ) : (
        <div
          className="flex flex-wrap gap-2.5"
          role="group"
          aria-label="Danh sách tag tâm trạng ăn uống"
        >
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);

            return (
              <Tag
                key={tag.id}
                label={tag.tagName}
                selected={isSelected}
                onClick={() => onToggleTag?.(tag.id)}
                aria-pressed={isSelected}
              />
            );
          })}
        </div>
      )}

      <footer className="pt-2">
        <Button
          fullWidth
          size="lg"
          variant="primary"
          leftIcon={<Sparkles aria-hidden="true" size={18} />}
          disabled={selectedCount === 0 || isSubmitting}
          loading={isSubmitting}
          loadingText="Đang lưu tâm trạng..."
          onClick={() => void onConfirmClick?.()}
        >
          {selectedCount === 0
            ? 'Vui lòng chọn ít nhất 1 tag'
            : 'Xác nhận tâm trạng & Tìm hội quẹt thẻ'}
        </Button>
      </footer>
    </div>
  );
}
