import { useState } from 'react';
import { Check, Crown, ExternalLink, RefreshCw, Trophy, Utensils, Wallet } from 'lucide-react';
import type { PlaceResponse, RoomPlaceResultResponse, UUID } from '../../types';
import { Confetti } from '../../components/ui/effects/Confetti';
import { Badge } from '../../components/ui/display/Badge';
import { Button } from '../../components/ui/form/Button';
import { Alert } from '../../components/ui/feedback/Alert';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { EmptyState } from '../../components/ui/feedback/EmptyState';

export interface SwipeResultBoardProps {
  roomId: string;
  results: RoomPlaceResultResponse[];
  matchedPlace?: PlaceResponse | null;
  isHost: boolean;
  hasExpenseCreated?: boolean;
  isLoading?: boolean;
  isSelectingPlace?: boolean;
  error?: string | null;
  onSelectWinningPlace?: (placeId: UUID) => Promise<boolean | void>;
  onRefresh?: () => Promise<void> | void;
  onGoToBillingClick?: () => void;
}

export default function SwipeResultBoard({
  results = [],
  matchedPlace = null,
  isHost,
  hasExpenseCreated = false,
  isLoading = false,
  isSelectingPlace = false,
  error = null,
  onSelectWinningPlace,
  onRefresh,
  onGoToBillingClick,
}: SwipeResultBoardProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<UUID | null>(null);

  async function handleSelectPlace(placeId: UUID) {
    if (!onSelectWinningPlace || isSelectingPlace) return;
    setSelectedTargetId(placeId);
    try {
      await onSelectWinningPlace(placeId);
    } finally {
      setSelectedTargetId(null);
    }
  }

  // Sắp xếp kết quả theo số lượt thích giảm dần
  const sortedResults = [...results].sort((a, b) => b.totalLikes - a.totalLikes);

  return (
    <section aria-labelledby="swipe-results-title" className="mx-auto w-full max-w-2xl space-y-6">
      {/* Hiệu ứng pháo hoa khi đã có quán chiến thắng */}
      <Confetti active={Boolean(matchedPlace)} count={60} />

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 id="swipe-results-title" className="text-heading-sm font-bold text-foreground">
            Kết quả bình chọn nhóm
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Bảng xếp hạng các quán ăn theo số lượt thích của cả phòng
          </p>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw aria-hidden="true" size={16} />}
            onClick={() => void onRefresh()}
          >
            Làm mới
          </Button>
        )}
      </header>

      {error && (
        <Alert variant="danger" title="Lỗi cập nhật">
          {error}
        </Alert>
      )}

      {/* Quán chiến thắng đã chốt */}
      {matchedPlace && (
        <div className="relative overflow-hidden rounded-section border-2 border-primary bg-primary-soft/10 p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success" size="md">
                  <Trophy size={14} className="mr-1" />
                  Quán chiến thắng!
                </Badge>
                <span className="text-caption font-semibold text-success-soft-foreground">
                  Đã chốt cho cả nhóm
                </span>
              </div>

              <h3 className="text-heading font-bold text-foreground">
                {matchedPlace.name}
              </h3>
              <p className="text-body-sm text-muted-foreground">
                {matchedPlace.address || 'Đang cập nhật địa chỉ'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {matchedPlace.latitude !== null && matchedPlace.longitude !== null && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${matchedPlace.latitude},${matchedPlace.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-control border border-border bg-card px-4 text-body-sm font-bold text-foreground shadow-sm hover:bg-muted"
                >
                  <ExternalLink size={16} className="text-primary" />
                  Chỉ đường Google Maps
                </a>
              )}

              {onGoToBillingClick && (
                <Button
                  variant="primary"
                  leftIcon={<Wallet aria-hidden="true" size={16} />}
                  onClick={onGoToBillingClick}
                >
                  Tạo hóa đơn chia tiền
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Đang tải kết quả bình chọn..." />
        </div>
      ) : sortedResults.length === 0 ? (
        <EmptyState
          title="Chưa có kết quả bình chọn"
          description="Kết quả sẽ hiển thị ngay khi các thành viên bắt đầu quẹt thẻ."
          icon="🗳️"
          size="sm"
        />
      ) : (
        <div className="space-y-3">
          <ol className="divide-y divide-border rounded-card border border-border bg-card shadow-card" role="list">
            {sortedResults.map((result, index) => {
              const isMatched = result.matched || (matchedPlace && matchedPlace.id === result.placeId);
              const isTop1 = index === 0 && result.totalLikes > 0;
              const isBusy = isSelectingPlace && selectedTargetId === result.placeId;

              return (
                <li
                  key={result.placeId}
                  className={`flex flex-wrap items-center justify-between gap-3 p-4 transition-colors ${
                    isMatched ? 'bg-success-soft/20' : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground text-body-sm"
                    >
                      {isMatched ? (
                        <Trophy size={18} className="text-success" />
                      ) : isTop1 ? (
                        <Crown size={18} className="text-warning-soft-foreground" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-body font-bold text-foreground">
                          {result.placeName}
                        </h4>
                        {isMatched && (
                          <Badge variant="success" size="sm">
                            <Check size={12} className="mr-0.5" />
                            Đã chốt
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-caption text-muted-foreground">
                        <strong className="text-success">{result.totalLikes}</strong> lượt thích ·{' '}
                        <span className="text-muted-foreground">{result.totalDislikes}</span> bỏ qua
                      </p>
                    </div>
                  </div>

                  {/* Nút Chốt quán dành cho Host */}
                  {isHost && !isMatched && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Utensils aria-hidden="true" size={14} />}
                      disabled={hasExpenseCreated || isSelectingPlace}
                      loading={isBusy}
                      loadingText="Đang chốt..."
                      onClick={() => void handleSelectPlace(result.placeId)}
                    >
                      {hasExpenseCreated ? 'Đã có hóa đơn' : 'Chốt quán này'}
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>

          {hasExpenseCreated && (
            <p className="text-caption text-muted-foreground text-center">
              * Phòng đã phát sinh hóa đơn chi phí nên không thể thay đổi quán ăn đã chốt.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
