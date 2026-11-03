// Màn hình Quẹt thẻ nhóm theo lượt vuốt cử chỉ & Debounce
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import type { MemberLeftSocketData, PlaceResponse, RoomSocketEvent } from '../../../types';
import { useSwipeActions } from '../../../features/swipe/useSwipeActions';
import { useRoomActions } from '../../../features/room/useRoomActions';
import { useRoomSession } from '../../../features/room/useRoomSession';
import { useUserStore } from '../../../store/userStore';
import { useUIStore } from '../../../store/uiStore';
import { useSocket } from '../../../hooks/useSocket';
import GroupSwipeDeck from '../../../features/swipe/GroupSwipeDeck';
import RoomHostControls from '../../../features/room/RoomHostControls';

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
  const currentUserId = useUserStore((state) => state.currentUser?.id);
  const { isRoomSessionEnabled, getSessionSignal, isSessionActive, endRoomSession } = useRoomSession(roomId);

  const {
    roomDeck,
    remainingDeck,
    progressPercentage,
    currentRoom,
    lastSwipeReaction,
    isInitializing,
    isSwiping,
    error,
    initializeSwipeSession,
    submitSwipeDecision,
    handleSwipeSocketEvent,
  } = useSwipeActions(endRoomSession);

  const {
    fetchRoomDetails,
    isCurrentUserHost,
    closeCurrentRoom,
  } = useRoomActions();
  const hasRedirectedRef = useRef(false);
  const [showHearts, setShowHearts] = useState(false);
  const [isClosingRoom, setIsClosingRoom] = useState(false);

  const initializeSession = useCallback(() => {
    if (!roomId || !isSessionActive()) return;
    void initializeSwipeSession(roomId, getSessionSignal());
  }, [roomId, initializeSwipeSession, getSessionSignal, isSessionActive]);

  // Khởi tạo phiên quẹt thẻ khi mount
  useEffect(() => {
    hasRedirectedRef.current = false;
    initializeSession();
  }, [initializeSession]);

  // Hàm kiểm tra trạng thái phòng qua REST làm fallback
  const syncRoomFallback = useCallback(async () => {
    if (!roomId || !isSessionActive()) return;
    const result = await fetchRoomDetails(roomId, getSessionSignal());
    if (!isSessionActive()) return;
    if (!result.success) {
      if (result.isNotFoundOrForbidden) endRoomSession(result.error);
      return;
    }
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
  }, [roomId, fetchRoomDetails, navigate, showToast, getSessionSignal, isSessionActive, endRoomSession]);

  // Tiếp nhận thông báo WebSocket từ /topic/rooms/{roomId}
  const handleSocketMessage = useCallback(
    (event: RoomSocketEvent) => {
      if (!event?.type || event.roomId !== roomId || !isSessionActive()) return;
      if (event.type === 'MEMBER_LEFT') {
        const leftData = event.data as MemberLeftSocketData;
        if (currentUserId && leftData?.user?.id === currentUserId) {
          endRoomSession('Bạn đã được mời ra khỏi phòng ăn.');
          return;
        }
      }

      // Chuyển cho Feature Hook xử lý state
      handleSwipeSocketEvent(event);

      if (event.type === 'SWIPE_ACTION') {
        setShowHearts(true);
        setTimeout(() => setShowHearts(false), 2000);
      } else if (event.type === 'MATCH_FOUND' && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        showToast('success', 'Tuyệt vời! Cả phòng đã khớp chung một quán ăn!');
        setTimeout(() => {
          if (!isSessionActive()) return;
          navigate(`/app/room/${roomId}/summary`, { replace: true });
        }, 1500);
      } else if (event.type === 'ROOM_CLOSED' && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        showToast('info', 'Phòng ăn đã kết thúc phiên quẹt.');
        navigate(`/app/room/${roomId}/summary`, { replace: true });
      }
    },
    [handleSwipeSocketEvent, roomId, navigate, showToast, currentUserId, isSessionActive, endRoomSession],
  );

  // Kích hoạt Hybrid Socket Client cho Bàn quẹt thẻ
  const { isConnected } = useSocket<RoomSocketEvent>({
    roomId,
    enabled: isRoomSessionEnabled,
    onMessage: handleSocketMessage,
    onPoll: syncRoomFallback,
    pollIntervalMs: 4000,
    pollImmediately: true,
  });

  // Xử lý quẹt thẻ
  const handleSwipe = useCallback(
    async (place: PlaceResponse, liked: boolean) => {
      if (!roomId || !isSessionActive()) return false;
      return submitSwipeDecision(roomId, place, liked);
    },
    [roomId, submitSwipeDecision, isSessionActive],
  );

  const handleCloseRoom = useCallback(async () => {
    if (!roomId) return false;
    setIsClosingRoom(true);
    try {
      const succeeded = await closeCurrentRoom(roomId);
      if (succeeded) {
        hasRedirectedRef.current = true;
        navigate(`/app/room/${roomId}/summary`, { replace: true });
      }
      return succeeded;
    } finally {
      setIsClosingRoom(false);
    }
  }, [roomId, closeCurrentRoom, navigate]);

  const matchedPlace = currentRoom?.matchedPlace;

  return (
    <PageContainer maxWidth="md" className="py-6 space-y-6">
      {/* Hiệu ứng pháo hoa khi phòng chốt quán thành công */}
      <Confetti active={Boolean(matchedPlace)} count={60} />
      {/* Hiệu ứng tim bay realtime khi có thành viên vừa quẹt thích */}
      <FloatingHearts active={Boolean(matchedPlace) || showHearts} count={showHearts ? 15 : 20} />

      <PageHeader
        title={currentRoom?.name ? `Quẹt thẻ: ${currentRoom.name}` : 'Quẹt Thẻ Nhóm'}
        subtitle={
          lastSwipeReaction
            ? `${lastSwipeReaction.username} vừa ${lastSwipeReaction.direction === 'RIGHT' ? '❤️ thích' : '✕ bỏ qua'} một quán!`
            : 'Vuốt phải hoặc nhấn ❤️ nếu thích, vuốt trái hoặc nhấn ✕ để bỏ qua.'
        }
        action={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-semibold ${
                isConnected
                  ? 'bg-success-soft text-success-soft-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              title={isConnected ? 'Đang kết nối thời gian thực' : 'Đang đồng bộ định kỳ'}
            >
              {isConnected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
              {isConnected ? 'Realtime' : 'Đồng bộ'}
            </span>
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

      {currentRoom && currentRoom.id === roomId && isCurrentUserHost && currentRoom.status !== 'CLOSED' && (
        <RoomHostControls
          room={currentRoom}
          isHost={isCurrentUserHost}
          onCloseClick={handleCloseRoom}
          isClosing={isClosingRoom}
        />
      )}

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
              onClick={initializeSession}
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
          onRetry={initializeSession}
        />
      )}
    </PageContainer>
  );
}
