// Bộ bài quẹt thẻ cá nhân chế độ "Ăn một mình" (Client-side Solo Mode): duyệt thuần Client trên mảng places, phát sự kiện onLike, onSkip, onReset
import { Heart, RotateCcw, X } from 'lucide-react';
import { PlaceCard } from '../../components/ui/display/PlaceCard';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Skeleton } from '../../components/ui/feedback/Skeleton';
import { Button } from '../../components/ui/form/Button';
import { Stack } from '../../components/layout/Stack';
import type { PlaceResponse } from '../../types/api';
import { cn } from '../../utils/cn';
import { getPlaceDistanceKm, type GeoCoordinates } from '../../utils/geoCalculator';
import { toPlaceCardItem } from './usePlaceActions';

export interface SoloSwipeDeckProps {
  places: PlaceResponse[];
  currentIndex: number;
  userCoordinates?: GeoCoordinates | null;
  isLoading?: boolean;
  onLike?: (place: PlaceResponse) => void;
  onMatch?: (place: PlaceResponse) => void;
  onSkip: () => void;
  onReset: () => void;
  className?: string;
}

export function SoloSwipeDeck({
  places,
  currentIndex,
  userCoordinates,
  isLoading = false,
  onLike,
  onMatch,
  onSkip,
  onReset,
  className,
}: SoloSwipeDeckProps) {
  if (isLoading) {
    return (
      <div className={cn('mx-auto max-w-lg space-y-4 p-4', className)}>
        <Skeleton variant="text" width="40%" height={24} className="mx-auto" />
        <Skeleton variant="rect" height={360} className="w-full rounded-card" />
        <div className="flex gap-4">
          <Skeleton variant="rect" height={48} className="flex-1 rounded-control" />
          <Skeleton variant="rect" height={48} className="flex-1 rounded-control" />
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className={cn('mx-auto max-w-md py-8', className)}>
        <EmptyState
          size="md"
          icon="🍽️"
          title="Chưa tìm thấy quán ăn nào"
          description="Không có địa điểm nào khớp với bộ lọc hiện tại. Bạn hãy thử mở rộng bán kính GPS hoặc xóa bớt từ khóa tìm kiếm."
        />
      </div>
    );
  }

  const isCompleted = currentIndex >= places.length;

  if (isCompleted) {
    return (
      <div className={cn('mx-auto max-w-md py-8', className)}>
        <EmptyState
          size="md"
          icon="🎉"
          title="Bạn đã xem hết danh sách quán ăn!"
          description="Bạn đã duyệt qua tất cả các địa điểm tìm thấy. Bạn có thể bấm quẹt lại từ đầu hoặc thay đổi bộ lọc tìm kiếm."
          action={
            <Button
              variant="primary"
              size="lg"
              leftIcon={<RotateCcw aria-hidden="true" size={18} />}
              onClick={onReset}
            >
              Quẹt lại từ đầu
            </Button>
          }
        />
      </div>
    );
  }

  const currentPlace = places[currentIndex];
  const distanceKm = getPlaceDistanceKm(userCoordinates, {
    latitude: currentPlace.latitude,
    longitude: currentPlace.longitude,
  });

  const handleLike = () => {
    onLike?.(currentPlace);
    onMatch?.(currentPlace);
  };

  return (
    <div className={cn('mx-auto flex max-w-lg flex-col items-center gap-4', className)}>
      {/* Thanh tiến độ */}
      <div className="flex w-full items-center justify-between text-body-sm font-semibold text-muted-foreground px-1">
        <span>Chế độ Ăn một mình</span>
        <span className="tabular-nums">
          Quán {currentIndex + 1} / {places.length}
        </span>
      </div>

      {/* Thẻ địa điểm hiện tại */}
      <div className="w-full shadow-raised rounded-card transition-all">
        <PlaceCard
          place={toPlaceCardItem(currentPlace)}
          distanceKm={distanceKm}
          layout="vertical"
        />
      </div>

      {/* Cụm nút Bỏ qua & Thích */}
      <Stack direction="horizontal" gap={3} className="w-full pt-2">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="h-14 font-bold text-body-lg"
          leftIcon={<X aria-hidden="true" size={22} />}
          onClick={onSkip}
          aria-label={`Bỏ qua quán ${currentPlace.name}`}
        >
          Bỏ qua
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="h-14 font-bold text-body-lg shadow-cta"
          leftIcon={<Heart aria-hidden="true" size={22} className="fill-current" />}
          onClick={handleLike}
          aria-label={`Thích quán ${currentPlace.name}`}
        >
          Thích quán này
        </Button>
      </Stack>
    </div>
  );
}

export default SoloSwipeDeck;
