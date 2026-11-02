// Màn hình Hàng đợi Quét Radar Ghép Hội & Khám phá Phòng công khai
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import type { MatchmakingStatusResponse } from '../../../types';
import { useMatchmakingActions } from '../../../features/matchmaking/useMatchmakingActions';
import { useRoomActions } from '../../../features/room/useRoomActions';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useSocket } from '../../../hooks/useSocket';
import { useUIStore } from '../../../store/uiStore';
import { useUserStore } from '../../../store/userStore';
import RadarQueueView from '../../../features/matchmaking/RadarQueueView';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/form/Button';

export default function MatchmakingQueue() {
  const navigate = useNavigate();
  const showToast = useUIStore((state) => state.showToast);
  const currentUser = useUserStore((state) => state.currentUser);
  const { coordinates } = useGeolocation();
  const { joinRoomByCode } = useRoomActions();

  const {
    matchmakingStatus,
    publicRooms,
    isLoadingPublicRooms,
    isSubmitting,
    pollMatchStatus,
    cancelMatchmaking,
    fetchNearbyPublicRooms,
    handleMatchmakingSocketEvent,
  } = useMatchmakingActions();

  // Bắt sự kiện khi tìm thấy phòng
  const handleMatched = useCallback(
    (roomCode: string, roomId?: string) => {
      showToast('success', `Đã ghép thành công vào phòng ${roomCode}!`);
      navigate(`/app/room/${roomId || roomCode}/lobby`);
    },
    [navigate, showToast],
  );

  // Kênh STOMP Broker cá nhân: /topic/matchmaking/{userId}
  const socketDestination = currentUser?.id ? `/topic/matchmaking/${currentUser.id}` : null;

  // Lắng nghe sự kiện ghép phòng qua WebSocket STOMP kết hợp Adaptive REST Polling fallback
  const { isConnected } = useSocket<MatchmakingStatusResponse>({
    destination: socketDestination,
    onMessage: (payload) => {
      if (!payload) return;
      handleMatchmakingSocketEvent(payload);
      if (payload.status === 'MATCHED' && payload.roomCode) {
        handleMatched(payload.roomCode, payload.roomId ?? undefined);
      }
    },
    onPoll: () => {
      void pollMatchStatus().then((result) => {
        if (result && result.status === 'MATCHED' && result.roomCode) {
          handleMatched(result.roomCode, result.roomId ?? undefined);
        }
      });
    },
    pollIntervalMs: 3000,
  });

  // Kiểm tra trạng thái ngay lần đầu mount
  useEffect(() => {
    void pollMatchStatus().then((result) => {
      if (result && result.status === 'MATCHED' && result.roomCode) {
        handleMatched(result.roomCode, result.roomId ?? undefined);
      }
    });
  }, [pollMatchStatus, handleMatched]);

  // Nạp danh sách phòng công khai lân cận
  useEffect(() => {
    if (coordinates) {
      void fetchNearbyPublicRooms(coordinates.latitude, coordinates.longitude, 10);
    }
  }, [coordinates, fetchNearbyPublicRooms]);

  // Hủy tìm kiếm
  const handleCancelQueue = useCallback(async () => {
    const success = await cancelMatchmaking();
    if (success) {
      showToast('info', 'Đã hủy tìm kiếm phòng ghép.');
      navigate('/app/room/match');
    }
  }, [cancelMatchmaking, navigate, showToast]);

  // Tham gia phòng công khai từ danh sách
  const handleJoinPublicRoom = useCallback(
    async (roomCode: string) => {
      try {
        const room = await joinRoomByCode(roomCode);
        if (room) {
          navigate(`/app/room/${room.id}/lobby`);
        }
      } catch (err) {
        showToast('danger', err instanceof Error ? err.message : 'Không thể tham gia phòng này');
      }
    },
    [joinRoomByCode, navigate, showToast],
  );

  return (
    <PageContainer maxWidth="lg" className="py-6 space-y-6">
      <PageHeader
        title="Đang Quét Radar Ghép Hội"
        subtitle="Hệ thống đang quét tìm những người bạn có cùng sở thích ăn uống xung quanh bạn..."
        action={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-semibold ${
                isConnected
                  ? 'bg-success-soft text-success-soft-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              title={
                isConnected
                  ? 'Đang kết nối thời gian thực (Realtime Active)'
                  : 'Đang đồng bộ thích ứng (Fallback Polling)'
              }
            >
              {isConnected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
              {isConnected ? 'Realtime' : 'Đồng bộ'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => void handleCancelQueue()}
            >
              Hủy tìm kiếm
            </Button>
          </div>
        }
      />

      <RadarQueueView
        matchmakingStatus={matchmakingStatus}
        publicRooms={publicRooms}
        isLoadingPublicRooms={isLoadingPublicRooms}
        isCancelling={isSubmitting}
        onCancelQueue={handleCancelQueue}
        onJoinPublicRoom={handleJoinPublicRoom}
        onCreateRoomInstead={() => navigate('/app/room/new')}
        onRefreshPublicRooms={() => {
          if (coordinates) {
            void fetchNearbyPublicRooms(coordinates.latitude, coordinates.longitude, 10);
          }
        }}
        onMatched={handleMatched}
      />
    </PageContainer>
  );
}
