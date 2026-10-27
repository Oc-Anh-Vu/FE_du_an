import { useEffect, useState, type ReactNode } from "react";
import type { Client } from "@stomp/stompjs";
import { motion } from "framer-motion";

export type FramerSwipeDirection = "left" | "right";

export interface FramerCardProps {
  children: ReactNode;
  socketClient: Client;
  socketConnected: boolean;
  destination: string;
  swipePayload?: Record<string, unknown>;
  threshold?: number;
  debounceMs?: number;
  onSwipe?: (direction: FramerSwipeDirection) => void;
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
  socketConnected,
  destination,
  swipePayload,
  threshold = 100,
  debounceMs = 250,
  onSwipe,
  onError,
}: FramerCardProps) {
  const [swipeDirection, setSwipeDirection] =
    useState<FramerSwipeDirection | null>(null);
  const debouncedDirection = useDebounce(swipeDirection, debounceMs);

  useEffect(() => {
    if (!debouncedDirection) return;

    try {
      if (!socketConnected || !socketClient.connected) {
        throw new Error("WebSocket chưa kết nối, không thể gửi lượt quẹt.");
      }

      socketClient.publish({
        destination,
        body: JSON.stringify({
          ...swipePayload,
          direction: debouncedDirection,
        }),
      });
      onSwipe?.(debouncedDirection);
    } catch (error) {
      const swipeError =
        error instanceof Error
          ? error
          : new Error("Không thể gửi lượt quẹt qua WebSocket.");
      if (onError) {
        onError(swipeError);
      } else {
        console.error(swipeError);
      }
    }
  }, [
    debouncedDirection,
    destination,
    onError,
    onSwipe,
    socketClient,
    socketConnected,
    swipePayload,
  ]);

  return (
    <motion.div
      className="touch-pan-y"
      drag={swipeDirection ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x >= threshold) {
          setSwipeDirection("right");
        } else if (info.offset.x <= -threshold) {
          setSwipeDirection("left");
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
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
