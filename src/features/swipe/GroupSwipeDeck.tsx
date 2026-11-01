import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/feedback/Alert";
import { EmptyState } from "../../components/ui/feedback/EmptyState";
import { Spinner } from "../../components/ui/feedback/Spinner";
import { SwipeApiError, SwipeService } from "../../services/swipe.service";
import type { PlaceResponse, RoomResponse } from "../../types/api";
import SwipeCardItem from "./SwipeCardItem";
import SwipeResultBoard from "./SwipeResultBoard";

export interface GroupSwipeDeckProps {
  roomId: string;
  currentUserId: string;
  socketClient?: Client;
  socketConnected?: boolean;
  roomUpdatesTopic?: string;
  resultsTopic?: string;
  onRoomClosed?: (room: RoomResponse) => void;
}

const SWIPE_DEBOUNCE_MS = 300;

export default function GroupSwipeDeck({
  roomId,
  currentUserId,
  socketClient,
  socketConnected = false,
  roomUpdatesTopic,
  resultsTopic,
  onRoomClosed,
}: GroupSwipeDeckProps) {
  const navigate = useNavigate();
  const [deck, setDeck] = useState<PlaceResponse[]>([]);
  const [swipedPlaceIds, setSwipedPlaceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const swipeInProgress = useRef(false);
  const closedRoomHandled = useRef<string | null>(null);

  const handleRoomClosed = useCallback(
    (closedRoom: RoomResponse) => {
      if (
        closedRoom.status !== "CLOSED" ||
        closedRoomHandled.current === closedRoom.id
      ) {
        return;
      }
      closedRoomHandled.current = closedRoom.id;
      if (onRoomClosed) {
        onRoomClosed(closedRoom);
      } else {
        navigate(`/app/room/${encodeURIComponent(roomId)}/summary`, {
          replace: true,
        });
      }
    },
    [navigate, onRoomClosed, roomId],
  );

  const refreshRoom = useCallback(async () => {
    const updatedRoom = await SwipeService.getRoom(roomId);
    setRoom(updatedRoom);
    handleRoomClosed(updatedRoom);
    return updatedRoom;
  }, [handleRoomClosed, roomId]);

  useEffect(() => {
    let cancelled = false;

    async function loadDeck(): Promise<void> {
      try {
        const [places, history, currentRoom] = await Promise.all([
          SwipeService.getDeck(roomId),
          SwipeService.getMySwipes(roomId),
          SwipeService.getRoom(roomId),
        ]);
        if (cancelled) return;

        setDeck(places);
        setSwipedPlaceIds(new Set(history.map((swipe) => swipe.placeId)));
        setRoom(currentRoom);
        handleRoomClosed(currentRoom);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải bộ bài của phòng.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const loadTimeoutId = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void loadDeck();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimeoutId);
    };
  }, [handleRoomClosed, retryKey, roomId]);

  const remainingPlaces = useMemo(
    () => deck.filter((place) => !swipedPlaceIds.has(place.id)),
    [deck, swipedPlaceIds],
  );

  async function handleSwipe(place: PlaceResponse, liked: boolean): Promise<void> {
    if (swipeInProgress.current) return;
    swipeInProgress.current = true;
    setSwiping(true);
    setError(null);

    try {
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, SWIPE_DEBOUNCE_MS),
      );

      try {
        await SwipeService.submitSwipe({
          roomId,
          placeId: place.id,
          liked,
        });
      } catch (swipeError) {
        if (
          !(swipeError instanceof SwipeApiError) ||
          swipeError.code !== 2014
        ) {
          throw swipeError;
        }
      }

      setSwipedPlaceIds((current) => new Set(current).add(place.id));
      try {
        await refreshRoom();
      } catch (roomError) {
        setError(
          roomError instanceof Error
            ? `Đã lưu lượt quẹt nhưng không thể cập nhật trạng thái phòng: ${roomError.message}`
            : "Đã lưu lượt quẹt nhưng không thể cập nhật trạng thái phòng.",
        );
      }
    } catch (swipeError) {
      setError(
        swipeError instanceof Error
          ? swipeError.message
          : "Không thể ghi nhận lượt quẹt. Vui lòng thử lại.",
      );
      throw swipeError instanceof Error
        ? swipeError
        : new Error("Không thể ghi nhận lượt quẹt. Vui lòng thử lại.");
    } finally {
      swipeInProgress.current = false;
      setSwiping(false);
    }
  }

  useEffect(() => {
    if (
      !roomUpdatesTopic ||
      !socketConnected ||
      !socketClient?.connected
    ) {
      return;
    }

    const subscription = socketClient.subscribe(roomUpdatesTopic, () => {
      void refreshRoom().catch((refreshError: unknown) => {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : "Không thể đồng bộ trạng thái phòng.",
        );
      });
    });
    return () => subscription.unsubscribe();
  }, [refreshRoom, roomUpdatesTopic, socketClient, socketConnected]);

  useEffect(() => {
    if (room?.status !== "OPEN") return;

    const intervalId = window.setInterval(() => {
      void refreshRoom().catch((refreshError: unknown) => {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : "Không thể cập nhật trạng thái phòng.",
        );
      });
    }, 3000);
    return () => window.clearInterval(intervalId);
  }, [refreshRoom, room?.status]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center" aria-label="Đang tải bộ bài">
        <Spinner size="lg" label="Đang tải bộ bài quẹt..." />
      </div>
    );
  }

  if (error && deck.length === 0) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <Alert
          variant="danger"
          title="Không thể mở bộ bài"
          action={
            <button
              type="button"
              className="focus-ring rounded-button font-semibold underline"
              onClick={() => setRetryKey((current) => current + 1)}
            >
              Tải lại trang
            </button>
          }
        >
          {error}
        </Alert>
      </div>
    );
  }

  if (room?.status === "OPEN") {
    return (
      <EmptyState
        title="Phòng chưa bắt đầu quẹt"
        description="Chờ chủ phòng bắt đầu phiên quẹt, bộ bài sẽ sẵn sàng ngay sau đó."
        icon="⏳"
        size="sm"
      />
    );
  }

  const isHost = room?.host.id === currentUserId;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6" aria-label="Bộ bài quẹt nhóm">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between gap-3">
        <div>
          <p className="text-overline text-primary-strong">Chọn quán cùng hội</p>
          <h2 className="text-heading font-bold">Quẹt thẻ địa điểm</h2>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-body-sm font-semibold text-secondary-foreground">
          Còn {remainingPlaces.length}/{deck.length}
        </span>
      </header>

      {error && (
        <Alert variant="warning" title="Có vấn đề khi đồng bộ">
          {error}
        </Alert>
      )}

      {remainingPlaces.length > 0 ? (
        <AnimatePresence mode="wait" initial={false}>
          <SwipeCardItem
            key={remainingPlaces[0].id}
            place={remainingPlaces[0]}
            disabled={swiping}
            onSwipe={(liked) => handleSwipe(remainingPlaces[0], liked)}
          />
        </AnimatePresence>
      ) : (
        <div className="space-y-6">
          <EmptyState
            title="Bạn đã quẹt hết bộ bài"
            description="Đang chờ các thành viên khác hoàn tất. Kết quả sẽ tự cập nhật mỗi 4 giây."
            icon="🍽️"
            size="sm"
          />
          {room && (
            <SwipeResultBoard
              roomId={roomId}
              isHost={isHost}
              onRoomClosed={handleRoomClosed}
              socketClient={socketClient}
              socketConnected={socketConnected}
              resultsTopic={resultsTopic}
            />
          )}
        </div>
      )}
    </section>
  );
}
