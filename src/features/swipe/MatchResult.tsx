import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/form/Button";
import { Confetti } from "../../components/ui/effects/Confetti";
import type { PlaceResponse } from "../../types/api";

export interface MatchResultProps {
  matchedPlace: PlaceResponse | null;
  onContinue?: () => void;
}

export default function MatchResult({
  matchedPlace,
  onContinue,
}: MatchResultProps) {
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const lastCelebratedMatchId = useRef<string | null>(null);
  const matchedPlaceId = matchedPlace?.id;

  useEffect(() => {
    if (!matchedPlaceId) {
      lastCelebratedMatchId.current = null;
    } else if (matchedPlaceId !== lastCelebratedMatchId.current) {
      lastCelebratedMatchId.current = matchedPlaceId;
      setConfettiTrigger((trigger) => trigger + 1);
    }
  }, [matchedPlaceId]);

  if (!matchedPlace) return null;

  return (
    <>
      <Confetti trigger={confettiTrigger} count={90} duration={4200} />
      <motion.section
        aria-label="Ghép đôi thành công"
        aria-live="polite"
        className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[#fff8f1]/95 px-5 py-10 text-center backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="status"
      >
        <div className="relative mx-auto w-full max-w-lg">
          <motion.div
            aria-hidden="true"
            className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-[#ffe0d3] text-[#f05a32] shadow-lg shadow-[#f05a32]/15"
            initial={{ scale: 0.5, rotate: -18 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
          >
            <PartyPopper size={48} strokeWidth={1.8} />
          </motion.div>

          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#f05a32]">
            <Sparkles aria-hidden="true" size={18} />
            <span>Chốt đơn thành công</span>
            <Sparkles aria-hidden="true" size={18} />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-[#261b17] sm:text-5xl">
            Cả nhóm đã tìm được kèo!
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#756761]">
            Mọi người cùng đi ăn {matchedPlace.name} nhé!
          </p>

          <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-[#f5c5b4] bg-white px-5 py-3 font-bold text-[#c63d1c] shadow-sm">
            <span aria-hidden="true">🍽️</span>
            {matchedPlace.name}
          </div>

          {onContinue && (
            <div className="mt-8">
              <Button size="lg" onClick={onContinue}>
                Tuyệt vời, đi thôi!
              </Button>
            </div>
          )}
        </div>
      </motion.section>
    </>
  );
}
