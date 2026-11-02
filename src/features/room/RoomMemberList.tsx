import { useState } from 'react';
import { Crown, UserMinus, Users } from 'lucide-react';
import type { UserResponse, UUID } from '../../types';
import { Avatar } from '../../components/ui/display/Avatar';
import { Badge } from '../../components/ui/display/Badge';
import { Button } from '../../components/ui/form/Button';
import { Modal } from '../../components/ui/feedback/Modal';
import { EmptyState } from '../../components/ui/feedback/EmptyState';

export interface RoomMemberListProps {
  members: UserResponse[];
  hostId: UUID;
  currentUserId?: UUID;
  isCurrentUserHost?: boolean;
  onKickMember?: (memberId: UUID) => Promise<boolean | void>;
}

export default function RoomMemberList({
  members,
  hostId,
  currentUserId,
  isCurrentUserHost = false,
  onKickMember,
}: RoomMemberListProps) {
  const [memberToKick, setMemberToKick] = useState<UserResponse | null>(null);
  const [isKicking, setIsKicking] = useState(false);
  const [kickError, setKickError] = useState<string | null>(null);

  async function handleConfirmKick() {
    if (!memberToKick || !onKickMember) return;

    setIsKicking(true);
    setKickError(null);
    try {
      await onKickMember(memberToKick.id);
      setMemberToKick(null);
    } catch (err) {
      setKickError(err instanceof Error ? err.message : 'Không thể xóa thành viên lúc này.');
    } finally {
      setIsKicking(false);
    }
  }

  return (
    <section aria-labelledby="room-members-title" className="space-y-4">
      <header className="flex items-center justify-between border-b border-border pb-3">
        <h2 id="room-members-title" className="flex items-center gap-2 text-heading-sm font-bold text-foreground">
          <Users aria-hidden="true" size={20} className="text-primary" />
          <span>Thành viên trong phòng</span>
        </h2>
        <Badge variant="default" size="sm">
          {members.length} người
        </Badge>
      </header>

      {members.length === 0 ? (
        <EmptyState
          size="sm"
          title="Chưa có thành viên nào"
          description="Hãy chia sẻ mã phòng để mời mọi người cùng tham gia."
        />
      ) : (
        <ul className="divide-y divide-border rounded-card border border-border bg-card p-2 shadow-card" role="list">
          {members.map((member) => {
            const isHost = member.id === hostId;
            const isCurrentUser = Boolean(currentUserId && member.id === currentUserId);
            const canKick = isCurrentUserHost && !isHost;

            return (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/40 rounded-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={member.avatarUrl ?? undefined}
                    name={member.username}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-body font-bold text-foreground">
                        {member.username}
                      </p>
                      {isCurrentUser && (
                        <span className="text-caption font-semibold text-primary">(Bạn)</span>
                      )}
                    </div>
                    {isHost ? (
                      <span className="flex items-center gap-1 text-caption font-semibold text-warning-soft-foreground">
                        <Crown size={13} />
                        Chủ phòng
                      </span>
                    ) : (
                      <p className="truncate text-caption text-muted-foreground">
                        {member.email || 'Thành viên'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isHost && (
                    <Badge variant="warning" size="sm">
                      Host
                    </Badge>
                  )}

                  {canKick && onKickMember && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<UserMinus aria-hidden="true" size={16} />}
                      aria-label={`Xóa ${member.username} khỏi phòng`}
                      onClick={() => {
                        setKickError(null);
                        setMemberToKick(member);
                      }}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal xác nhận đá thành viên */}
      <Modal
        isOpen={memberToKick !== null}
        onClose={() => {
          if (!isKicking) setMemberToKick(null);
        }}
        title="Xác nhận xóa thành viên"
        description={
          memberToKick
            ? `Bạn có chắc chắn muốn mời ${memberToKick.username} ra khỏi phòng ăn này?`
            : undefined
        }
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isKicking}
              onClick={() => setMemberToKick(null)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={isKicking}
              loadingText="Đang xóa..."
              onClick={() => void handleConfirmKick()}
            >
              Xóa khỏi phòng
            </Button>
          </div>
        }
      >
        {kickError && (
          <p role="alert" className="mt-2 text-body-sm text-danger">
            {kickError}
          </p>
        )}
      </Modal>
    </section>
  );
}
