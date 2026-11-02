// Màn hình Hàng đợi Quét Radar Ghép Hội & Khám phá Phòng công khai
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMatchmakingActions } from '../../../features/matchmaking/useMatchmakingActions';
import { useRoomActions } from '../../../features/room/useRoomActions';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useUIStore } from '../../../store/uiStore';
import RadarQueueView from '../../../features/matchmaking/RadarQueueView';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/form/Button';

export default function MatchmakingQueue() {
  const navigate = useNavigate();
  const showToast = useUIStore((state) => state.showToast);
  const { coordinates } = useGeolocation();
  const { joinRoomByCode } = useRoomActions();

  const {
    matchmakingStatus,
    publicRooms,
    isLoadingPublicRooms,
    isSubmitting,
    startPollingStatus,
    stopPollingStatus,
    cancelMatchmaking,
    fetchNearbyPublicRooms,
  } = useMatchmakingActions();

  // Bắt sự kiện khi tìm thấy phòng
  const handleMatched = useCallback(
    (roomCode: string, roomId?: string) => {
      showToast('success', `Đã ghép thành công vào phòng ${roomCode}!`);
      navigate(`/app/room/${roomId || roomCode}/lobby`);
    },
    [navigate, showToast],
  );

  // Kích hoạt Polling trạng thái mỗi 3000ms và dọn dẹp khi unmount
  useEffect(() => {
    startPollingStatus(handleMatched, 3000);

    return () => {
      stopPollingStatus();
    };
  }, [startPollingStatus, stopPollingStatus, handleMatched]);

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
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => void handleCancelQueue()}
          >
            Hủy tìm kiếm
          </Button>
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
