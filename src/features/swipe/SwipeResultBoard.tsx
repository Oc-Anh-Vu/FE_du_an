import { useCallback, useEffect, useRef, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { Check, Crown, RefreshCw, Trophy } from "lucide-react";
import { Alert } from "../../components/ui/feedback/Alert";
import { EmptyState } from "../../components/ui/feedback/EmptyState";
import { Spinner } from "../../components/ui/feedback/Spinner";
import { Button } from "../../components/ui/form/Button";
import { SwipeApiError, SwipeService } from "../../services/swipe.service";
import type { RoomResponse, RoomSwipeResultItem } from "../../types/api";

export interface SwipeResultBoardProps {
  roomId: string;
  isHost: boolean;
  onRoomClosed?: (room: RoomResponse) => void;
  socketClient?: Client;
  socketConnected?: boolean;
  resultsTopic?: string;
}

export default function SwipeResultBoard({
  roomId,
  isHost,
  onRoomClosed,
  socketClient,
  socketConnected = false,
  resultsTopic,
}: SwipeResultBoardProps) {
  const [results, setResults] = useState<RoomSwipeResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingPlaceId, setSelectingPlaceId] = useState<string | null>(null);
  const refreshInProgress = useRef(false);
  const closedRoomHandled = useRef<string | null>(null);

  const handleRoomClosed = useCallback(
    (room: RoomResponse) => {
      if (
        room.status !== "CLOSED" ||
        closedRoomHandled.current === room.id
      ) {
        return;
      }
      closedRoomHandled.current = room.id;
      onRoomClosed?.(room);
    },
    [onRoomClosed],
  );

  const refresh = useCallback(async () => {
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    try {
      const [nextResults, room] = await Promise.all([
        SwipeService.getResults(roomId),
        SwipeService.getRoom(roomId),
      ]);
      setResults(nextResults);
      setError(null);
      handleRoomClosed(room);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Không thể tải kết quả bình chọn.",
      );
    } finally {
      setLoading(false);
      refreshInProgress.current = false;
    }
  }, [handleRoomClosed, roomId]);

  useEffect(() => {
    const initialFetchId = window.setTimeout(() => void refresh(), 0);
    const intervalId = window.setInterval(() => void refresh(), 4000);
    return () => {
      window.clearTimeout(initialFetchId);
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  useEffect(() => {
    if (
      !resultsTopic ||
      !socketConnected ||
      !socketClient?.connected
    ) {
      return;
    }

    const subscription = socketClient.subscribe(resultsTopic, () => {
      void refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh, resultsTopic, socketClient, socketConnected]);

  async function selectPlace(placeId: string): Promise<void> {
    setSelectingPlaceId(placeId);
    setError(null);
    try {
      const room = await SwipeService.selectPlace(roomId, { placeId });
      handleRoomClosed(room);
    } catch (selectionError) {
      const message =
        selectionError instanceof SwipeApiError && selectionError.code === 2013
          ? "Phòng đã có hóa đơn nên không thể đổi quán đã chốt."
          : selectionError instanceof Error
            ? selectionError.message
            : "Không thể chốt quán. Vui lòng thử lại.";
      setError(message);
    } finally {
      setSelectingPlaceId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10" aria-label="Đang tải kết quả">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="swipe-results-title"
      className="mx-auto w-full max-w-2xl space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-overline text-primary-strong">Bình chọn của nhóm</p>
          <h2 id="swipe-results-title" className="text-heading font-bold">
            Kết quả quẹt
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw aria-hidden="true" size={16} />}
          onClick={() => void refresh()}
        >
          Cập nhật
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Chưa thể cập nhật kết quả"
          action={
            <Button size="sm" variant="outline" onClick={() => void refresh()}>
              Thử lại
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {results.length === 0 ? (
        <EmptyState
          title="Chưa có kết quả bình chọn"
          description="Kết quả sẽ xuất hiện khi các thành viên bắt đầu quẹt thẻ."
          icon="🗳️"
          size="sm"
        />
      ) : (
        <ol className="space-y-3">
          {results.map((result, index) => (
            <li
              key={result.placeId}
              className={`flex flex-wrap items-center gap-3 rounded-card border bg-card p-4 ${
                result.matched ? "border-success bg-success-soft/40" : "border-border"
              }`}
            >
              <div
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground"
              >
                {result.matched ? (
                  <Trophy size={18} className="text-accent" />
                ) : index === 0 ? (
                  <Crown size={18} className="text-primary" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold">{result.placeName}</h3>
                <p className="mt-1 text-caption text-muted-foreground">
                  <span className="font-semibold text-success">
                    {result.totalLikes} thích
                  </span>
                  <span aria-hidden="true"> · </span>
                  {result.totalDislikes} bỏ qua
                </p>
              </div>
              {result.matched && (
                <span className="inline-flex items-center gap-1 text-body-sm font-semibold text-success">
                  <Check aria-hidden="true" size={16} />
                  Đã chốt
                </span>
              )}
              {isHost && !result.matched && (
                <Button
                  size="sm"
                  disabled={selectingPlaceId !== null}
                  loading={selectingPlaceId === result.placeId}
                  loadingText="Đang chốt..."
                  onClick={() => void selectPlace(result.placeId)}
                  aria-label={`Chốt ${result.placeName} cho cả nhóm`}
                >
                  Chốt quán
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}
      <p className="text-center text-caption text-muted-foreground" aria-live="polite">
        Kết quả tự cập nhật mỗi 4 giây.
      </p>
    </section>
  );
}
