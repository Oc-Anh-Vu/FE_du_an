import { Layers, MapPin, Share2 } from 'lucide-react';
import { Card } from '../../components/ui/display/Card';
import { CopyableCode } from '../../components/ui/display/CopyableCode';
import { Badge } from '../../components/ui/display/Badge';

export interface RoomCodeCardProps {
  roomCode: string;
  roomName?: string | null;
  radius?: number | null;
  deckSize?: number | null;
  status?: string;
}

export default function RoomCodeCard({
  roomCode,
  roomName,
  radius,
  deckSize,
  status,
}: RoomCodeCardProps) {
  return (
    <Card
      as="section"
      className="rounded-card border border-border bg-card p-6 text-center shadow-card"
      aria-label="Thông tin mã phòng ăn"
    >
      <div className="flex items-center justify-center gap-2 text-caption font-bold uppercase tracking-wider text-primary">
        <Share2 size={16} />
        <span>Mã phòng ăn</span>
        {status && (
          <Badge variant={status === 'SWIPING' ? 'success' : 'info'} size="sm">
            {status === 'SWIPING' ? 'Đang quẹt thẻ' : 'Phòng chờ'}
          </Badge>
        )}
      </div>

      <h2 className="mt-2 text-heading-sm font-bold text-foreground">
        {roomName || 'Mời bạn bè cùng tham gia'}
      </h2>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Chia sẻ mã 6 ký tự này để bạn bè nhập vào mục &quot;Tham gia phòng&quot;
      </p>

      <div className="my-5 flex justify-center">
        <CopyableCode
          code={roomCode}
          label="Nhấn để sao chép mã phòng"
        />
      </div>

      {(radius !== undefined || deckSize !== undefined) && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border pt-4 text-body-sm text-muted-foreground">
          {radius !== undefined && radius !== null && (
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-primary" />
              <span>Bán kính: <strong className="text-foreground">{radius} km</strong></span>
            </div>
          )}
          {deckSize !== undefined && deckSize !== null && (
            <div className="flex items-center gap-1.5">
              <Layers size={15} className="text-primary" />
              <span>Số lượng: <strong className="text-foreground">{deckSize} quán</strong></span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
