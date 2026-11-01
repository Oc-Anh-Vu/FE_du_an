import { Card, CopyableCode } from "../../components/ui";

export interface RoomCodeCardProps {
  roomCode: string;
  roomName?: string | null;
}

export default function RoomCodeCard({ roomCode, roomName }: RoomCodeCardProps) {
  return (
    <Card
      as="section"
      variant="dark"
      padding="lg"
      className="rounded-section text-center"
      aria-label="Thông tin mã phòng"
    >
      <p className="text-caption font-bold uppercase tracking-widest text-surface-dark-foreground/70">
        {roomName || "Chia sẻ phòng ăn"}
      </p>
      <h2 className="mt-2 text-heading-sm font-semibold text-surface-dark-foreground">
        Mời bạn bè tham gia
      </h2>
      <div className="mt-5">
        <CopyableCode
          code={roomCode}
          label="Mã phòng · nhấn để sao chép"
          className="text-surface-dark-foreground [&>span:first-child]:text-surface-dark-foreground/70 [&>span:nth-child(2)]:border-surface-dark-foreground/20 [&>span:nth-child(2)]:bg-surface-dark-foreground/10 [&>span:nth-child(2)]:hover:bg-surface-dark-foreground/20 [&>span:nth-child(2)>span:first-child]:text-heading [&>span:nth-child(2)>span:first-child]:text-surface-dark-foreground [&>span:last-child]:text-surface-dark-foreground"
        />
      </div>
    </Card>
  );
}
