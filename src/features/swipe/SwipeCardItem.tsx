import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Tag as TagIcon, X } from 'lucide-react';
import type { PlaceResponse } from '../../types';
import { FloatingHearts } from '../../components/ui/effects/FloatingHearts';

export interface SwipeCardItemProps {
  place: PlaceResponse;
  onSwipeLeft: (place: PlaceResponse) => unknown;
  onSwipeRight: (place: PlaceResponse) => unknown;
  disabled?: boolean;
}

export default function SwipeCardItem({
  place,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: SwipeCardItemProps) {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [heartsTrigger, setHeartsTrigger] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [prevPlaceId, setPrevPlaceId] = useState(place.id);

  if (place.id !== prevPlaceId) {
    setPrevPlaceId(place.id);
    setDirection(null);
    setImageFailed(false);
  }

  const priceLabel =
    typeof place.priceRange === 'number'
      ? '$'.repeat(Math.max(1, Math.min(3, place.priceRange)))
      : null;

  async function handleSwipeLeft() {
    if (disabled || direction) return;
    setDirection('left');
    await onSwipeLeft(place);
  }

  async function handleSwipeRight() {
    if (disabled || direction) return;
    setHeartsTrigger((prev) => prev + 1);
    setDirection('right');
    await onSwipeRight(place);
  }

  return (
    <article className="relative mx-auto w-full max-w-sm select-none">
      {/* Hiệu ứng tim bay khi bấm Thích */}
      <FloatingHearts trigger={heartsTrigger} count={8} />

      <motion.div
        aria-label={`Thẻ quán ăn: ${place.name}`}
        className="touch-pan-y overflow-hidden rounded-section border border-border bg-card shadow-card"
        drag={direction || disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={(_, info) => {
          if (info.offset.x > 90) {
            void handleSwipeRight();
          } else if (info.offset.x < -90) {
            void handleSwipeLeft();
          }
        }}
        animate={
          direction
            ? {
                opacity: 0,
                x: direction === 'right' ? 400 : -400,
                rotate: direction === 'right' ? 15 : -15,
              }
            : { opacity: 1, x: 0, rotate: 0 }
        }
        transition={{ duration: 0.25 }}
      >
        {/* Ảnh quán ăn */}
        <div className="relative h-64 bg-muted sm:h-72">
          {place.imageUrl && !imageFailed ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center bg-secondary text-6xl"
            >
              🍽️
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-white">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-caption font-semibold uppercase tracking-wider text-white/90">
                <TagIcon size={12} />
                {place.category || 'Món ngon'}
              </span>
              {priceLabel && (
                <span className="rounded bg-white/20 px-1.5 py-0.5 text-caption font-bold">
                  {priceLabel}
                </span>
              )}
            </div>
            <h3 className="mt-1 text-heading-sm font-bold text-white line-clamp-1">
              {place.name}
            </h3>
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-2 text-body-sm text-muted-foreground">
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
            <span className="line-clamp-2">
              {place.address || 'Đang cập nhật địa chỉ'}
            </span>
          </div>

          {/* Cụm nút thao tác quẹt */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              type="button"
              disabled={disabled || direction !== null}
              className="focus-ring flex size-14 items-center justify-center rounded-full border-2 border-danger/40 bg-card text-danger shadow-card transition-transform hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              aria-label={`Bỏ qua quán ${place.name}`}
              onClick={() => void handleSwipeLeft()}
            >
              <X size={28} />
            </button>

            <button
              type="button"
              disabled={disabled || direction !== null}
              className="focus-ring flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-raised transition-transform hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              aria-label={`Thích quán ${place.name}`}
              onClick={() => void handleSwipeRight()}
            >
              <Heart size={28} className="fill-current" />
            </button>
          </div>
        </div>
      </motion.div>
    </article>
  );
}
