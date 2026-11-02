import { ArrowLeft, PlusCircle, Radio } from 'lucide-react';
import type { TagResponse } from '../../types';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button } from '../../components/ui/form/Button';
import { Badge } from '../../components/ui/display/Badge';

export interface RadarQueueViewProps {
  selectedTags?: TagResponse[];
  onLeaveQueue?: () => void;
  onCreateRoomInstead?: () => void;
}

export default function RadarQueueView({
  selectedTags = [],
  onLeaveQueue,
  onCreateRoomInstead,
}: RadarQueueViewProps) {
  return (
    <div className="w-full space-y-6">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Radio size={20} className="text-primary animate-pulse" />
          <h2 className="text-heading-sm font-bold text-foreground">
            Radar Ghép Hội
          </h2>
        </div>
        <Badge variant="info" size="sm">
          [PENDING_BACKEND]
        </Badge>
      </header>

      {/* Hiệu ứng Radar quét xung nhịp */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-card border border-border bg-card py-12 shadow-card">
        {/* Vòng tròn Radar xung nhịp */}
        <div className="relative flex size-44 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute size-44 rounded-full bg-primary/10 animate-ping"
          />
          <span
            aria-hidden="true"
            className="absolute size-32 rounded-full border border-primary/30 animate-pulse"
          />
          <span
            aria-hidden="true"
            className="absolute size-20 rounded-full border border-primary/50"
          />
          <div className="relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Radio size={24} className="animate-pulse" />
          </div>
        </div>

        <p className="mt-6 text-center text-body font-bold text-foreground">
          Đang quét tìm hội ăn xung quanh bạn...
        </p>
        <p className="mt-1 text-center text-body-sm text-muted-foreground">
          Tìm kiếm những người dùng có cùng tâm trạng và vị trí gần bạn
        </p>

        {selectedTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-caption text-muted-foreground">Tâm trạng đã chọn:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="default" size="sm">
                #{tag.tagName}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Thông báo trạng thái backend */}
      <Alert variant="warning" title="Hàng đợi tự động ghép hội đang phát triển">
        Tính năng hàng đợi tự động qua WebSocket/STOMP hiện chưa được cung cấp từ phía Backend. Bạn có thể tự tạo phòng ăn riêng và gửi mã phòng để mời bạn bè tham gia quẹt thẻ ngay!
      </Alert>

      {/* Nút hành động */}
      <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {onLeaveQueue && (
          <Button
            variant="outline"
            leftIcon={<ArrowLeft aria-hidden="true" size={16} />}
            onClick={onLeaveQueue}
          >
            Quay lại chọn tag
          </Button>
        )}

        {onCreateRoomInstead && (
          <Button
            variant="primary"
            leftIcon={<PlusCircle aria-hidden="true" size={16} />}
            onClick={onCreateRoomInstead}
          >
            Tạo phòng ăn riêng ngay
          </Button>
        )}
      </footer>
    </div>
  );
}
