import { useRef, useState } from "react";
import { Alert, Button, Modal } from "../../components/ui";
import type { RoomResponse, UserResponse } from "../../types/api";

type ConfirmAction = "close" | "delete" | "leave" | { type: "kick"; userId: string };

export interface RoomHostControlsProps {
  room: RoomResponse;
  currentUserId: string;
  members: UserResponse[];
  onStart: () => Promise<void> | void;
  onClose: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onLeave: () => Promise<void> | void;
  onKickMember: (userId: string) => Promise<void> | void;
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Không thể hoàn tất thao tác. Vui lòng thử lại.";
}

export default function RoomHostControls({
  room,
  currentUserId,
  members,
  onStart,
  onClose,
  onDelete,
  onLeave,
  onKickMember,
}: RoomHostControlsProps) {
  const [pendingAction, setPendingAction] = useState<ConfirmAction | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isHost = room.host.id === currentUserId;
  const kickableMembers = members.filter((member) => member.id !== room.host.id);

  const confirmation = pendingAction === "delete"
    ? {
        title: "Xóa phòng ăn?",
        message: "Phòng sẽ bị xóa hoàn toàn và các thành viên không thể tiếp tục tham gia.",
        confirmLabel: "Xóa phòng",
        variant: "danger" as const,
      }
    : pendingAction === "close"
      ? {
          title: "Đóng phòng ăn?",
          message: "Thành viên sẽ không thể tiếp tục hoạt động trong phòng này.",
          confirmLabel: "Đóng phòng",
          variant: "danger" as const,
        }
      : pendingAction === "leave"
        ? {
            title: "Rời khỏi phòng?",
            message: "Bạn sẽ rời khỏi danh sách thành viên của phòng.",
            confirmLabel: "Rời phòng",
            variant: "danger" as const,
          }
        : pendingAction
          ? {
              title: "Xóa thành viên khỏi phòng?",
              message: "Thành viên này sẽ bị đưa ra khỏi phòng.",
              confirmLabel: "Xóa thành viên",
              variant: "danger" as const,
            }
          : null;

  async function handleStart() {
    setError(null);
    setIsPending(true);
    try {
      await onStart();
    } catch (startError) {
      setError(errorMessage(startError));
    } finally {
      setIsPending(false);
    }
  }

  async function handleConfirm() {
    if (!pendingAction) return;

    setError(null);
    setIsPending(true);
    try {
      if (pendingAction === "delete") {
        await onDelete();
      } else if (pendingAction === "close") {
        await onClose();
      } else if (pendingAction === "leave") {
        await onLeave();
      } else {
        await onKickMember(pendingAction.userId);
      }
      setPendingAction(null);
    } catch (actionError) {
      setError(errorMessage(actionError));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section aria-labelledby="room-controls-title" className="space-y-4">
      <h2 id="room-controls-title" className="text-heading-sm font-bold text-foreground">
        Điều khiển phòng
      </h2>

      {error && !pendingAction && <Alert variant="danger" title="Thao tác thất bại">{error}</Alert>}

      <div className="flex flex-wrap gap-3">
        {isHost && room.status === "OPEN" && (
          <Button
            onClick={() => void handleStart()}
            loading={isPending}
            loadingText="Đang bắt đầu..."
            disabled={isPending}
          >
            Bắt đầu quẹt
          </Button>
        )}

        {isHost && room.status !== "CLOSED" && (
          <Button
            variant="danger"
            onClick={() => setPendingAction("close")}
            disabled={isPending}
          >
            Đóng phòng
          </Button>
        )}

        {isHost && (
          <Button
            variant="outline"
            onClick={() => setPendingAction("delete")}
            disabled={isPending}
          >
            Xóa phòng
          </Button>
        )}

        {!isHost && (
          <Button
            variant="danger"
            onClick={() => setPendingAction("leave")}
            disabled={isPending}
          >
            Rời phòng
          </Button>
        )}
      </div>

      {isHost && room.status === "OPEN" && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-1.5">
            <label htmlFor="room-kick-member" className="block text-caption font-semibold text-foreground">
              Xóa thành viên
            </label>
            <select
              id="room-kick-member"
              value={selectedMemberId}
              onChange={(event) => setSelectedMemberId(event.currentTarget.value)}
              disabled={kickableMembers.length === 0 || isPending}
              className="focus-ring h-11 w-full rounded-control border border-input bg-card px-4 text-body text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Chọn thành viên</option>
              {kickableMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.username}</option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            disabled={!selectedMemberId || isPending}
            onClick={() => setPendingAction({ type: "kick", userId: selectedMemberId })}
          >
            Xóa khỏi phòng
          </Button>
        </div>
      )}

      <Modal
        isOpen={pendingAction !== null}
        onClose={() => {
          if (!isPending) setPendingAction(null);
        }}
        title={confirmation?.title ?? ""}
        description={confirmation?.message}
        initialFocusRef={cancelButtonRef}
        closeOnOverlayClick={!isPending}
        closeOnEsc={!isPending}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              ref={cancelButtonRef}
              variant="secondary"
              disabled={isPending}
              onClick={() => setPendingAction(null)}
            >
              Hủy
            </Button>
            <Button
              variant={confirmation?.variant ?? "danger"}
              loading={isPending}
              loadingText="Đang xử lý..."
              onClick={() => void handleConfirm()}
            >
              {confirmation?.confirmLabel ?? "Xác nhận"}
            </Button>
          </div>
        }
      >
        {pendingAction && error && <Alert variant="danger">{error}</Alert>}
      </Modal>
    </section>
  );
}
