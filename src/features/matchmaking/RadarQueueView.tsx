// Giao diện Radar Hàng đợi Ghép hội & Khám phá Phòng công khai
import { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  LogIn,
  MapPin,
  PlusCircle,
  Radio,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import type {
  MatchmakingStatusResponse,
  PublicRoomResponse,
  TagResponse,
} from '../../types';
import { Avatar } from '../../components/ui/display/Avatar';
import { Badge } from '../../components/ui/display/Badge';
import { Card } from '../../components/ui/display/Card';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { ProgressBar } from '../../components/ui/feedback/ProgressBar';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { Button } from '../../components/ui/form/Button';
import { IconButton } from '../../components/ui/form/IconButton';
import { cn } from '../../utils/cn';

export interface RadarQueueViewProps {
  matchmakingStatus?: MatchmakingStatusResponse | null;
  selectedTags?: TagResponse[];
  publicRooms?: PublicRoomResponse[];
  isLoadingPublicRooms?: boolean;
  isCancelling?: boolean;
  onCancelQueue?: () => void | Promise<void>;
  onJoinPublicRoom?: (roomCode: string) => void | Promise<void>;
  onCreateRoomInstead?: () => void;
  onRefreshPublicRooms?: () => void | Promise<void>;
  onMatched?: (roomCode: string, roomId?: string) => void;
  className?: string;
}

export default function RadarQueueView({
  matchmakingStatus = null,
  selectedTags = [],
  publicRooms = [],
  isLoadingPublicRooms = false,
  isCancelling = false,
  onCancelQueue,
  onJoinPublicRoom,
  onCreateRoomInstead,
  onRefreshPublicRooms,
  onMatched,
  className,
}: RadarQueueViewProps) {
  const isMatched = matchmakingStatus?.status === 'MATCHED';
  const hasTriggeredMatchedRef = useRef(false);

  // Kích hoạt callback khi Backend báo MATCHED
  useEffect(() => {
    if (isMatched && matchmakingStatus?.roomCode && !hasTriggeredMatchedRef.current) {
      hasTriggeredMatchedRef.current = true;
      onMatched?.(matchmakingStatus.roomCode, matchmakingStatus.roomId ?? undefined);
    }
  }, [isMatched, matchmakingStatus, onMatched]);

  const queueSize = matchmakingStatus?.currentQueueSize ?? 1;
  const targetSize = matchmakingStatus?.targetGroupSize ?? 4;
  const progressPercent = Math.min(100, Math.round((queueSize / targetSize) * 100));

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header trạng thái */}
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Radio size={20} className={cn('text-primary', isMatched ? 'text-success' : 'animate-pulse')} />
          <h2 className="text-heading-sm font-bold text-foreground">
            Radar Ghép Hội
          </h2>
        </div>
        {isMatched ? (
          <Badge variant="success" dot size="sm">
            Đã ghép thành công!
          </Badge>
        ) : (
          <Badge variant="warning" dot size="sm">
            Đang quét Radar
          </Badge>
        )}
      </header>

      {/* Vùng Radar quét xung nhịp & Tiến trình thực tế */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-card border border-border bg-card p-6 py-10 shadow-card">
        {/* Vòng tròn Radar xung nhịp */}
        <div className="relative flex size-44 items-center justify-center" aria-hidden="true">
          {!isMatched && (
            <>
              <span className="absolute size-44 rounded-full bg-primary/10 animate-ping" />
              <span className="absolute size-32 rounded-full border border-primary/30 animate-pulse" />
              <span className="absolute size-20 rounded-full border border-primary/50" />
            </>
          )}
          <div
            className={cn(
              'relative flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-colors',
              isMatched ? 'bg-success' : 'bg-primary',
            )}
          >
            {isMatched ? (
              <CheckCircle2 size={28} className="animate-bounce" />
            ) : (
              <Radio size={26} className="animate-pulse" />
            )}
          </div>
        </div>

        {/* Thông báo tiến trình */}
        <p className="mt-6 text-center text-body font-bold text-foreground">
          {isMatched
            ? 'Đã tìm thấy phòng ăn phù hợp! Đang chuyển hướng...'
            : 'Đang quét tìm người cùng khẩu vị xung quanh bạn...'}
        </p>

        <p className="mt-1 text-center text-body-sm text-muted-foreground">
          {isMatched
            ? `Mã phòng ghép: ${matchmakingStatus?.roomCode ?? ''}`
            : 'Hệ thống tự động gom nhóm theo khoảng cách GPS và tâm trạng hôm nay.'}
        </p>

        {/* Thanh tiến trình số người trong hàng đợi */}
        {!isMatched && (
          <div className="mt-6 w-full max-w-xs">
            <ProgressBar
              value={progressPercent}
              label={`Đã sẵn sàng: ${queueSize}/${targetSize} người`}
              showPercentage
              tone="primary"
              animated
            />
          </div>
        )}

        {/* Danh sách Tags tâm trạng đang dùng để quét */}
        {selectedTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-caption text-muted-foreground">Tâm trạng tìm kiếm:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="default" size="sm">
                #{tag.tagName}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Danh sách Phòng công khai quanh đây (PUBLIC) */}
      <Card
        as="section"
        title="Phòng công khai quanh đây"
        description="Các nhóm bạn lân cận đang mở phòng công khai, bạn có thể tham gia ngay mà không cần chờ radar."
        headerAction={
          onRefreshPublicRooms && (
            <IconButton
              aria-label="Làm mới danh sách phòng công khai"
              variant="ghost"
              size="sm"
              loading={isLoadingPublicRooms}
              onClick={() => void onRefreshPublicRooms()}
            >
              <RefreshCw size={16} />
            </IconButton>
          )
        }
      >
        {isLoadingPublicRooms ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="md" label="Đang tải danh sách phòng công khai quanh đây..." />
          </div>
        ) : publicRooms.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {publicRooms.map((room) => (
              <div
                key={room.roomId}
                className="flex flex-col justify-between rounded-card border border-border bg-card p-4 transition-shadow hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate font-bold text-foreground text-body">
                      {room.name || `Phòng ăn #${room.roomCode}`}
                    </h4>
                    <p className="mt-0.5 text-caption text-muted-foreground">
                      Mã phòng: <span className="font-mono font-semibold">{room.roomCode}</span>
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} aria-hidden="true" />
                      {room.distance !== undefined ? `~${room.distance.toFixed(1)} km` : 'Gần bạn'}
                    </span>
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={room.host?.username || 'Host'}
                      size="sm"
                    />
                    <div className="min-w-0 text-caption">
                      <p className="truncate font-medium text-foreground">
                        {room.host?.username || 'Chủ phòng'}
                      </p>
                      <p className="inline-flex items-center gap-1 text-muted-foreground text-micro">
                        <Users size={12} aria-hidden="true" />
                        {room.currentMembers}/{room.maxMembers} người
                      </p>
                    </div>
                  </div>

                  {onJoinPublicRoom && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<LogIn size={14} aria-hidden="true" />}
                      onClick={() => void onJoinPublicRoom(room.roomCode)}
                    >
                      Vào phòng
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            size="sm"
            icon={<Users size={24} aria-hidden="true" />}
            title="Chưa có phòng công khai lân cận"
            description="Hiện chưa có nhóm bạn nào mở phòng ăn công khai quanh vị trí của bạn. Bạn có thể tiếp tục chờ ghép qua Radar hoặc tự tạo phòng ăn riêng."
          />
        )}
      </Card>

      {/* Footer hành động điều hướng */}
      <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {onCancelQueue && (
          <Button
            variant="outline"
            leftIcon={<X aria-hidden="true" size={16} />}
            loading={isCancelling}
            onClick={() => void onCancelQueue()}
          >
            Hủy tìm kiếm ghép phòng
          </Button>
        )}

        {onCreateRoomInstead && (
          <Button
            variant="primary"
            leftIcon={<PlusCircle aria-hidden="true" size={16} />}
            onClick={onCreateRoomInstead}
          >
            Tự tạo phòng ăn riêng
          </Button>
        )}
      </footer>
    </div>
  );
}
