// Màn hình Tổng kết kết quả quẹt thẻ, Bầu chọn chốt quán & Chia tiền VietQR
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Receipt, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import type { ExpenseResponse, ExpenseSplitResponse, UUID } from '../../../types';
import { useRoomSession } from '../../../features/room/useRoomSession';
import { useSocket } from '../../../hooks/useSocket';
import { useBillingStore } from '../../../store/billingStore';
import { useRoomActions } from '../../../features/room/useRoomActions';
import { useSwipeActions } from '../../../features/swipe/useSwipeActions';
import { useBillingActions } from '../../../features/billing/useBillingActions';
import { useUserStore } from '../../../store/userStore';
import { useUIStore } from '../../../store/uiStore';
import SwipeResultBoard from '../../../features/swipe/SwipeResultBoard';
import ExpenseSplitCreator from '../../../features/billing/ExpenseSplitCreator';
import RoomExpenseList from '../../../features/billing/RoomExpenseList';
import VietQRPaymentCard from '../../../features/billing/VietQRPaymentCard';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/form/Button';
import { Modal } from '../../../components/ui/feedback/Modal';
import { Spinner } from '../../../components/ui/feedback/Spinner';
import { Alert } from '../../../components/ui/feedback/Alert';

export default function Summary() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showToast = useUIStore((state) => state.showToast);
  const currentUser = useUserStore((state) => state.currentUser);

  // Quản lý session của phòng
  const { isRoomSessionEnabled, isSessionActive } = useRoomSession(roomId);

  // 1. Room Actions
  const { currentRoom, isCurrentUserHost, fetchRoomDetails } = useRoomActions();

  // 2. Swipe Actions
  const {
    swipeResults,
    isSelectingPlace,
    fetchRoomResults,
    hostSelectWinningPlace,
  } = useSwipeActions();

  // 3. Billing Actions
  const {
    roomExpenses,
    isLoading: isBillingLoading,
    fetchExpensesByRoom,
    buildAndCreateExpense,
    confirmSplitPaid,
    confirmAllSplitsPaid,
    removeUnpaidExpense,
  } = useBillingActions();

  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  const [activeSplitForQr, setActiveSplitForQr] = useState<ExpenseSplitResponse | null>(null);

  // Nạp toàn bộ dữ liệu khi mount
  const loadAllRoomData = useCallback(async () => {
    if (!roomId) return;
    try {
      await Promise.all([
        fetchRoomDetails(roomId),
        fetchRoomResults(roomId),
        fetchExpensesByRoom(roomId),
      ]);
    } catch {
      // Bắt lỗi tổng quan
    } finally {
      setIsLoadingAll(false);
    }
  }, [roomId, fetchRoomDetails, fetchRoomResults, fetchExpensesByRoom]);

  useEffect(() => {
    void loadAllRoomData();
  }, [loadAllRoomData]);

  // Tiếp nhận sự kiện hóa đơn & kết quả phòng thời gian thực từ STOMP Broker (/topic/rooms/{roomId})
  const handleSocketMessage = useCallback(
    (event: any) => {
      if (!event || event.roomId !== roomId || !isSessionActive()) return;

      if (event.type === 'EXPENSE_CREATED') {
        const created = event.data as ExpenseResponse;
        if (created?.id) {
          useBillingStore.getState().upsertRoomExpense(created);
          showToast('info', 'Chủ phòng vừa tạo hóa đơn chia tiền mới!');
        } else if (roomId) {
          void fetchExpensesByRoom(roomId, true);
        }
      } else if (event.type === 'EXPENSE_UPDATED') {
        const updated = event.data as ExpenseResponse;
        if (updated?.id) {
          useBillingStore.getState().upsertRoomExpense(updated);
        } else if (roomId) {
          void fetchExpensesByRoom(roomId, true);
        }
      } else if (event.type === 'EXPENSE_DELETED') {
        const expenseId = event.data?.expenseId || event.data?.id;
        if (expenseId) {
          useBillingStore.getState().removeRoomExpense(expenseId);
          showToast('info', 'Hóa đơn chia tiền đã bị xóa.');
        } else if (roomId) {
          void fetchExpensesByRoom(roomId, true);
        }
      } else if (event.type === 'MATCH_FOUND') {
        if (roomId) {
          void fetchRoomDetails(roomId);
          void fetchRoomResults(roomId);
        }
      }
    },
    [roomId, isSessionActive, showToast, fetchExpensesByRoom, fetchRoomDetails, fetchRoomResults],
  );

  // Kích hoạt WebSocket STOMP
  const { isConnected } = useSocket({
    roomId,
    enabled: isRoomSessionEnabled,
    onMessage: handleSocketMessage,
  });

  // Tự động đồng bộ ngầm định kỳ 3000ms (Fallback Polling) để đảm bảo hai bên luôn khớp trạng thái
  useEffect(() => {
    if (!roomId || !isRoomSessionEnabled) return;

    const intervalId = window.setInterval(() => {
      if (!isSessionActive()) return;
      void fetchExpensesByRoom(roomId, true);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [roomId, isRoomSessionEnabled, isSessionActive, fetchExpensesByRoom]);

  // Host chọn quán chốt thủ công
  const handleSelectWinningPlace = useCallback(
    async (placeId: UUID) => {
      if (!roomId) return;
      const success = await hostSelectWinningPlace(roomId, placeId);
      if (success) {
        showToast('success', 'Đã chốt quán ăn cho phòng thành công!');
        void fetchRoomDetails(roomId);
        void fetchRoomResults(roomId);
      }
    },
    [roomId, hostSelectWinningPlace, showToast, fetchRoomDetails, fetchRoomResults],
  );

  // Tạo hóa đơn mới
  const handleCreateExpense = useCallback(
    async (params: Parameters<typeof buildAndCreateExpense>[0]) => {
      const expense = await buildAndCreateExpense(params);
      if (expense) {
        setShowCreateExpenseModal(false);
        showToast('success', 'Đã tạo hóa đơn chia tiền thành công!');
        if (roomId) void fetchExpensesByRoom(roomId);
      }
    },
    [buildAndCreateExpense, roomId, fetchExpensesByRoom, showToast],
  );

  // Đánh dấu 1 thành viên đã trả tiền
  const handlePaySplit = useCallback(
    async (expenseId: UUID, userId: UUID) => {
      const success = await confirmSplitPaid(expenseId, userId);
      if (success) {
        showToast('success', 'Đã xác nhận thanh toán thành công');
        if (roomId) void fetchExpensesByRoom(roomId);
      }
    },
    [confirmSplitPaid, roomId, fetchExpensesByRoom, showToast],
  );

  // Đánh dấu tất cả đã thanh toán
  const handlePayAll = useCallback(
    async (expenseId: UUID) => {
      const success = await confirmAllSplitsPaid(expenseId);
      if (success) {
        showToast('success', 'Đã xác nhận tất cả thành viên đã thanh toán!');
        if (roomId) void fetchExpensesByRoom(roomId);
      }
    },
    [confirmAllSplitsPaid, roomId, fetchExpensesByRoom, showToast],
  );

  // Xóa hóa đơn chưa thanh toán
  const handleDeleteExpense = useCallback(
    async (expenseId: UUID) => {
      const success = await removeUnpaidExpense(expenseId);
      if (success) {
        showToast('info', 'Đã xóa hóa đơn');
        if (roomId) void fetchExpensesByRoom(roomId);
      }
    },
    [removeUnpaidExpense, roomId, fetchExpensesByRoom, showToast],
  );

  const hasExpenses = roomExpenses.length > 0;

  // Tự động đóng modal tạo nếu thành viên khác đã tạo thành công
  useEffect(() => {
    if (hasExpenses && showCreateExpenseModal) {
      setShowCreateExpenseModal(false);
      showToast('info', 'Hóa đơn đã được tạo bởi thành viên khác.');
    }
  }, [hasExpenses, showCreateExpenseModal, showToast]);

  const isHost = Boolean(isCurrentUserHost || (currentRoom && currentUser && currentRoom.host.id === currentUser.id));

  return (
    <PageContainer maxWidth="lg" className="py-6 space-y-8">
      <PageHeader
        title={currentRoom?.name ? `Kết quả: ${currentRoom.name}` : 'Tổng Kết Phòng Ăn'}
        subtitle="Xem quán ăn chiến thắng, bảng bình chọn nhóm và tiến hành chia tiền hóa đơn VietQR."
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
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => void loadAllRoomData()}
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

      {isLoadingAll && !currentRoom ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" label="Đang nạp kết quả phòng ăn..." />
        </div>
      ) : (
        <div className="space-y-8">
          {/* PHẦN 1: Bảng Xếp Hạng Kết Quả Bình Chọn */}
          <SwipeResultBoard
            roomId={roomId || ''}
            results={swipeResults}
            matchedPlace={currentRoom?.matchedPlace}
            isHost={isHost}
            hasExpenseCreated={hasExpenses}
            isLoading={false}
            isSelectingPlace={isSelectingPlace}
            onSelectWinningPlace={handleSelectWinningPlace}
            onRefresh={() => {
              if (roomId) void fetchRoomResults(roomId);
            }}
            onGoToBillingClick={() => {
              const el = document.getElementById('room-billing-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* PHẦN 2: Khu Vực Quyết Toán & Chia Tiền Hóa Đơn */}
          <div id="room-billing-section" className="space-y-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-heading-sm font-bold text-foreground flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  <span>Quyết toán & Chia tiền hóa đơn</span>
                </h2>
                <p className="text-body-sm text-foreground-muted">
                  Tạo hóa đơn chia đều hoặc theo món, quét mã VietQR tự động chuyển khoản cho chủ chi.
                </p>
              </div>

              {currentRoom && !hasExpenses && currentRoom.status === 'CLOSED' ? (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<PlusCircle className="h-4 w-4" />}
                  onClick={() => setShowCreateExpenseModal(true)}
                >
                  Tạo hóa đơn chia tiền
                </Button>
              ) : currentRoom && !hasExpenses ? (
                <Alert variant="warning" title="Chưa thể tạo hóa đơn">
                  Chỉ có thể lập hóa đơn sau khi phiên quẹt đã kết thúc và phòng chuyển sang trạng thái đã đóng.
                </Alert>
              ) : null}
            </div>

            {/* Danh sách hóa đơn hiện có */}
            <RoomExpenseList
              expenses={roomExpenses}
              currentUserId={currentUser?.id}
              isHost={isHost}
              isLoading={isBillingLoading}
              onPaySplit={handlePaySplit}
              onPayAll={handlePayAll}
              onDeleteExpense={handleDeleteExpense}
              onOpenVietQR={(split) => setActiveSplitForQr(split)}
              onRetry={() => {
                if (roomId) void fetchExpensesByRoom(roomId);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Tạo hóa đơn chia tiền */}
      {currentRoom && (
        <Modal
          isOpen={showCreateExpenseModal}
          onClose={() => setShowCreateExpenseModal(false)}
          title="Tạo hóa đơn chia tiền phòng ăn"
          size="lg"
        >
          <div className="py-2">
            <ExpenseSplitCreator
              room={currentRoom}
              currentUserId={currentUser?.id}
              onCreateExpense={handleCreateExpense}
              onCancel={() => setShowCreateExpenseModal(false)}
            />
          </div>
        </Modal>
      )}

      {/* Modal Quét VietQR Thanh Toán */}
      <Modal
        isOpen={Boolean(activeSplitForQr)}
        onClose={() => setActiveSplitForQr(null)}
        title="Thanh toán qua mã VietQR"
        size="md"
      >
        {activeSplitForQr && (
          <div className="py-2">
            <VietQRPaymentCard
              split={activeSplitForQr}
              onConfirmPaidClick={() => {
                const s = activeSplitForQr;
                setActiveSplitForQr(null);
                void handlePaySplit(s.expenseId, s.user.id);
              }}
              onClose={() => setActiveSplitForQr(null)}
            />
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
