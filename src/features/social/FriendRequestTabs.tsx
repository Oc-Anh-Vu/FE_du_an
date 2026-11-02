import { useRef, useState } from 'react';
import type { FriendshipResponse, UUID } from '../../types';
import { Avatar } from '../../components/ui/display/Avatar';
import { Badge } from '../../components/ui/display/Badge';
import { Button } from '../../components/ui/form/Button';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Spinner } from '../../components/ui/feedback/Spinner';

type RequestTab = 'incoming' | 'outgoing';

export interface FriendRequestTabsProps {
  incomingRequests: FriendshipResponse[];
  outgoingRequests: FriendshipResponse[];
  onAccept: (requesterId: UUID) => Promise<boolean | void>;
  onDecline: (requesterId: UUID) => Promise<boolean | void>;
  onCancel: (addresseeId: UUID) => Promise<boolean | void>;
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
  loadError?: string | null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Không thể cập nhật lời mời. Vui lòng thử lại.';
}

function formatRequestDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function FriendRequestTabs({
  incomingRequests,
  outgoingRequests,
  onAccept,
  onDecline,
  onCancel,
  onRefresh,
  isLoading = false,
  loadError,
}: FriendRequestTabsProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>('incoming');
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const actionInProgress = useRef(false);

  const requests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  async function performAction(
    targetId: UUID,
    callback: (id: UUID) => Promise<boolean | void>,
  ) {
    if (actionInProgress.current) return;

    actionInProgress.current = true;
    setPendingRequestId(targetId);
    setActionError(null);
    try {
      await callback(targetId);
      await onRefresh?.();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      actionInProgress.current = false;
      setPendingRequestId(null);
    }
  }

  return (
    <section aria-label="Lời mời kết bạn" className="w-full">
      <div
        role="tablist"
        aria-label="Loại lời mời kết bạn"
        className="mb-4 flex gap-2 border-b border-border"
      >
        <button
          id="friend-requests-incoming-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'incoming'}
          aria-controls="friend-requests-panel"
          className={`focus-ring -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-body-sm font-semibold transition-colors ${
            activeTab === 'incoming'
              ? 'border-primary text-primary-strong'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => {
            setActiveTab('incoming');
            setActionError(null);
          }}
        >
          <span>Đã nhận</span>
          <Badge variant={activeTab === 'incoming' ? 'info' : 'default'} size="sm">
            {incomingRequests.length}
          </Badge>
        </button>

        <button
          id="friend-requests-outgoing-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'outgoing'}
          aria-controls="friend-requests-panel"
          className={`focus-ring -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-body-sm font-semibold transition-colors ${
            activeTab === 'outgoing'
              ? 'border-primary text-primary-strong'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => {
            setActiveTab('outgoing');
            setActionError(null);
          }}
        >
          <span>Đã gửi</span>
          <Badge variant={activeTab === 'outgoing' ? 'info' : 'default'} size="sm">
            {outgoingRequests.length}
          </Badge>
        </button>
      </div>

      <div
        id="friend-requests-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === 'incoming'
            ? 'friend-requests-incoming-tab'
            : 'friend-requests-outgoing-tab'
        }
        tabIndex={0}
      >
        {loadError && (
          <p role="alert" className="mb-3 text-body-sm text-danger">
            {loadError}
          </p>
        )}
        {actionError && (
          <p role="alert" className="mb-3 text-body-sm text-danger">
            {actionError}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Đang tải danh sách lời mời..." />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title={
              activeTab === 'incoming'
                ? 'Chưa có lời mời nào gửi đến bạn'
                : 'Bạn chưa gửi lời mời kết bạn nào'
            }
            description={
              activeTab === 'incoming'
                ? 'Khi ai đó gửi lời mời kết bạn, danh sách sẽ hiển thị tại đây để bạn duyệt.'
                : 'Hãy tìm kiếm bạn bè bằng tên hoặc UUID để kết nối cùng nhau.'
            }
            size="sm"
          />
        ) : (
          <ul className="divide-y divide-border rounded-card border border-border bg-card p-2 shadow-card" role="list">
            {requests.map((request) => {
              const isIncoming = activeTab === 'incoming';
              const person = isIncoming ? request.requester : request.addressee;
              const date = formatRequestDate(request.createdAt);
              const isPending = pendingRequestId === person.id;

              return (
                <li
                  key={`${activeTab}-${person.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/50 rounded-card"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={person.avatarUrl ?? undefined}
                      name={person.username}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-body font-bold text-foreground">
                        {person.username}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {isIncoming ? 'Muốn kết bạn với bạn' : 'Đang chờ đối phương chấp nhận'}
                        {date ? ` · ${date}` : ''}
                      </p>
                    </div>
                  </div>

                  {isIncoming ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={pendingRequestId !== null}
                        loading={isPending}
                        loadingText="Đang chấp nhận..."
                        onClick={() => void performAction(person.id, onAccept)}
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingRequestId !== null}
                        onClick={() => void performAction(person.id, onDecline)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingRequestId !== null}
                      loading={isPending}
                      loadingText="Đang thu hồi..."
                      onClick={() => void performAction(person.id, onCancel)}
                    >
                      Thu hồi
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
