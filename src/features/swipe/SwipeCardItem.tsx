import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, X } from "lucide-react";
import { Button } from "../../components/ui/form/Button";
import type { PlaceResponse } from "../../types/api";

export interface SwipeCardItemProps {
  place: PlaceResponse;
  onSwipe: (liked: boolean) => void | Promise<void>;
  disabled?: boolean;
}

export default function SwipeCardItem({
  place,
  onSwipe,
  disabled = false,
}: SwipeCardItemProps) {
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const swipeInProgress = useRef(false);
  const priceRange =
    typeof place.priceRange === "number"
      ? "$".repeat(Math.max(0, Math.min(5, place.priceRange)))
      : null;

  async function completeSwipe(liked: boolean): Promise<void> {
    if (swipeInProgress.current || disabled) return;

    swipeInProgress.current = true;
    setBusy(true);

    try {
      await onSwipe(liked);
      setDirection(liked ? "right" : "left");
    } catch {
      setDirection(null);
    } finally {
      swipeInProgress.current = false;
      setBusy(false);
    }
  }

  return (
    <article className="mx-auto w-full max-w-lg">
      <motion.div
        aria-label={`Thẻ địa điểm ${place.name}`}
        className="touch-pan-y overflow-hidden rounded-section border border-border bg-card shadow-raised"
        drag={direction || disabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.75}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100) void completeSwipe(true);
          if (info.offset.x < -100) void completeSwipe(false);
        }}
        animate={
          direction
            ? {
                opacity: 0,
                x: direction === "right" ? 500 : -500,
                rotate: direction === "right" ? 12 : -12,
              }
            : { opacity: 1, x: 0, rotate: 0 }
        }
        exit={{
          opacity: 0,
          x: direction === "right" ? 500 : direction === "left" ? -500 : 0,
          rotate: direction === "right" ? 12 : direction === "left" ? -12 : 0,
        }}
        transition={{ duration: 0.22 }}
      >
          <div className="relative h-64 bg-muted sm:h-80">
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
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-5 pt-16 text-white">
              <p className="text-caption font-semibold uppercase tracking-wide text-white/80">
                {place.category || "Gợi ý cho cả nhóm"}
              </p>
              <h3 className="mt-1 text-heading font-bold">{place.name}</h3>
            </div>
          </div>

          <div className="space-y-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm text-muted-foreground">
              {place.address && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin aria-hidden="true" size={16} className="shrink-0" />
                  <span className="line-clamp-2">{place.address}</span>
                </span>
              )}
              {priceRange && (
                <span aria-label={`Mức giá ${priceRange}`}>
                  <span aria-hidden="true">{priceRange}</span>
                </span>
              )}
            </div>

            <div className="flex gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                className="min-h-11 flex-1"
                disabled={disabled || busy}
                loading={busy && direction === "left"}
                loadingText="Đang lưu..."
                leftIcon={<X aria-hidden="true" size={18} />}
                onClick={() => void completeSwipe(false)}
                aria-label={`Bỏ qua ${place.name}`}
              >
                Bỏ qua
              </Button>
              <Button
                className="min-h-11 flex-1"
                disabled={disabled || busy}
                loading={busy && direction === "right"}
                loadingText="Đang lưu..."
                leftIcon={<Heart aria-hidden="true" size={18} />}
                onClick={() => void completeSwipe(true)}
                aria-label={`Thích ${place.name}`}
              >
                Thích
              </Button>
            </div>
          </div>
      </motion.div>
    </article>
  );
}
