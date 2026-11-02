import { useEffect, useMemo, useRef, useState } from 'react';
import type { Client } from '@stomp/stompjs';
import { UserRoundX } from 'lucide-react';
import type { UserResponse } from '../../types';
import { Button } from '../../components/ui/form/Button';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Modal } from '../../components/ui/feedback/Modal';
import { ListItem } from '../../components/ui/display/ListItem';
import { Badge } from '../../components/ui/display/Badge';

export interface FriendListProps {
  friends: UserResponse[];
  onRemoveFriend?: (friendId: string) => Promise<boolean | void>;
  socketClient?: Client;
  socketConnected?: boolean;
  presenceTopic?: string;
  subscribePresence?: (onMessage: (payload: string) => void) => () => void;
}

type PresenceEvent = {
  userId: string;
  status: 'ONLINE' | 'OFFLINE';
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parsePresenceEvent(payload: string): PresenceEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    console.error('Không thể đọc cập nhật trạng thái bạn bè từ WebSocket.', error);
    return null;
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.userId !== 'string' ||
    !parsed.userId ||
    (parsed.status !== 'ONLINE' && parsed.status !== 'OFFLINE')
  ) {
    return null;
  }

  return { userId: parsed.userId, status: parsed.status };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Không thể hủy kết bạn. Vui lòng thử lại.';
}

export default function FriendList({
  friends,
  onRemoveFriend,
  socketClient,
  socketConnected = false,
  presenceTopic,
  subscribePresence,
}: FriendListProps) {
  const [onlineFriendIds, setOnlineFriendIds] = useState<Set<string>>(() => new Set());
  const [friendToRemove, setFriendToRemove] = useState<UserResponse | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const removeInProgress = useRef(false);

  useEffect(() => {
    const handlePresence = (payload: string) => {
      const event = parsePresenceEvent(payload);
      if (!event) return;

      setOnlineFriendIds((currentIds) => {
        const nextIds = new Set(currentIds);
        if (event.status === 'ONLINE') nextIds.add(event.userId);
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
  }, [presenceTopic, socketClient, socketConnected, subscribePresence]);

  const sortedFriends = useMemo(
    () =>
      [...friends].sort(
        (first, second) =>
          Number(onlineFriendIds.has(second.id)) - Number(onlineFriendIds.has(first.id)),
      ),
    [friends, onlineFriendIds],
  );

  const onlineCount = friends.filter((friend) => onlineFriendIds.has(friend.id)).length;

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
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-heading-sm font-bold text-foreground">Bạn bè</h2>
            <Badge variant="default" size="sm">
              {friends.length}
            </Badge>
          </div>
          <span className="text-body-sm text-muted-foreground" aria-live="polite">
            {onlineCount > 0 ? (
              <Badge variant="success" size="sm" dot>
                {onlineCount} đang online
              </Badge>
            ) : (
              'Chưa có bạn bè online'
            )}
          </span>
        </header>

        {sortedFriends.length === 0 ? (
          <EmptyState
            title="Chưa có bạn bè"
            description="Kết bạn để cùng nhau tìm quán ăn và tạo phòng quẹt thẻ nhé!"
            size="sm"
          />
        ) : (
          <ul className="divide-y divide-border rounded-card border border-border bg-card p-2 shadow-card" role="list">
            {sortedFriends.map((friend) => {
              const isOnline = onlineFriendIds.has(friend.id);

              return (
                <ListItem
                  key={friend.id}
                  as="li"
                  title={friend.username}
                  subtitle={friend.email || undefined}
                  avatarUrl={friend.avatarUrl ?? undefined}
                  isOnline={isOnline}
                  className="px-3 hover:bg-muted/50 transition-colors"
                  action={
                    onRemoveFriend && (
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
                    )
                  }
                />
              );
            })}
          </ul>
        )}
      </section>

      <Modal
        isOpen={friendToRemove !== null}
        onClose={closeRemoveDialog}
        title="Xác nhận hủy kết bạn"
        description={
          friendToRemove
            ? `Bạn có chắc muốn hủy kết bạn với ${friendToRemove.username}? Hai bạn sẽ không thể cùng quẹt thẻ nhóm nếu chưa kết bạn lại.`
            : undefined
        }
        size="sm"
        closeOnOverlayClick={!isRemoving}
        closeOnEsc={!isRemoving}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" disabled={isRemoving} onClick={closeRemoveDialog}>
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
          <p role="alert" className="text-body-sm text-danger mt-2">
            {removeError}
          </p>
        )}
      </Modal>
    </>
  );
}
