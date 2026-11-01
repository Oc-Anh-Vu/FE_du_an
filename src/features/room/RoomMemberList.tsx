import { Crown, Users } from "lucide-react";
import { Avatar, Badge, EmptyState } from "../../components/ui";
import type { UserResponse } from "../../types/api";

export interface RoomMemberListProps {
  members: UserResponse[];
  hostId: string;
  currentUserId?: string;
}

export default function RoomMemberList({
  members,
  hostId,
  currentUserId,
}: RoomMemberListProps) {
  return (
    <section aria-labelledby="room-members-title" className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h2 id="room-members-title" className="flex items-center gap-2 text-heading-sm font-bold text-foreground">
          <Users aria-hidden="true" className="size-5 text-primary-strong" />
          Thành viên
        </h2>
        <Badge>{members.length} thành viên</Badge>
      </header>

      {members.length === 0 ? (
        <EmptyState
          size="sm"
          title="Chưa có thành viên"
          description="Chia sẻ mã phòng để mời mọi người tham gia."
        />
      ) : (
        <ul className="divide-y divide-border">
          {members.map((member) => {
            const isHost = member.id === hostId;
            const isCurrentUser = member.id === currentUserId;

            return (
              <li key={member.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={member.avatarUrl ?? undefined}
                    name={member.username}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-semibold text-foreground">
                      {member.username}
                      {isCurrentUser && <span className="ml-1 font-normal text-muted-foreground">(Bạn)</span>}
                    </p>
                    {isHost && (
                      <span className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-warning-soft-foreground">
                        <Crown aria-hidden="true" size={14} />
                        Chủ phòng
                      </span>
                    )}
                  </div>
                </div>
                {isHost && <Badge variant="warning" size="sm">Host</Badge>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
