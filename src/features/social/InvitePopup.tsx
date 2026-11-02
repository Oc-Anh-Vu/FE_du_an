import { useState } from 'react';
import type { Client } from '@stomp/stompjs';
import { DoorOpen, Users } from 'lucide-react';
import { Button } from '../../components/ui/form/Button';
import { Modal } from '../../components/ui/feedback/Modal';
import { Avatar } from '../../components/ui/display/Avatar';
import { Badge } from '../../components/ui/display/Badge';
import { useUIStore } from '../../store/uiStore';

export interface InvitePopupProps {
  onAcceptInvite?: (roomId: string, roomCode: string) => void | Promise<void>;
  onDeclineInvite?: () => void | Promise<void>;
  socketClient?: Client;
  socketConnected?: boolean;
  invitationTopic?: string;
  subscribeInvitations?: (onMessage: (payload: string) => void) => () => void;
  respondToInvitation?: (invitationId: string, decision: 'ACCEPT' | 'DECLINE') => Promise<void>;
}

export default function InvitePopup({
  onAcceptInvite,
  onDeclineInvite,
}: InvitePopupProps) {
  const inviteModal = useUIStore((state) => state.inviteModal);
  const closeInviteModal = useUIStore((state) => state.closeInviteModal);

  const [isJoining, setIsJoining] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!inviteModal.isOpen || !inviteModal.payload) {
    return null;
  }

  const { roomId = '', roomCode, roomName, inviterName, inviterAvatarUrl } = inviteModal.payload;

  async function handleAccept() {
    setIsJoining(true);
    setError(null);
    try {
      if (onAcceptInvite) {
        await onAcceptInvite(roomId, roomCode);
      }
      closeInviteModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tham gia phòng ăn lúc này.');
    } finally {
      setIsJoining(false);
    }
  }

  async function handleDecline() {
    setIsDeclining(true);
    setError(null);
    try {
      if (onDeclineInvite) {
        await onDeclineInvite();
      }
      closeInviteModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể từ chối lời mời.');
    } finally {
      setIsDeclining(false);
    }
  }

  return (
    <Modal
      isOpen={inviteModal.isOpen}
      onClose={() => {
        if (!isJoining && !isDeclining) {
          closeInviteModal();
        }
      }}
      title="Lời mời tham gia phòng ăn"
      size="sm"
      closeOnOverlayClick={!isJoining && !isDeclining}
      closeOnEsc={!isJoining && !isDeclining}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={isJoining || isDeclining}
            loading={isDeclining}
            loadingText="Đang từ chối..."
            onClick={() => void handleDecline()}
          >
            Từ chối
          </Button>
          <Button
            variant="primary"
            leftIcon={<DoorOpen aria-hidden="true" size={16} />}
            disabled={isJoining || isDeclining}
            loading={isJoining}
            loadingText="Đang vào phòng..."
            onClick={() => void handleAccept()}
          >
            Vào phòng ngay
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="info" size="sm">
            [PENDING_BACKEND]
          </Badge>
          <span className="text-caption text-muted-foreground">Tính năng sắp ra mắt</span>
        </div>

        <div className="flex items-center gap-3 rounded-card border border-border bg-muted/40 p-3">
          <Avatar
            src={inviterAvatarUrl ?? undefined}
            name={inviterName}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="text-body font-bold text-foreground">
              {inviterName}
            </p>
            <p className="text-body-sm text-muted-foreground">
              vừa gửi lời mời bạn cùng quẹt thẻ chọn món!
            </p>
          </div>
        </div>

        <div className="rounded-card border border-border bg-card p-3 space-y-2">
          <div className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
            <Users size={16} className="text-primary" />
            <span>Phòng: {roomName || 'Hội Ăn Uống'}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-muted-foreground">Mã phòng:</span>
            <span className="font-mono font-bold tracking-wider text-primary-strong">
              {roomCode}
            </span>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-body-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
