import { useEffect, useRef, useState } from "react";
import type { Client } from "@stomp/stompjs";
import { Button } from "../../components/ui/form/Button";
import { Modal } from "../../components/ui/feedback/Modal";

type RoomInvitation = {
  invitationId: string;
  roomId: string;
  inviterName: string;
  roomName: string;
};

type InviteDecision = "ACCEPT" | "DECLINE";

type PendingAction = {
  invitationId: string;
  decision: InviteDecision;
};

type InvitePopupProps = {
  socketClient?: Client;
  socketConnected?: boolean;
  invitationTopic?: string;
  subscribeInvitations?: (
    onMessage: (payload: string) => void,
  ) => () => void;
  respondToInvitation: (
    invitationId: string,
    decision: InviteDecision,
  ) => Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseInvitation(payload: string): RoomInvitation | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    console.error("Không thể đọc lời mời vào phòng từ WebSocket.", error);
    return null;
  }

  if (
    !isRecord(parsed) ||
    typeof parsed.invitationId !== "string" ||
    !parsed.invitationId ||
    typeof parsed.roomId !== "string" ||
    !parsed.roomId ||
    typeof parsed.inviterName !== "string" ||
    !parsed.inviterName
  ) {
    return null;
  }

  return {
    invitationId: parsed.invitationId,
    roomId: parsed.roomId,
    inviterName: parsed.inviterName,
    roomName:
      typeof parsed.roomName === "string" && parsed.roomName
        ? parsed.roomName
        : "phòng ăn",
  };
}

export default function InvitePopup({
  socketClient,
  socketConnected = false,
  invitationTopic,
  subscribeInvitations,
  respondToInvitation,
}: InvitePopupProps) {
  const [invitations, setInvitations] = useState<RoomInvitation[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const responseInProgress = useRef(false);
  const invitation = invitations[0] ?? null;

  useEffect(() => {
    const handleInvitation = (payload: string) => {
      const nextInvitation = parseInvitation(payload);
      if (!nextInvitation) return;

      setInvitations((currentInvitations) => {
        if (
          currentInvitations.some(
            (current) => current.invitationId === nextInvitation.invitationId,
          )
        ) {
          return currentInvitations;
        }
        return [...currentInvitations, nextInvitation];
      });
    };

    if (
      invitationTopic &&
      socketConnected &&
      socketClient?.connected
    ) {
      const subscription = socketClient.subscribe(
        invitationTopic,
        (message) => handleInvitation(message.body),
      );

      return () => subscription.unsubscribe();
    }

    return subscribeInvitations?.(handleInvitation);
  }, [
    invitationTopic,
    socketClient,
    socketConnected,
    subscribeInvitations,
  ]);

  async function handleResponse(decision: InviteDecision) {
    if (!invitation || responseInProgress.current) return;

    const invitationId = invitation.invitationId;
    responseInProgress.current = true;
    setPendingAction({ invitationId, decision });
    setError(null);

    try {
      await respondToInvitation(invitationId, decision);
      setInvitations((current) =>
        current.filter((item) => item.invitationId !== invitationId),
      );
      setError(null);
    } catch (responseError) {
      setError(
        responseError instanceof Error
          ? responseError.message
          : "Không thể gửi phản hồi. Vui lòng thử lại.",
      );
    } finally {
      responseInProgress.current = false;
      setPendingAction((current) =>
        current?.invitationId === invitationId ? null : current,
      );
    }
  }

  function closeInvitation() {
    if (responseInProgress.current) return;
    setInvitations((current) => current.slice(1));
    setError(null);
  }

  if (!invitation) return null;

  const isPending = pendingAction?.invitationId === invitation.invitationId;

  return (
    <Modal
      isOpen
      onClose={closeInvitation}
      title="Lời mời vào phòng"
      size="sm"
      closeOnOverlayClick={!isPending}
      closeOnEsc={!isPending}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={isPending}
            loading={pendingAction?.decision === "DECLINE" && isPending}
            loadingText="Đang từ chối..."
            onClick={() => void handleResponse("DECLINE")}
          >
            Từ chối
          </Button>
          <Button
            disabled={isPending}
            loading={pendingAction?.decision === "ACCEPT" && isPending}
            loadingText="Đang tham gia..."
            onClick={() => void handleResponse("ACCEPT")}
          >
            Tham gia
          </Button>
        </div>
      }
    >
      <p className="text-body text-muted-foreground">
        <span className="font-semibold text-foreground">
          {invitation.inviterName}
        </span>{" "}
        mời bạn tham gia {invitation.roomName}.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-body-sm text-danger">
          {error}
        </p>
      )}
    </Modal>
  );
}
