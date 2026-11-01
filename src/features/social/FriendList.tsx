import { useEffect, useMemo, useRef, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { UserRoundX } from "lucide-react";
import { Avatar } from "../../components/ui/display/Avatar";
import { Button } from "../../components/ui/form/Button";
import { EmptyState } from "../../components/ui/feedback/EmptyState";
import { Modal } from "../../components/ui/feedback/Modal";

export interface Friend {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

type PresenceEvent = {
  userId: string;
  status: "ONLINE" | "OFFLINE";
};

type FriendListProps = {
  friends: Friend[];
  onRemoveFriend?: (friendId: string) => Promise<void>;
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

  return { userId: parsed.userId, status: parsed.status };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Không thể hủy kết bạn. Vui lòng thử lại.";
}

export default function FriendList({
  friends,
  onRemoveFriend,
  socketClient,
  socketConnected = false,
  presenceTopic,
  subscribePresence,
}: FriendListProps) {
  const [onlineFriendIds, setOnlineFriendIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const removeInProgress = useRef(false);

  useEffect(() => {
    const handlePresence = (payload: string) => {
      const event = parsePresenceEvent(payload);
      if (!event) return;

      setOnlineFriendIds((currentIds) => {
        const nextIds = new Set(currentIds);
        if (event.status === "ONLINE") nextIds.add(event.userId);
        else nextIds.delete(event.userId);
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

  async function confirmRemoveFriend() {
    if (!friendToRemove || !onRemoveFriend || removeInProgress.current) return;

    removeInProgress.current = true;
    setIsRemoving(true);
    setRemoveError(null);
    try {
      await onRemoveFriend(friendToRemove.id);
      setFriendToRemove(null);
    } catch (error) {
      setRemoveError(getErrorMessage(error));
    } finally {
      removeInProgress.current = false;
      setIsRemoving(false);
    }
  }

  function closeRemoveDialog() {
    if (removeInProgress.current) return;
    setFriendToRemove(null);
    setRemoveError(null);
  }

  return (
    <>
      <section className="w-full" aria-label="Danh sách bạn bè">
        <header className="mb-3 flex items-center justify-between gap-3">
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
                  <span className="min-w-0 flex-1 truncate text-body font-semibold text-foreground">
                    {friend.username}
                  </span>
                  {onRemoveFriend && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<UserRoundX aria-hidden="true" size={16} />}
                      aria-label={`Hủy kết bạn với ${friend.username}`}
                      onClick={() => {
                        setRemoveError(null);
                        setFriendToRemove(friend);
                      }}
                    >
                      Hủy kết bạn
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Modal
        isOpen={friendToRemove !== null}
        onClose={closeRemoveDialog}
        title="Hủy kết bạn"
        description={
          friendToRemove
            ? `Bạn có chắc muốn hủy kết bạn với ${friendToRemove.username}?`
            : undefined
        }
        size="sm"
        closeOnOverlayClick={!isRemoving}
        closeOnEsc={!isRemoving}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isRemoving}
              onClick={closeRemoveDialog}
            >
              Giữ lại
            </Button>
            <Button
              variant="danger"
              loading={isRemoving}
              loadingText="Đang hủy..."
              onClick={() => void confirmRemoveFriend()}
            >
              Hủy kết bạn
            </Button>
          </div>
        }
      >
        {removeError && (
          <p role="alert" className="text-body-sm text-danger">
            {removeError}
          </p>
        )}
      </Modal>
    </>
  );
}
