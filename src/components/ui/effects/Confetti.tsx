import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../../utils/cn";

export interface ConfettiProps {
  trigger?: number;
  count?: number;
  duration?: number;
  active?: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: string;
  x: number;
  driftX: number;
  delay: number;
  fallDuration: number;
  colorClass: string;
  size: number;
  rotation: number;
  rotateDelta: number;
  isCircle: boolean;
}

const colors = [
  "bg-primary",
  "bg-success",
  "bg-info",
  "bg-accent",
  "bg-warning",
  "bg-avatar-pink",
];

export const Confetti = ({
  trigger,
  count = 50,
  duration = 3200,
  active = false,
  onComplete,
}: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const sequence = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const activationRef = useRef<string | null>(null);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const currentProps = useRef({ count, duration });
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    onCompleteRef.current = onComplete;
    currentProps.current = { count, duration };
  });

  useEffect(() => {
    const shouldSpawn = trigger !== undefined ? trigger > 0 : active;
    const activation = trigger !== undefined ? `trigger:${trigger}` : `active:${active}`;
    if (activationRef.current === activation) return;
    activationRef.current = activation;
    if (!shouldSpawn || reducedMotion) return;

    const batchId = `${Date.now()}-${++sequence.current}`;
    const durationMs = Math.max(1, currentProps.current.duration);
    const batch = Array.from({ length: Math.max(0, Math.floor(currentProps.current.count)) }, (_, index): ConfettiPiece => {
      const delay = Math.random() * 0.45;
      return {
        id: `${batchId}-${index}`,
        x: Math.random() * 100,
        driftX: Math.random() * 20 - 10,
        delay,
        fallDuration: Math.max(0.1, durationMs / 1000 - delay),
        colorClass: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 360,
        rotateDelta: Math.random() * 720 - 360,
        isCircle: Math.random() > 0.5,
      };
    });

    setPieces((previous) => [...previous, ...batch]);
    const timer = setTimeout(() => {
      setPieces((previous) => previous.filter((piece) => !piece.id.startsWith(batchId)));
      timersRef.current.delete(batchId);
      onCompleteRef.current?.();
    }, durationMs);
    timersRef.current.set(batchId, timer);
  }, [trigger, active, reducedMotion]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  if (reducedMotion || pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-effects overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ top: "-10%", left: `${piece.x}%`, rotate: piece.rotation, opacity: 1 }}
          animate={{
            top: "110%",
            left: `${piece.x + piece.driftX}%`,
            rotate: piece.rotation + piece.rotateDelta,
            opacity: [1, 1, 1, 0],
          }}
          transition={{ duration: piece.fallDuration, delay: piece.delay, ease: "linear" }}
          className={cn("absolute", piece.colorClass, piece.isCircle ? "rounded-full" : "rounded-sm")}
          style={{
            width: piece.size,
            height: piece.size * (piece.isCircle ? 1 : 1.5),
          }}
        />
      ))}
    </div>
  );
};
