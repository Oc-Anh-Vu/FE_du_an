import { useRef, useState } from "react";
import type { FriendshipResponse } from "../../types/api";
import { Avatar } from "../../components/ui/display/Avatar";
import { Button } from "../../components/ui/form/Button";
import { EmptyState } from "../../components/ui/feedback/EmptyState";
import { Spinner } from "../../components/ui/feedback/Spinner";

type RequestTab = "incoming" | "outgoing";

export interface FriendRequestTabsProps {
  incomingRequests: FriendshipResponse[];
  outgoingRequests: FriendshipResponse[];
  onAccept: (requesterId: string) => Promise<void>;
  onDecline: (requesterId: string) => Promise<void>;
  onCancel: (addresseeId: string) => Promise<void>;
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
  loadError?: string | null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Không thể cập nhật lời mời. Vui lòng thử lại.";
}

function formatRequestDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
  const [activeTab, setActiveTab] = useState<RequestTab>("incoming");
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const actionInProgress = useRef(false);

  const requests =
    activeTab === "incoming" ? incomingRequests : outgoingRequests;

  async function performAction(
    requestId: string,
    callback: (id: string) => Promise<void>,
  ) {
    if (actionInProgress.current) return;

    actionInProgress.current = true;
    setPendingRequestId(requestId);
    setActionError(null);
    try {
      await callback(requestId);
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
          aria-selected={activeTab === "incoming"}
          aria-controls="friend-requests-panel"
          className={`focus-ring -mb-px border-b-2 px-3 py-2 text-body-sm font-semibold ${
            activeTab === "incoming"
              ? "border-primary text-primary-strong"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => {
            setActiveTab("incoming");
            setActionError(null);
          }}
        >
          Đã nhận
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-caption">
            {incomingRequests.length}
          </span>
        </button>
        <button
          id="friend-requests-outgoing-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "outgoing"}
          aria-controls="friend-requests-panel"
          className={`focus-ring -mb-px border-b-2 px-3 py-2 text-body-sm font-semibold ${
            activeTab === "outgoing"
              ? "border-primary text-primary-strong"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => {
            setActiveTab("outgoing");
            setActionError(null);
          }}
        >
          Đã gửi
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-caption">
            {outgoingRequests.length}
          </span>
        </button>
      </div>

      <div
        id="friend-requests-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === "incoming"
            ? "friend-requests-incoming-tab"
            : "friend-requests-outgoing-tab"
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
            <Spinner label="Đang tải lời mời kết bạn" />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title={
              activeTab === "incoming"
                ? "Chưa có lời mời mới"
                : "Bạn chưa gửi lời mời nào"
            }
            description={
              activeTab === "incoming"
                ? "Khi có người muốn kết bạn, lời mời sẽ xuất hiện ở đây."
                : "Tìm người dùng để gửi lời mời kết bạn nhé."
            }
            size="sm"
          />
        ) : (
          <ul className="divide-y divide-border">
            {requests.map((request) => {
              const isIncoming = activeTab === "incoming";
              const person = isIncoming ? request.requester : request.addressee;
              const date = formatRequestDate(request.createdAt);
              const isPending = pendingRequestId === person.id;

              return (
                <li
                  key={`${activeTab}-${person.id}`}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <Avatar
                    src={person.avatarUrl ?? undefined}
                    name={person.username}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-foreground">
                      {person.username}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {isIncoming ? "Muốn kết bạn với bạn" : "Đang chờ phản hồi"}
                      {date ? ` · ${date}` : ""}
                    </p>
                  </div>

                  {isIncoming ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={pendingRequestId !== null}
                        loading={isPending}
                        loadingText="Đang xử lý..."
                        onClick={() =>
                          void                           performAction(
                            person.id,
                            onAccept,
                          )
                        }
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingRequestId !== null}
                        onClick={() =>
                          void                           performAction(
                            person.id,
                            onDecline,
                          )
                        }
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
                      onClick={() =>
                        void performAction(person.id, onCancel)
                      }
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
