import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ConfettiProps {
  active?: boolean;
  duration?: number; // ms
  count?: number;
}

export const Confetti = ({ active = false, duration = 3000, count = 50 }: ConfettiProps) => {
  const [pieces, setPieces] = useState<{ id: number; x: number; delay: number; color: string; size: number; rotation: number; isCircle: boolean }[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const colors = ["#f05a32", "#22c55e", "#3b82f6", "#eab308", "#ec4899", "#a855f7"];
    const newPieces = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage vw
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 6, // 6 to 16px
      rotation: Math.random() * 360,
      isCircle: Math.random() > 0.5,
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => {
      setPieces([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration, count]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ top: "-10%", left: `${p.x}%`, rotate: p.rotation, opacity: 1 }}
            animate={{ 
              top: "110%", 
              left: `${p.x + (Math.random() * 20 - 10)}%`,
              rotate: p.rotation + (Math.random() * 720 - 360),
              opacity: [1, 1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2.5 + Math.random() * 2, 
              delay: p.delay, 
              ease: "linear"
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size * (p.isCircle ? 1 : 1.5),
              backgroundColor: p.color,
              borderRadius: p.isCircle ? "50%" : "2px"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
