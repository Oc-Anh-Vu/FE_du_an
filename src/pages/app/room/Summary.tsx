// Màn hình Tổng kết kết quả quẹt thẻ, Bầu chọn chốt quán & Chia tiền VietQR
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Receipt, RefreshCw } from 'lucide-react';
import type { ExpenseSplitResponse, UUID } from '../../../types';
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

  // Room Actions
  const { currentRoom, isCurrentUserHost, fetchRoomDetails } = useRoomActions();

  // Swipe Actions
  const {
    swipeResults,
    isSelectingPlace,
    fetchRoomResults,
    hostSelectWinningPlace,
  } = useSwipeActions();

  // Billing Actions
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
  const isHost = Boolean(isCurrentUserHost || (currentRoom && currentUser && currentRoom.host.id === currentUser.id));

  return (
    <PageContainer maxWidth="lg" className="py-6 space-y-8">
      <PageHeader
        title={currentRoom?.name ? `Kết quả: ${currentRoom.name}` : 'Tổng Kết Phòng Ăn'}
        subtitle="Xem quán ăn chiến thắng, bảng bình chọn nhóm và tiến hành chia tiền hóa đơn VietQR."
        action={
          <div className="flex items-center gap-2">
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
