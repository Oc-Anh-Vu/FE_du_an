import { useEffect } from 'react';
import { CheckCircle2, Eye, Sparkles } from 'lucide-react';
import type { PlaceResponse } from '../../types';
import { ProgressBar } from '../../components/ui/feedback/ProgressBar';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button } from '../../components/ui/form/Button';
import SwipeCardItem from './SwipeCardItem';

export interface GroupSwipeDeckProps {
  roomId: string;
  deck: PlaceResponse[];
  remainingDeck: PlaceResponse[];
  progressPercentage: number;
  matchedPlace?: PlaceResponse | null;
  isLoading?: boolean;
  isSwiping?: boolean;
  error?: string | null;
  onSwipe: (place: PlaceResponse, liked: boolean) => Promise<boolean | void>;
  onViewResultsClick?: () => void;
  onRetry?: () => void;
}

export default function GroupSwipeDeck({
  remainingDeck,
  progressPercentage,
  matchedPlace,
  isLoading = false,
  isSwiping = false,
  error = null,
  onSwipe,
  onViewResultsClick,
  onRetry,
}: GroupSwipeDeckProps) {
  const currentPlace = remainingDeck[0] ?? null;

  // Lắng nghe phím mũi tên bàn phím (ArrowLeft = Bỏ qua, ArrowRight = Thích)
  useEffect(() => {
    if (!currentPlace || isSwiping) return;

    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement;

      if (isInput) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        void onSwipe(currentPlace, false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        void onSwipe(currentPlace, true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPlace, isSwiping, onSwipe]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16" aria-live="polite">
        <Spinner size="lg" label="Đang chuẩn bị bộ bài quẹt thẻ..." />
      </div>
    );
  }

  if (error && remainingDeck.length === 0) {
    return (
      <Alert
        variant="danger"
        title="Không thể tải bộ bài"
        action={
          onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          ) : undefined
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <section aria-label="Bộ bài quẹt thẻ nhóm" className="w-full space-y-6">
      {/* Thanh tiến độ */}
      <div className="rounded-card border border-border bg-card p-4 shadow-card">
        <ProgressBar
          value={progressPercentage}
          showPercentage
          animated
          tone={progressPercentage === 100 ? 'success' : 'primary'}
          label="Tiến độ quẹt của bạn"
        />
      </div>

      {error && (
        <Alert variant="danger" title="Lỗi ghi nhận">
          {error}
        </Alert>
      )}

      {/* Thông báo nếu đã có quán trúng khớp */}
      {matchedPlace && (
        <Alert
          variant="success"
          title="Đã có kết quả trùng khớp!"
          action={
            onViewResultsClick && (
              <Button size="sm" variant="primary" onClick={onViewResultsClick}>
                Xem kết quả ngay
              </Button>
            )
          }
        >
          Cả nhóm đã cùng thích quán <strong>{matchedPlace.name}</strong>!
        </Alert>
      )}

      {/* Thẻ quẹt hiện tại hoặc trạng thái chờ hoàn tất */}
      {currentPlace ? (
        <div className="space-y-3">
          <SwipeCardItem
            key={currentPlace.id}
            place={currentPlace}
            onSwipeLeft={async (p) => {
              await onSwipe(p, false);
            }}
            onSwipeRight={async (p) => {
              await onSwipe(p, true);
            }}
            disabled={isSwiping}
          />
          <p className="text-center text-caption font-semibold text-muted-foreground">
            Còn {remainingDeck.length} quán nữa trong bộ bài
          </p>
        </div>
      ) : (
        <div className="rounded-card border border-border bg-card p-8 text-center shadow-card space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 size={36} />
          </div>

          <h3 className="text-heading font-bold text-foreground">
            Bạn đã quẹt hết các quán!
          </h3>
          <p className="mx-auto max-w-md text-body-sm text-muted-foreground">
            Lượt bình chọn của bạn đã được lưu. Đang chờ các thành viên khác hoàn thành bộ bài để tổng hợp kết quả cuối cùng.
          </p>

          {onViewResultsClick && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Eye aria-hidden="true" size={18} />}
                onClick={onViewResultsClick}
              >
                Xem bảng xếp hạng kết quả
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Phím tắt / Hướng dẫn */}
      {currentPlace && (
        <div className="flex items-center justify-center gap-6 text-caption text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-micro font-mono">←</kbd>
            Bỏ qua
          </span>
          <span className="flex items-center gap-1">
            <Sparkles size={14} className="text-primary" />
            Kéo thẻ sang 2 bên
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-micro font-mono">→</kbd>
            Thích
          </span>
        </div>
      )}
    </section>
  );
}
