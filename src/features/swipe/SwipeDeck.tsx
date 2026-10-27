import { useEffect, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { AnimatePresence, motion } from "framer-motion";
import { PlaceCard, type Place } from "../../components/ui/display/PlaceCard";
import { FloatingHearts } from "../../components/ui/effects/FloatingHearts";
import { EmptyState } from "../../components/ui/feedback/EmptyState";

export type SwipeDirection = "like" | "pass";

export interface SwipeDeckProps {
  places: Place[];
  socketClient: Client;
  socketConnected: boolean;
  heartTopic: string;
  onSwipe?: (place: Place, direction: SwipeDirection) => void | Promise<void>;
}

const SWIPE_THRESHOLD = 120;

export default function SwipeDeck({
  places,
  socketClient,
  socketConnected,
  heartTopic,
  onSwipe,
}: SwipeDeckProps) {
  const [swipedPlaceIds, setSwipedPlaceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [exitDirection, setExitDirection] = useState(1);
  const [heartTrigger, setHeartTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socketConnected || !socketClient.connected) return;

    const subscription = socketClient.subscribe(heartTopic, () => {
      setHeartTrigger((trigger) => trigger + 1);
    });

    return () => subscription.unsubscribe();
  }, [heartTopic, socketClient, socketConnected]);

  const remainingPlaces = places.filter(
    (place) => !swipedPlaceIds.has(place.id),
  );

  async function swipe(direction: SwipeDirection) {
    const place = remainingPlaces[0];
    if (!place || swipingId) return;

    setSwipingId(place.id);
    setError(null);
    setExitDirection(direction === "like" ? 1 : -1);

    try {
      await onSwipe?.(place, direction);
      setSwipedPlaceIds((currentIds) => new Set(currentIds).add(place.id));
    } catch (swipeError) {
      setError(
        swipeError instanceof Error
          ? swipeError.message
          : "Không thể ghi nhận lượt quẹt. Vui lòng thử lại.",
      );
    } finally {
      setSwipingId(null);
    }
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
          <motion.div
            key={currentPlace.id}
            className="relative touch-pan-y"
            drag={swipingId ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              if (info.offset.x >= SWIPE_THRESHOLD) {
                void swipe("like");
              } else if (info.offset.x <= -SWIPE_THRESHOLD) {
                void swipe("pass");
              }
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
            exit={{
              opacity: 0,
              x: exitDirection * 500,
              rotate: exitDirection * 15,
              transition: { duration: 0.2 },
            }}
            transition={{ duration: 0.2 }}
          >
            <FloatingHearts trigger={heartTrigger} count={3} />
            <PlaceCard
              place={currentPlace}
              showActions
              onPass={() => void swipe("pass")}
              onLike={() => void swipe("like")}
            />
          </motion.div>
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
