import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PlaceCard, type Place } from "../../components/ui/display/PlaceCard";
import { EmptyState } from "../../components/ui/feedback/EmptyState";
import FramerCard from "./FramerCard";

export type SwipeDirection = "like" | "pass";

export interface SwipeDeckProps {
  places: Place[];
  onSwipe: (place: Place, direction: SwipeDirection) => void | Promise<void>;
}

export default function SwipeDeck({
  places,
  onSwipe,
}: SwipeDeckProps) {
  const [swipedPlaceIds, setSwipedPlaceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const swipeInProgress = useRef(false);

  const remainingPlaces = places.filter(
    (place) => !swipedPlaceIds.has(place.id),
  );

  async function swipe(direction: SwipeDirection): Promise<void> {
    const place = remainingPlaces[0];
    if (!place || swipeInProgress.current) return;
    swipeInProgress.current = true;
    swipeInProgress.current = true;
    setError(null);

    try {
      await onSwipe(place, direction);
      setSwipedPlaceIds((currentIds) => new Set(currentIds).add(place.id));
    } catch (swipeError) {
      const message =
        swipeError instanceof Error
          ? swipeError.message
          : "Không thể ghi nhận lượt quẹt. Vui lòng thử lại.";
      setError(message);
      throw swipeError instanceof Error ? swipeError : new Error(message);
    } finally {
      swipeInProgress.current = false;
    }
  }

  function runButtonSwipe(direction: SwipeDirection) {
    void swipe(direction).catch(() => {
      // The error is already shown in the deck's alert.
    });
  }

  const currentPlace = remainingPlaces[0];

  return (
    <section className="mx-auto w-full max-w-md" aria-label="Chọn quán ăn">
      <div className="mb-3 flex items-center justify-between text-sm text-[#756761]">
        <span>Quán chưa quẹt</span>
        <span>{remainingPlaces.length}</span>
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {currentPlace ? (
        <AnimatePresence mode="wait">
          <FramerCard
            key={currentPlace.id}
            onSwipe={(direction) =>
              swipe(direction === "right" ? "like" : "pass")
            }
            onError={(swipeError) => setError(swipeError.message)}
          >
            <PlaceCard
              place={currentPlace}
              showActions
              onPass={() => runButtonSwipe("pass")}
              onLike={() => runButtonSwipe("like")}
            />
          </FramerCard>
        </AnimatePresence>
      ) : (
        <EmptyState
          title="Bạn đã xem hết quán"
          description="Hãy chờ cả nhóm hoàn tất lượt quẹt để xem kết quả."
          icon="🍽️"
        />
      )}
    </section>
  );
}
