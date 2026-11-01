import { useEffect, useState } from "react";

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
  subscribeInvitations: (onMessage: (payload: string) => void) => () => void;
  respondToInvitation: (
    invitationId: string,
    decision: InviteDecision,
  ) => Promise<void>;
};

function parseInvitation(payload: string): RoomInvitation | null {
  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed !== "object" || parsed === null) return null;

    const event = parsed as Record<string, unknown>;

    if (
      typeof event.invitationId !== "string" ||
      typeof event.roomId !== "string" ||
      typeof event.inviterName !== "string"
    ) {
      return null;
    }

    return {
      invitationId: event.invitationId,
      roomId: event.roomId,
      inviterName: event.inviterName,
      roomName:
        typeof event.roomName === "string" ? event.roomName : "phòng ăn",
    };
  } catch {
    return null;
  }
}

export default function InvitePopup({
  subscribeInvitations,
  respondToInvitation,
}: InvitePopupProps) {
  const [invitation, setInvitation] = useState<RoomInvitation | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeInvitations((payload) => {
      const nextInvitation = parseInvitation(payload);
      if (!nextInvitation) return;

      setInvitation(nextInvitation);
      setPendingAction(null);
      setError(null);
    });
  }, [subscribeInvitations]);

  async function handleResponse(decision: InviteDecision) {
    if (!invitation) return;

    const invitationId = invitation.invitationId;
    setPendingAction({ invitationId, decision });
    setError(null);

    try {
      await respondToInvitation(invitationId, decision);
      setInvitation((current) =>
        current?.invitationId === invitationId ? null : current,
      );
    } catch {
      setError("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setPendingAction((current) =>
        current?.invitationId === invitationId ? null : current,
      );
    }
  }

  if (!invitation) return null;

  const isPending = pendingAction?.invitationId === invitation.invitationId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-invitation-title"
        className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
      >
        <h2
          id="room-invitation-title"
          className="text-lg font-semibold text-gray-900"
        >
          Lời mời vào phòng
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          <span className="font-medium text-gray-900">
            {invitation.inviterName}
          </span>{" "}
          mời bạn tham gia {invitation.roomName}.
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => void handleResponse("DECLINE")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction?.decision === "DECLINE" && isPending
              ? "Đang từ chối..."
              : "Từ chối"}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => void handleResponse("ACCEPT")}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction?.decision === "ACCEPT" && isPending
              ? "Đang tham gia..."
              : "Tham gia"}
          </button>
        </div>
      </section>
    </div>
  );
}
