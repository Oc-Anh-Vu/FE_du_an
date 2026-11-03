import { useState } from 'react';
import { Lock, LogOut, Play, Trash2 } from 'lucide-react';
import type { RoomResponse } from '../../types';
import { Button } from '../../components/ui/form/Button';
import { Modal } from '../../components/ui/feedback/Modal';
import { Alert } from '../../components/ui/feedback/Alert';

type ConfirmDialogType = 'close' | 'delete' | 'leave' | null;

export interface RoomHostControlsProps {
  room: RoomResponse;
  isHost: boolean;
  onStartClick?: () => Promise<void> | void;
  onCloseClick?: () => Promise<boolean | void> | boolean | void;
  onDeleteClick?: () => Promise<boolean | void> | boolean | void;
  onLeaveClick?: () => Promise<boolean | void> | boolean | void;
  isStarting?: boolean;
  isClosing?: boolean;
  isDeleting?: boolean;
  isLeaving?: boolean;
}

export default function RoomHostControls({
  room,
  isHost,
  onStartClick,
  onCloseClick,
  onDeleteClick,
  onLeaveClick,
  isStarting = false,
  isClosing = false,
  isDeleting = false,
  isLeaving = false,
}: RoomHostControlsProps) {
  const [confirmType, setConfirmType] = useState<ConfirmDialogType>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOpen = room.status === 'OPEN';
  const isClosed = room.status === 'CLOSED';

  async function handleConfirmAction() {
    setActionError(null);
    try {
      let succeeded: boolean | void = undefined;
      if (confirmType === 'close' && onCloseClick) {
        succeeded = await onCloseClick();
      } else if (confirmType === 'delete' && onDeleteClick) {
        succeeded = await onDeleteClick();
      } else if (confirmType === 'leave' && onLeaveClick) {
        succeeded = await onLeaveClick();
      }

      if (succeeded === false) {
        setActionError('Không thể hoàn tất thao tác. Vui lòng kiểm tra thông báo và thử lại.');
        return;
      }
      setConfirmType(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Thao tác không thành công. Vui lòng thử lại.',
      );
    }
  }

  const isModalBusy = isClosing || isDeleting || isLeaving;

  return (
    <div className="w-full space-y-4 rounded-card border border-border bg-card p-4 shadow-card">
      <h3 className="text-body font-bold text-foreground">
        Thao tác phòng ăn
      </h3>

      <div className="flex flex-wrap items-center gap-3">
        {/* Nút Bắt đầu quẹt thẻ (độc quyền Host và khi phòng đang OPEN) */}
        {isHost && isOpen && onStartClick && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Play aria-hidden="true" size={16} />}
            loading={isStarting}
            loadingText="Đang khởi tạo..."
            onClick={() => void onStartClick()}
          >
            Bắt đầu quẹt thẻ ngay
          </Button>
        )}

        {/* Nút Đóng phòng (độc quyền Host khi chưa đóng) */}
        {isHost && !isClosed && onCloseClick && (
          <Button
            variant="outline"
            size="md"
            leftIcon={<Lock aria-hidden="true" size={16} />}
            disabled={isModalBusy}
            onClick={() => {
              setActionError(null);
              setConfirmType('close');
            }}
          >
            Đóng phòng
          </Button>
        )}

        {/* Nút Rời phòng */}
        {onLeaveClick && (
          <Button
            variant="outline"
            size="md"
            leftIcon={<LogOut aria-hidden="true" size={16} />}
            disabled={isModalBusy}
            onClick={() => {
              setActionError(null);
              setConfirmType('leave');
            }}
          >
            Rời phòng
          </Button>
        )}

        {/* Nút Xóa phòng (độc quyền Host) */}
        {isHost && onDeleteClick && (
          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 aria-hidden="true" size={16} />}
            disabled={isModalBusy}
            onClick={() => {
              setActionError(null);
              setConfirmType('delete');
            }}
          >
            Xóa phòng
          </Button>
        )}
      </div>

      {/* Modal xác nhận Đóng / Xóa / Rời */}
      <Modal
        isOpen={confirmType !== null}
        onClose={() => {
          if (!isModalBusy) setConfirmType(null);
        }}
        title={
          confirmType === 'delete'
            ? 'Xác nhận xóa phòng ăn'
            : confirmType === 'close'
              ? 'Xác nhận đóng phòng ăn'
              : 'Xác nhận rời phòng ăn'
        }
        description={
          confirmType === 'delete'
            ? 'Toàn bộ dữ liệu phòng, danh sách quẹt thẻ và kết quả sẽ bị xóa vĩnh viễn.'
            : confirmType === 'close'
              ? 'Thành viên sẽ không thể tiếp tục quẹt thẻ trong phòng này nữa.'
              : 'Bạn sẽ rời khỏi danh sách thành viên của phòng ăn.'
        }
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={isModalBusy}
              onClick={() => setConfirmType(null)}
            >
              Hủy
            </Button>
            <Button
              variant={confirmType === 'leave' ? 'primary' : 'danger'}
              loading={isModalBusy}
              loadingText="Đang xử lý..."
              onClick={() => void handleConfirmAction()}
            >
              {confirmType === 'delete'
                ? 'Xóa phòng'
                : confirmType === 'close'
                  ? 'Đóng phòng'
                  : 'Rời phòng'}
            </Button>
          </div>
        }
      >
        {actionError && (
          <div className="mt-3">
            <Alert variant="danger">{actionError}</Alert>
          </div>
        )}
      </Modal>
    </div>
  );
}
