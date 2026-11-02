// Màn hình Quẹt thẻ nhóm theo lượt vuốt cử chỉ & Debounce
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react';
import type { PlaceResponse } from '../../../types';
import { useSwipeActions } from '../../../features/swipe/useSwipeActions';
import { useRoomActions } from '../../../features/room/useRoomActions';
import { useUIStore } from '../../../store/uiStore';
import GroupSwipeDeck from '../../../features/swipe/GroupSwipeDeck';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/form/Button';
import { Spinner } from '../../../components/ui/feedback/Spinner';
import { Alert } from '../../../components/ui/feedback/Alert';
import { Confetti } from '../../../components/ui/effects/Confetti';
import { FloatingHearts } from '../../../components/ui/effects/FloatingHearts';

export default function Swipe() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showToast = useUIStore((state) => state.showToast);

  const {
    roomDeck,
    remainingDeck,
    progressPercentage,
    currentRoom,
    isInitializing,
    isSwiping,
    error,
    initializeSwipeSession,
    submitSwipeDecision,
  } = useSwipeActions();

  const { fetchRoomDetails } = useRoomActions();
  const hasRedirectedRef = useRef(false);

  // Khởi tạo phiên quẹt thẻ khi mount
  useEffect(() => {
    if (!roomId) return;
    hasRedirectedRef.current = false;
    void initializeSwipeSession(roomId);
  }, [roomId, initializeSwipeSession]);

  // Polling đồng bộ trạng thái phòng mỗi 4000ms: nếu Host đóng phòng hoặc tự động match -> chuyển sang Summary
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(async () => {
      const result = await fetchRoomDetails(roomId);
      if (result.success && result.room && !hasRedirectedRef.current) {
        if (result.room.status === 'CLOSED') {
          hasRedirectedRef.current = true;
          showToast('success', 'Phòng đã chốt được quán ăn!');
          navigate(`/app/room/${roomId}/summary`, { replace: true });
        } else if (result.room.status === 'OPEN') {
          hasRedirectedRef.current = true;
          navigate(`/app/room/${roomId}/lobby`, { replace: true });
        }
      }
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [roomId, fetchRoomDetails, navigate, showToast]);

  // Xử lý quẹt thẻ
  const handleSwipe = useCallback(
    async (place: PlaceResponse, liked: boolean) => {
      if (!roomId) return;
      await submitSwipeDecision(roomId, place, liked);
    },
    [roomId, submitSwipeDecision],
  );

  const matchedPlace = currentRoom?.matchedPlace;

  return (
    <PageContainer maxWidth="md" className="py-6 space-y-6">
      {/* Hiệu ứng pháo hoa và tim bay khi phòng chốt quán thành công */}
      <Confetti active={Boolean(matchedPlace)} count={60} />
      <FloatingHearts active={Boolean(matchedPlace)} count={20} />

      <PageHeader
        title={currentRoom?.name ? `Quẹt thẻ: ${currentRoom.name}` : 'Quẹt Thẻ Nhóm'}
        subtitle="Vuốt phải hoặc nhấn ❤️ nếu thích, vuốt trái hoặc nhấn ✕ để bỏ qua."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BarChart3 className="h-4 w-4" />}
              onClick={() => navigate(`/app/room/${roomId}/summary`)}
            >
              Xem kết quả
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(`/app/room/${roomId}/lobby`)}
            >
              Phòng chờ
            </Button>
          </div>
        }
      />

      {isInitializing ? (
        <div className="py-16 flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" label="Đang nạp bộ bài quán ăn của phòng..." />
          <p className="text-body-sm text-foreground-muted">
            Đang tải dữ liệu địa điểm gần bạn...
          </p>
        </div>
      ) : error && roomDeck.length === 0 ? (
        <div className="space-y-4">
          <Alert variant="danger" title="Không thể nạp bộ bài quẹt thẻ">
            {error}
          </Alert>
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                if (roomId) void initializeSwipeSession(roomId);
              }}
            >
              Thử lại
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/app/room/${roomId}/lobby`)}
            >
              Về phòng chờ
            </Button>
          </div>
        </div>
      ) : (
        <GroupSwipeDeck
          roomId={roomId || ''}
          deck={roomDeck}
          remainingDeck={remainingDeck}
          progressPercentage={progressPercentage}
          matchedPlace={matchedPlace}
          isLoading={isInitializing}
          isSwiping={isSwiping}
          error={error}
          onSwipe={handleSwipe}
          onViewResultsClick={() => navigate(`/app/room/${roomId}/summary`)}
          onRetry={() => {
            if (roomId) void initializeSwipeSession(roomId);
          }}
        />
      )}
    </PageContainer>
  );
}
