// Màn hình Phòng chờ tập hợp thành viên & Khởi tạo phiên quẹt thẻ
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import type { MemberLeftSocketData, RoomSocketEvent, UUID } from '../../../types';
import { useRoomActions } from '../../../features/room/useRoomActions';
import { useUserStore } from '../../../store/userStore';
import { useUIStore } from '../../../store/uiStore';
import { useSocket } from '../../../hooks/useSocket';
import RoomCodeCard from '../../../features/room/RoomCodeCard';
import RoomMemberList from '../../../features/room/RoomMemberList';
import RoomHostControls from '../../../features/room/RoomHostControls';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SplitView } from '../../../components/layout/SplitView';
import { Card } from '../../../components/ui/display/Card';
import { Button } from '../../../components/ui/form/Button';
import { Spinner } from '../../../components/ui/feedback/Spinner';
import { Alert } from '../../../components/ui/feedback/Alert';

export default function Lobby() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showToast = useUIStore((state) => state.showToast);
  const currentUser = useUserStore((state) => state.currentUser);

  const {
    currentRoom,
    isCurrentUserHost,
    isLoading,
    error,
    fetchRoomDetails,
    startRoomSwiping,
    kickRoomMember,
    leaveCurrentRoom,
    closeCurrentRoom,
    deleteCurrentRoom,
    handleRoomSocketEvent,
  } = useRoomActions();

  const [isActionBusy, setIsActionBusy] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Xử lý nạp chi tiết phòng và đồng bộ trạng thái
  const syncRoomState = useCallback(async () => {
    if (!roomId) return;
    const result = await fetchRoomDetails(roomId);

    if (!result.success) {
      if (result.isNotFoundOrForbidden && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        showToast('danger', result.error || 'Phòng ăn không tồn tại hoặc bạn không phải thành viên.');
        navigate('/app/room', { replace: true });
      }
      return;
    }

    const room = result.room;
    if (room && !hasRedirectedRef.current) {
      // FE_SPEC 4.3: Đồng bộ redirect theo trạng thái phòng
      if (room.status === 'SWIPING') {
        hasRedirectedRef.current = true;
        navigate(`/app/room/${roomId}/swipe`, { replace: true });
      } else if (room.status === 'CLOSED') {
        hasRedirectedRef.current = true;
        navigate(`/app/room/${roomId}/summary`, { replace: true });
      }
    }
  }, [roomId, fetchRoomDetails, navigate, showToast]);

  // Nạp lần đầu khi mount
  useEffect(() => {
    hasRedirectedRef.current = false;
    void syncRoomState();
  }, [syncRoomState]);

  // Tiếp nhận sự kiện thời gian thực từ STOMP Broker (/topic/rooms/{roomId})
  const handleSocketMessage = useCallback(
    (event: RoomSocketEvent) => {
      if (!event || !event.type) return;

      // Cập nhật state thông qua Feature Hook
      handleRoomSocketEvent(event);

      if (event.type === 'GAME_STARTED' && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        showToast('info', 'Chủ phòng đã bấm bắt đầu! Đang chuyển vào bàn quẹt thẻ...');
        navigate(`/app/room/${roomId}/swipe`, { replace: true });
      } else if (event.type === 'ROOM_CLOSED' && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        showToast('warning', 'Phòng ăn đã được đóng.');
        navigate(`/app/room/${roomId}/summary`, { replace: true });
      } else if (event.type === 'MEMBER_LEFT') {
        const leftData = event.data as MemberLeftSocketData;
        if (leftData?.user?.id === currentUser?.id && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          showToast('warning', 'Bạn đã được mời ra khỏi phòng ăn.');
          navigate('/app/room', { replace: true });
        }
      }
    },
    [handleRoomSocketEvent, roomId, currentUser?.id, navigate, showToast],
  );

  // Kích hoạt Hybrid Socket: Lắng nghe STOMP Realtime, tự động kích hoạt Polling (3000ms) làm fallback an toàn
  const { isConnected } = useSocket<RoomSocketEvent>({
    roomId,
    onMessage: handleSocketMessage,
    onPoll: syncRoomState,
    pollIntervalMs: 3000,
  });

  // Thao tác Bắt đầu quẹt thẻ (Host)
  const handleStartSwiping = useCallback(async () => {
    if (!roomId) return;
    setIsActionBusy(true);
    try {
      const success = await startRoomSwiping(roomId);
      if (success) {
        showToast('success', 'Bắt đầu phiên quẹt thẻ nhóm!');
        navigate(`/app/room/${roomId}/swipe`);
      }
    } finally {
      setIsActionBusy(false);
    }
  }, [roomId, startRoomSwiping, navigate, showToast]);

  // Thao tác Xóa thành viên (Host)
  const handleKickMember = useCallback(
    async (memberId: UUID) => {
      if (!roomId) return;
      const success = await kickRoomMember(roomId, memberId);
      if (success) {
        showToast('info', 'Đã xóa thành viên khỏi phòng');
        void syncRoomState();
      }
    },
    [roomId, kickRoomMember, showToast, syncRoomState],
  );

  // Thao tác Rời phòng
  const handleLeaveRoom = useCallback(async () => {
    if (!roomId) return;
    setIsActionBusy(true);
    try {
      const success = await leaveCurrentRoom(roomId);
      if (success) {
        showToast('info', 'Bạn đã rời khỏi phòng');
        navigate('/app/room');
      }
    } finally {
      setIsActionBusy(false);
    }
  }, [roomId, leaveCurrentRoom, navigate, showToast]);

  // Thao tác Đóng phòng (Host)
  const handleCloseRoom = useCallback(async () => {
    if (!roomId) return;
    setIsActionBusy(true);
    try {
      const success = await closeCurrentRoom(roomId);
      if (success) {
        showToast('info', 'Đã đóng phòng ăn');
        navigate(`/app/room/${roomId}/summary`);
      }
    } finally {
      setIsActionBusy(false);
    }
  }, [roomId, closeCurrentRoom, navigate, showToast]);

  // Thao tác Xóa phòng hoàn toàn (Host)
  const handleDeleteRoom = useCallback(async () => {
    if (!roomId) return;
    setIsActionBusy(true);
    try {
      const success = await deleteCurrentRoom(roomId);
      if (success) {
        showToast('info', 'Đã xóa hoàn toàn phòng ăn');
        navigate('/app/room');
      }
    } finally {
      setIsActionBusy(false);
    }
  }, [roomId, deleteCurrentRoom, navigate, showToast]);

  // Trạng thái đang tải dữ liệu ban đầu
  if (isLoading && !currentRoom) {
    return (
      <PageContainer maxWidth="lg" className="py-12 flex justify-center items-center">
        <Spinner size="lg" label="Đang tải thông tin phòng chờ..." />
      </PageContainer>
    );
  }

  // Trạng thái lỗi
  if (error && !currentRoom) {
    return (
      <PageContainer maxWidth="md" className="py-8 space-y-4">
        <Alert variant="danger" title="Không thể tải phòng chờ">
          {error}
        </Alert>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/app/room')}>
            Quay lại danh sách phòng
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!currentRoom) {
    return null;
  }

  const membersList = currentRoom.members ?? (currentRoom.host ? [currentRoom.host] : []);

  return (
    <PageContainer maxWidth="lg" className="py-6 space-y-6">
      <PageHeader
        title={currentRoom.name || 'Phòng Chờ Ăn Uống'}
        subtitle={`Chủ phòng: ${currentRoom.host.username} • Sĩ số: ${membersList.length} người`}
        action={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption font-semibold ${
                isConnected
                  ? 'bg-success-soft text-success-soft-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              title={isConnected ? 'Đang kết nối thời gian thực (Realtime Active)' : 'Đang đồng bộ thích ứng (Fallback Polling)'}
            >
              {isConnected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
              {isConnected ? 'Realtime' : 'Đồng bộ'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => void syncRoomState()}
            >
              Làm mới
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/app/room')}
            >
              Danh sách phòng
            </Button>
          </div>
        }
      />

      {/* SplitView: Trái là Mã phòng & Bán kính, Phải là Danh sách thành viên */}
      <SplitView
        ratio="sidebar-left"
        left={
          <RoomCodeCard
            roomCode={currentRoom.roomCode}
            roomName={currentRoom.name}
            radius={currentRoom.radius}
            deckSize={currentRoom.deckSize}
            status={currentRoom.status}
          />
        }
        right={
          <Card className="p-6">
            <RoomMemberList
              members={membersList}
              hostId={currentRoom.host.id}
              currentUserId={currentUser?.id}
              isCurrentUserHost={isCurrentUserHost}
              onKickMember={handleKickMember}
            />
          </Card>
        }
      />

      {/* Thanh điều khiển phòng ăn (Bắt đầu / Đóng phòng / Rời phòng) */}
      <RoomHostControls
        room={currentRoom}
        isHost={isCurrentUserHost}
        onStartClick={handleStartSwiping}
        onCloseClick={handleCloseRoom}
        onDeleteClick={handleDeleteRoom}
        onLeaveClick={handleLeaveRoom}
        isStarting={isActionBusy}
        isClosing={isActionBusy}
        isDeleting={isActionBusy}
        isLeaving={isActionBusy}
      />
    </PageContainer>
  );
}
