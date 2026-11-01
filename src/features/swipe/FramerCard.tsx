import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Client } from "@stomp/stompjs";
import { motion } from "framer-motion";

export type FramerSwipeDirection = "left" | "right";

export interface FramerCardProps {
  children: ReactNode;
  socketClient?: Client;
  socketConnected?: boolean;
  destination?: string;
  swipePayload?: Record<string, unknown>;
  threshold?: number;
  debounceMs?: number;
  onSwipe: (direction: FramerSwipeDirection) => void | Promise<void>;
  onError?: (error: Error) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

export default function FramerCard({
  children,
  socketClient,
  socketConnected = false,
  destination,
  swipePayload,
  threshold = 100,
  debounceMs = 250,
  onSwipe,
  onError,
}: FramerCardProps) {
  const [swipeDirection, setSwipeDirection] =
    useState<FramerSwipeDirection | null>(null);
  const swipeInProgress = useRef(false);
  const [pendingDirection, setPendingDirection] =
    useState<FramerSwipeDirection | null>(null);
  const debouncedDirection = useDebounce(pendingDirection, debounceMs);

  useEffect(() => {
    if (!debouncedDirection || !destination) return;

    try {
      if (!socketConnected || !socketClient?.connected) {
        throw new Error("WebSocket chưa kết nối, không thể gửi lượt quẹt.");
      }

      socketClient.publish({
        destination,
        body: JSON.stringify({
          ...swipePayload,
          liked: debouncedDirection === "right",
        }),
      });
    } catch (error) {
      const swipeError =
        error instanceof Error
          ? error
          : new Error("Không thể gửi lượt quẹt qua WebSocket.");
      onError?.(swipeError);
      if (!onError) console.error(swipeError);
    } finally {
      setPendingDirection(null);
    }
  }, [
    debouncedDirection,
    destination,
    onError,
    socketClient,
    socketConnected,
    swipePayload,
  ]);

  async function completeSwipe(direction: FramerSwipeDirection) {
    if (swipeInProgress.current) return;

    swipeInProgress.current = true;
    setSwipeDirection(direction);

    try {
      await onSwipe(direction);
      if (destination) {
        setPendingDirection(direction);
      }
    } catch (error) {
      setSwipeDirection(null);
      const swipeError =
        error instanceof Error
          ? error
          : new Error("Không thể ghi nhận lượt quẹt. Vui lòng thử lại.");

      if (onError) {
        onError(swipeError);
      } else {
        console.error(swipeError);
      }
    } finally {
      swipeInProgress.current = false;
    }
  }

  return (
    <motion.div
      className="touch-pan-y"
      drag={swipeDirection ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x >= threshold) {
          void completeSwipe("right");
        } else if (info.offset.x <= -threshold) {
          void completeSwipe("left");
        }
      }}
      animate={
        swipeDirection
          ? {
              opacity: 0,
              x: swipeDirection === "right" ? 500 : -500,
              rotate: swipeDirection === "right" ? 15 : -15,
            }
          : { opacity: 1, x: 0, rotate: 0 }
      }
      exit={{
        opacity: 0,
        x:
          swipeDirection === "right"
            ? 500
            : swipeDirection === "left"
              ? -500
              : 0,
        rotate: swipeDirection === "right" ? 15 : swipeDirection === "left" ? -15 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
