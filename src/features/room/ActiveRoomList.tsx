import { Plus, Users, Utensils } from 'lucide-react';
import type { RoomResponse } from '../../types';
import { Card } from '../../components/ui/display/Card';
import { Badge } from '../../components/ui/display/Badge';
import { Button } from '../../components/ui/form/Button';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { Alert } from '../../components/ui/feedback/Alert';
import { EmptyState } from '../../components/ui/feedback/EmptyState';

export interface ActiveRoomListProps {
  rooms: RoomResponse[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectRoom?: (room: RoomResponse) => void;
  onCreateRoomClick?: () => void;
  onJoinRoomClick?: () => void;
}

const roomStatusMeta = {
  OPEN: { label: 'Phòng chờ', variant: 'info' as const },
  SWIPING: { label: 'Đang quẹt thẻ', variant: 'success' as const },
  CLOSED: { label: 'Đã đóng', variant: 'default' as const },
};

function formatCreatedDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export default function ActiveRoomList({
  rooms,
  isLoading = false,
  error = null,
  onRetry,
  onSelectRoom,
  onCreateRoomClick,
  onJoinRoomClick,
}: ActiveRoomListProps) {
  return (
    <section aria-labelledby="active-rooms-title" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 id="active-rooms-title" className="text-heading-sm font-bold text-foreground">
            Phòng ăn đang hoạt động
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Danh sách các phòng bạn đã tạo hoặc đang tham gia
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Làm mới
            </Button>
          )}
          {onCreateRoomClick && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus aria-hidden="true" size={16} />}
              onClick={onCreateRoomClick}
            >
              Tạo phòng
            </Button>
          )}
        </div>
      </header>

      {error && (
        <Alert
          variant="danger"
          title="Không tải được danh sách phòng"
          action={
            onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Thử lại
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Đang tải danh sách phòng ăn của bạn..." />
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Bạn chưa tham gia phòng nào"
          description="Hãy tạo phòng ăn mới hoặc nhập mã phòng do bạn bè chia sẻ để cùng tìm món ngon."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {onCreateRoomClick && (
                <Button variant="primary" onClick={onCreateRoomClick}>
                  Tạo phòng mới
                </Button>
              )}
              {onJoinRoomClick && (
                <Button variant="outline" onClick={onJoinRoomClick}>
                  Tham gia bằng mã
                </Button>
              )}
            </div>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2" role="list">
          {rooms.map((room) => {
            const status = roomStatusMeta[room.status] ?? roomStatusMeta.OPEN;
            const memberCount = room.members?.length ?? 1;

            return (
              <li key={room.id}>
                <div
                  role="button"
                  tabIndex={0}
                  className="focus-ring block h-full rounded-card cursor-pointer transition-all hover:scale-[1.01]"
                  onClick={() => onSelectRoom?.(room)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRoom?.(room);
                    }
                  }}
                  aria-label={`Mở phòng ăn ${room.name || room.roomCode}`}
                >
                  <Card
                    as="article"
                    className="h-full border border-border transition-shadow hover:shadow-card bg-card"
                    headerAction={<Badge variant={status.variant}>{status.label}</Badge>}
                    title={room.name || 'Phòng ăn nhóm'}
                    description={`Mã phòng: ${room.roomCode}`}
                  >
                    <div className="mt-3 space-y-2 border-t border-border pt-3 text-body-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Utensils size={14} className="text-primary" />
                          <span>Chủ phòng:</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {room.host.username}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-primary" />
                          <span>Thành viên:</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {memberCount} người
                        </span>
                      </div>

                      <div className="text-caption text-muted-foreground pt-1">
                        Tạo lúc: {formatCreatedDate(room.createdAt)}
                      </div>
                    </div>
                  </Card>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
