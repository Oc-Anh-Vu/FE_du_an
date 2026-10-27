import { useEffect, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { motion } from "framer-motion";
import { PartyPopper, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/form/Button";
import { Confetti } from "../../components/ui/effects/Confetti";

export interface MatchFoundMessage {
  type: "MATCH_FOUND";
  placeName?: string;
  restaurantName?: string;
  message?: string;
}

export interface MatchResultProps {
  socketClient: Client;
  socketConnected: boolean;
  matchTopic: string;
  onMatchFound?: (match: MatchFoundMessage) => void;
  onContinue?: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMatchMessage(body: string): MatchFoundMessage | null {
  if (body.trim() === "MATCH_FOUND") {
    return { type: "MATCH_FOUND" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch (error) {
    console.error("Không thể đọc tin nhắn kết quả ghép đôi từ WebSocket.", error);
    return null;
  }

  if (!isRecord(parsed) || (parsed.type !== "MATCH_FOUND" && parsed.event !== "MATCH_FOUND")) {
    return null;
  }

  return {
    type: "MATCH_FOUND",
    placeName:
      typeof parsed.placeName === "string" ? parsed.placeName : undefined,
    restaurantName:
      typeof parsed.restaurantName === "string"
        ? parsed.restaurantName
        : undefined,
    message: typeof parsed.message === "string" ? parsed.message : undefined,
  };
}

export default function MatchResult({
  socketClient,
  socketConnected,
  matchTopic,
  onMatchFound,
  onContinue,
}: MatchResultProps) {
  const [match, setMatch] = useState<MatchFoundMessage | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    if (!socketConnected || !socketClient.connected) return;

    const subscription = socketClient.subscribe(matchTopic, (message) => {
      const matchMessage = parseMatchMessage(message.body);
      if (!matchMessage) return;

      setMatch(matchMessage);
      setConfettiTrigger((trigger) => trigger + 1);
      onMatchFound?.(matchMessage);
    });

    return () => subscription.unsubscribe();
  }, [matchTopic, onMatchFound, socketClient, socketConnected]);

  if (!match) return null;

  const placeName = match.restaurantName ?? match.placeName;

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
            {match.message ??
              (placeName
                ? `Mọi người cùng đi ăn ${placeName} nhé!`
                : "Mọi người đã đồng ý. Cùng chuẩn bị cho bữa ăn thôi!")}
          </p>

          {placeName && (
            <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-[#f5c5b4] bg-white px-5 py-3 font-bold text-[#c63d1c] shadow-sm">
              <span aria-hidden="true">🍽️</span>
              {placeName}
            </div>
          )}

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
