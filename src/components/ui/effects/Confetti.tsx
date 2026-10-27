import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ConfettiProps {
  active?: boolean;
  trigger?: number;
  duration?: number;
  count?: number;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: string;
  x: number;
  driftX: number;
  delay: number;
  fallDuration: number;
  color: string;
  size: number;
  rotation: number;
  rotateDelta: number;
  isCircle: boolean;
}

export const Confetti = ({
  active = false,
  trigger,
  duration = 3200,
  count = 50,
  onComplete,
}: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const seqRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const shouldSpawn = trigger !== undefined ? trigger > 0 : active;
    if (!shouldSpawn) {
      if (trigger === undefined && !active) {
        setPieces([]);
      }
      return;
    }

    const colors = ["#f05a32", "#22c55e", "#3b82f6", "#eab308", "#ec4899", "#a855f7"];
    const batchId = `${Date.now()}-${++seqRef.current}`;

    const newPieces: ConfettiPiece[] = Array.from({ length: count }).map((_, i) => ({
      id: `${batchId}-${i}`,
      x: Math.random() * 100, // percentage vw
      driftX: Math.random() * 20 - 10,
      delay: Math.random() * 0.45,
      fallDuration: 2.2 + Math.random() * 1.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6, // 6 to 16px
      rotation: Math.random() * 360,
      rotateDelta: Math.random() * 720 - 360,
      isCircle: Math.random() > 0.5,
    }));

    setPieces((prev) => [...prev, ...newPieces]);

    const timer = setTimeout(() => {
      setPieces((prev) => prev.filter((p) => !p.id.startsWith(batchId)));
      onCompleteRef.current?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, trigger, duration, count]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ top: "-10%", left: `${p.x}%`, rotate: p.rotation, opacity: 1 }}
            animate={{
              top: "110%",
              left: `${p.x + p.driftX}%`,
              rotate: p.rotation + p.rotateDelta,
              opacity: [1, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.fallDuration,
              delay: p.delay,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size * (p.isCircle ? 1 : 1.5),
              backgroundColor: p.color,
              borderRadius: p.isCircle ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
