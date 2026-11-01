import { useEffect, useMemo, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { Avatar } from "../../components/ui/display/Avatar";
import { EmptyState } from "../../components/ui/feedback/EmptyState";

type Friend = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

type PresenceEvent = {
  userId: string;
  status: "ONLINE" | "OFFLINE";
};

type FriendListProps = {
  friends: Friend[];
  socketClient?: Client;
  socketConnected?: boolean;
  presenceTopic?: string;
  subscribePresence?: (onMessage: (payload: string) => void) => () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePresenceEvent(payload: string): PresenceEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    console.error("Không thể đọc cập nhật trạng thái bạn bè từ WebSocket.", error);
    return null;
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.userId !== "string" ||
    !parsed.userId ||
    (parsed.status !== "ONLINE" && parsed.status !== "OFFLINE")
  ) {
    return null;
  }

  return {
    userId: parsed.userId,
    status: parsed.status,
  };
}

export default function FriendList({
  friends,
  socketClient,
  socketConnected = false,
  presenceTopic,
  subscribePresence,
}: FriendListProps) {
  const [onlineFriendIds, setOnlineFriendIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const handlePresence = (payload: string) => {
      const event = parsePresenceEvent(payload);
      if (!event) return;

      setOnlineFriendIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (event.status === "ONLINE") {
          nextIds.add(event.userId);
        } else {
          nextIds.delete(event.userId);
        }

        return nextIds;
      });
    };

    if (presenceTopic && socketConnected && socketClient?.connected) {
      const subscription = socketClient.subscribe(presenceTopic, (message) => {
        handlePresence(message.body);
      });

      return () => subscription.unsubscribe();
    }

    return subscribePresence?.(handlePresence);
  }, [
    presenceTopic,
    socketClient,
    socketConnected,
    subscribePresence,
  ]);

  const sortedFriends = useMemo(
    () =>
      [...friends].sort(
        (first, second) =>
          Number(onlineFriendIds.has(second.id)) -
          Number(onlineFriendIds.has(first.id)),
      ),
    [friends, onlineFriendIds],
  );

  const onlineCount = friends.filter((friend) =>
    onlineFriendIds.has(friend.id),
  ).length;

  return (
    <section className="w-full max-w-md" aria-label="Danh sách bạn bè">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-heading-sm font-bold text-foreground">Bạn bè</h2>
        <span className="text-body-sm text-muted-foreground" aria-live="polite">
          {onlineCount} đang online
        </span>
      </header>

      {sortedFriends.length === 0 ? (
        <EmptyState
          title="Chưa có bạn bè"
          description="Kết bạn để cùng nhau tìm quán ăn nhé."
          size="sm"
        />
      ) : (
        <ul className="divide-y divide-border">
          {sortedFriends.map((friend) => {
            const isOnline = onlineFriendIds.has(friend.id);

            return (
              <li
                key={friend.id}
                className="flex items-center gap-3 py-3"
                aria-label={`${friend.username}, ${
                  isOnline ? "đang online" : "offline"
                }`}
              >
                <Avatar
                  src={friend.avatarUrl ?? undefined}
                  name={friend.username}
                  size="md"
                  isOnline={isOnline}
                />
                <span className="truncate text-body font-semibold text-foreground">
                  {friend.username}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
