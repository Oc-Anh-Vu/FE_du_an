import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FloatingHeartsProps {
  active?: boolean;
  trigger?: number;
  count?: number;
}

interface HeartParticle {
  id: string;
  x: number;
  yTarget: number;
  scaleTarget: number;
  duration: number;
  delay: number;
}

export const FloatingHearts = ({ active = false, trigger, count = 1 }: FloatingHeartsProps) => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const seqRef = useRef(0);

  useEffect(() => {
    const shouldSpawn = trigger !== undefined ? trigger > 0 : active;
    if (!shouldSpawn) return;

    const batchId = `${Date.now()}-${++seqRef.current}`;
    const newHearts: HeartParticle[] = Array.from({ length: count }).map((_, idx) => ({
      id: `${batchId}-${idx}`,
      x: Math.random() * 80 - 40, // -40px đến +40px từ tâm
      yTarget: -100 - Math.random() * 70,
      scaleTarget: 1 + Math.random() * 0.45,
      duration: 1.15 + Math.random() * 0.45,
      delay: Math.random() * 0.18,
    }));

    setHearts((prev) => [...prev, ...newHearts]);
  }, [active, trigger, count]);

  const removeHeart = (id: string) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ y: 0, x: 0, scale: 0.4, opacity: 0 }}
            animate={{
              y: h.yTarget,
              x: h.x,
              scale: h.scaleTarget,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: h.duration,
              delay: h.delay,
              ease: "easeOut",
            }}
            onAnimationComplete={() => removeHeart(h.id)}
            className="absolute text-red-500 drop-shadow-md select-none"
            style={{ fontSize: "1.85rem" }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
