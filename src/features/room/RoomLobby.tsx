import { useEffect, useState } from "react";
import { Check, Copy, Crown, LoaderCircle, Users } from "lucide-react";

export type RoomMember = {
  id: string;
  name: string;
  isReady: boolean;
  avatarUrl?: string | null;
};

type RoomLobbyProps = {
  roomCode: string;
  members: RoomMember[];
  currentUserId: string;
  hostId: string;
  onToggleReady: (isReady: boolean) => Promise<void>;
  onStartSwiping: () => Promise<void>;
  roomStatus?: "WAITING" | "SWIPING";
  roomLink?: string;
};

export default function RoomLobby({
  roomCode,
  members,
  currentUserId,
  hostId,
  onToggleReady,
  onStartSwiping,
  roomStatus = "WAITING",
  roomLink,
}: RoomLobbyProps) {
  const [isReadyPending, setIsReadyPending] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMember = members.find((member) => member.id === currentUserId);
  const isHost = currentUserId === hostId;
  const isWaiting = roomStatus === "WAITING";
  const allMembersReady =
    members.length >= 2 && members.every((member) => member.isReady);
  const canStart = isHost && isWaiting && allMembersReady;

  useEffect(() => {
    if (!copied) return;

    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopyLink() {
    setIsCopying(true);
    setError(null);
    setCopied(false);

    try {
      const link =
        roomLink ??
        (() => {
          const url = new URL(window.location.href);
          url.searchParams.set("roomCode", roomCode);
          return url.toString();
        })();

      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError("Không thể sao chép liên kết. Vui lòng thử lại.");
    } finally {
      setIsCopying(false);
    }
  }

  async function handleToggleReady() {
    if (!currentMember || isReadyPending || !isWaiting) return;

    setIsReadyPending(true);
    setError(null);

    try {
      await onToggleReady(!currentMember.isReady);
    } catch {
      setError("Không thể cập nhật trạng thái sẵn sàng. Vui lòng thử lại.");
    } finally {
      setIsReadyPending(false);
    }
  }

  async function handleStartSwiping() {
    if (!canStart || isStarting) return;

    setIsStarting(true);
    setError(null);

    try {
      await onStartSwiping();
    } catch {
      setError("Không thể bắt đầu quẹt thẻ. Vui lòng thử lại.");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <section
      className="mx-auto w-full max-w-2xl rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-8"
      aria-labelledby="room-lobby-title"
    >
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
          Phòng chờ
        </p>
        <h1
          id="room-lobby-title"
          className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl"
        >
          Sẵn sàng tìm món ngon?
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Chia sẻ mã phòng với bạn bè và chờ mọi người sẵn sàng.
        </p>
      </header>

      <div className="mt-6 rounded-xl bg-orange-50 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-orange-700">
          Mã phòng
        </p>
        <p className="mt-1 break-all font-mono text-3xl font-bold tracking-[0.2em] text-gray-900">
          {roomCode}
        </p>
        <button
          type="button"
          onClick={() => void handleCopyLink()}
          disabled={isCopying || !roomCode}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCopying ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : copied ? (
            <Check aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {isCopying
            ? "Đang sao chép..."
            : copied
              ? "Đã sao chép link"
              : "Sao chép link mời"}
        </button>
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <Users aria-hidden="true" className="h-5 w-5 text-orange-600" />
            Thành viên
          </h2>
          <span className="text-sm text-gray-500">{members.length} người</span>
        </div>

        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-500">
            Chưa có thành viên trong phòng.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700"
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-sm font-medium text-gray-800">
                    {member.name}
                    {member.id === currentUserId && (
                      <span className="ml-1 font-normal text-gray-500">
                        (Bạn)
                      </span>
                    )}
                  </span>
                  {member.id === hostId && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-amber-600">
                      <Crown aria-hidden="true" className="h-4 w-4" />
                      Chủ phòng
                    </span>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    member.isReady
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {member.isReady ? "Sẵn sàng" : "Đang chờ"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {isWaiting && currentMember && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void handleToggleReady()}
            disabled={isReadyPending}
            className="flex-1 rounded-xl border border-orange-200 px-4 py-3 font-semibold text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReadyPending
              ? "Đang cập nhật..."
              : currentMember.isReady
                ? "Hủy sẵn sàng"
                : "Tôi đã sẵn sàng"}
          </button>

          {isHost && (
            <button
              type="button"
              onClick={() => void handleStartSwiping()}
              disabled={!canStart || isStarting}
              className="flex-1 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isStarting ? "Đang bắt đầu..." : "Bắt đầu quẹt thẻ"}
            </button>
          )}
        </div>
      )}

      {isWaiting && isHost && !allMembersReady && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Cần ít nhất 2 thành viên và tất cả phải sẵn sàng để bắt đầu.
        </p>
      )}

      {!isWaiting && (
        <p
          role="status"
          className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700"
        >
          Phòng đã bắt đầu quẹt thẻ.
        </p>
      )}
    </section>
  );
}
