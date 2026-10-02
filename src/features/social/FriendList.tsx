import { useEffect, useMemo, useState } from "react";

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
  subscribePresence: (onMessage: (payload: string) => void) => () => void;
};

function parsePresenceEvent(payload: string): PresenceEvent | null {
  try {
    const parsed: unknown = JSON.parse(payload);

    if (typeof parsed !== "object" || parsed === null) return null;

    const event = parsed as Record<string, unknown>;
    if (
      typeof event.userId !== "string" ||
      (event.status !== "ONLINE" && event.status !== "OFFLINE")
    ) {
      return null;
    }

    return {
      userId: event.userId,
      status: event.status,
    };
  } catch {
    return null;
  }
}

export default function FriendList({
  friends,
  subscribePresence,
}: FriendListProps) {
  const [onlineFriendIds, setOnlineFriendIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    return subscribePresence((payload) => {
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
    });
  }, [subscribePresence]);

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
        <h2 className="text-base font-semibold text-gray-900">Bạn bè</h2>
        <span className="text-sm text-gray-500">{onlineCount} đang online</span>
      </header>

      {sortedFriends.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">Chưa có bạn bè</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sortedFriends.map((friend) => {
            const isOnline = onlineFriendIds.has(friend.id);

            return (
              <li key={friend.id} className="flex items-center gap-3 py-3">
                <div className="relative h-10 w-10 shrink-0">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-medium text-gray-600"
                    >
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span
                    aria-label={isOnline ? "Đang online" : "Offline"}
                    title={isOnline ? "Đang online" : "Offline"}
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      isOnline ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>

                <span className="truncate text-sm font-medium text-gray-800">
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
