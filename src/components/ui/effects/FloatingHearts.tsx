import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FloatingHeartsProps {
  active?: boolean;
  count?: number; // number of hearts to spawn per trigger
}

export const FloatingHearts = ({ active = false, count = 1 }: FloatingHeartsProps) => {
  const [hearts, setHearts] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    if (!active) return;
    
    const newHearts = Array.from({ length: count }).map(() => ({
      id: Date.now() + Math.random(),
      x: Math.random() * 80 - 40, // -40px to +40px from origin
      delay: Math.random() * 0.2,
    }));
    
    setHearts(prev => [...prev, ...newHearts]);

    const timer = setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 2000); // clear them after animation

    return () => clearTimeout(timer);
  }, [active, count]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ y: 0, x: 0, scale: 0.5, opacity: 0 }}
            animate={{ 
              y: -100 - Math.random() * 80, 
              x: h.x,
              scale: 1 + Math.random() * 0.5,
              opacity: [0, 1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.2 + Math.random() * 0.5, 
              delay: h.delay,
              ease: "easeOut"
            }}
            className="absolute text-red-500 drop-shadow-md"
            style={{ fontSize: "2rem" }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
