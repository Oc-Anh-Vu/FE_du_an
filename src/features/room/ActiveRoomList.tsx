import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, EmptyState, Spinner, buttonVariants } from "../../components/ui";
import type { RoomResponse } from "../../types/api";

export interface ActiveRoomListProps {
  rooms: RoomResponse[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const roomStatusLabels = {
  OPEN: { label: "Phòng chờ", variant: "info" as const },
  SWIPING: { label: "Đang quẹt", variant: "success" as const },
  CLOSED: { label: "Đã đóng", variant: "default" as const },
};

function getRoomPath(room: RoomResponse) {
  const destination =
    room.status === "SWIPING"
      ? "swipe"
      : room.status === "CLOSED"
        ? "summary"
        : "lobby";

  return `/app/room/${room.id}/${destination}`;
}

export default function ActiveRoomList({
  rooms,
  isLoading = false,
  error,
  onRetry,
}: ActiveRoomListProps) {
  return (
    <section aria-labelledby="active-rooms-title" className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-caption font-bold uppercase tracking-widest text-primary-strong">
            Phòng ăn của bạn
          </p>
          <h2 id="active-rooms-title" className="mt-1 text-heading font-bold text-foreground">
            Phòng đang hoạt động
          </h2>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Làm mới
          </Button>
        )}
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
        <div className="flex justify-center rounded-panel border border-border bg-card p-8">
          <Spinner label="Đang tải phòng của bạn" />
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Bạn chưa tham gia phòng nào"
          description="Tạo phòng mới hoặc nhập mã được bạn bè chia sẻ để cùng tìm món ngon."
          icon="🍲"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/app/room/new" className={buttonVariants({ variant: "primary" })}>
                Tạo phòng
              </Link>
              <Link
                to="/app/room/join"
                className="focus-ring inline-flex h-10 items-center rounded-control border-2 border-primary px-4 text-body-sm font-bold text-primary-strong hover:bg-secondary"
              >
                Tham gia bằng mã
              </Link>
            </div>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => {
            const status = roomStatusLabels[room.status];
            const members = room.members;

            return (
              <li key={room.id}>
                <Link
                  to={getRoomPath(room)}
                  className="focus-ring block h-full rounded-card"
                  aria-label={`Mở phòng ${room.name || room.roomCode}`}
                >
                  <Card
                    as="article"
                    className="h-full transition-shadow hover:shadow-card"
                    headerAction={<Badge variant={status.variant}>{status.label}</Badge>}
                    title={room.name || "Phòng ăn"}
                    description={`Mã phòng: ${room.roomCode}`}
                  >
                    <div className="flex items-center justify-between gap-4 text-body-sm text-muted-foreground">
                      <span>
                        Chủ phòng: <span className="font-semibold text-foreground">{room.host.username}</span>
                      </span>
                      {members && (
                        <span className="shrink-0">
                          {members.length} thành viên
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-caption text-muted-foreground">
                      Tạo lúc {new Date(room.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
