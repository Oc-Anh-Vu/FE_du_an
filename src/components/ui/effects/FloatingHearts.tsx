import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface FloatingHeartsProps {
  trigger?: number;
  count?: number;
  active?: boolean;
}

interface HeartParticle {
  id: string;
  x: number;
  yTarget: number;
  scaleTarget: number;
  duration: number;
  delay: number;
}

export const FloatingHearts = ({ trigger, count = 5, active = false }: FloatingHeartsProps) => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const sequence = useRef(0);
  const activationRef = useRef<string | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const shouldSpawn = trigger !== undefined ? trigger > 0 : active;
    const activation = trigger !== undefined ? `trigger:${trigger}` : `active:${active}`;
    if (activationRef.current === activation) return;
    activationRef.current = activation;
    if (!shouldSpawn || reducedMotion) return;

    const batchId = `${Date.now()}-${++sequence.current}`;
    const batch = Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index): HeartParticle => ({
      id: `${batchId}-${index}`,
      x: Math.random() * 80 - 40,
      yTarget: -100 - Math.random() * 70,
      scaleTarget: 1 + Math.random() * 0.45,
      duration: 1.15 + Math.random() * 0.45,
      delay: Math.random() * 0.18,
    }));
    setHearts((previous) => [...previous, ...batch]);
  }, [trigger, active, count, reducedMotion]);

  const removeHeart = (id: string) => {
    setHearts((previous) => previous.filter((heart) => heart.id !== id));
  };

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-effects flex items-center justify-center overflow-visible" aria-hidden="true">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ y: 0, x: 0, scale: 0.4, opacity: 0 }}
            animate={{ y: heart.yTarget, x: heart.x, scale: heart.scaleTarget, opacity: [0, 1, 1, 0] }}
            transition={{ duration: heart.duration, delay: heart.delay, ease: "easeOut" }}
            onAnimationComplete={() => removeHeart(heart.id)}
            className="absolute select-none text-danger"
          >
            ♥
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
