import { useState } from 'react';
import {
  Check,
  CheckCheck,
  QrCode,
  Receipt,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import type { ExpenseResponse, ExpenseSplitResponse, UUID } from '../../types';
import { Card } from '../../components/ui/display/Card';
import { Badge } from '../../components/ui/display/Badge';
import { Button } from '../../components/ui/form/Button';
import { Modal } from '../../components/ui/feedback/Modal';
import { Alert } from '../../components/ui/feedback/Alert';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { formatVND } from '../../utils/currencyFormat';

export interface RoomExpenseListProps {
  expenses: ExpenseResponse[];
  currentUserId?: UUID;
  isHost?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onPaySplit?: (expenseId: UUID, userId: UUID) => Promise<boolean | void>;
  onPayAll?: (expenseId: UUID) => Promise<boolean | void>;
  onDeleteExpense?: (expenseId: UUID) => Promise<boolean | void>;
  onOpenVietQR?: (split: ExpenseSplitResponse) => void;
  onRetry?: () => void;
}

const expenseStatusMeta = {
  UNPAID: { label: 'Chưa thanh toán', variant: 'danger' as const },
  PARTIALLY_PAID: { label: 'Đang thanh toán', variant: 'warning' as const },
  FULLY_PAID: { label: 'Đã thanh toán đủ', variant: 'success' as const },
};

export default function RoomExpenseList({
  expenses = [],
  currentUserId,
  isHost = false,
  isLoading = false,
  error = null,
  onPaySplit,
  onPayAll,
  onDeleteExpense,
  onOpenVietQR,
  onRetry,
}: RoomExpenseListProps) {
  const [expenseToDelete, setExpenseToDelete] = useState<UUID | null>(null);
  const [expenseToPayAll, setExpenseToPayAll] = useState<UUID | null>(null);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handlePaySplit(expenseId: UUID, userId: UUID) {
    if (!onPaySplit) return;
    const actionKey = `${expenseId}-${userId}`;
    setBusyActionId(actionKey);
    setActionError(null);
    try {
      await onPaySplit(expenseId, userId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán.');
    } finally {
      setBusyActionId(null);
    }
  }

  async function handleConfirmPayAll() {
    if (!expenseToPayAll || !onPayAll) return;
    setBusyActionId(`pay-all-${expenseToPayAll}`);
    setActionError(null);
    try {
      await onPayAll(expenseToPayAll);
      setExpenseToPayAll(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán tất cả.');
    } finally {
      setBusyActionId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!expenseToDelete || !onDeleteExpense) return;
    setBusyActionId(`delete-${expenseToDelete}`);
    setActionError(null);
    try {
      await onDeleteExpense(expenseToDelete);
      setExpenseToDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không thể xóa hóa đơn chi phí.');
    } finally {
      setBusyActionId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Đang tải hóa đơn chi phí..." />
      </div>
    );
  }

  return (
    <section aria-labelledby="room-expenses-title" className="w-full space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 id="room-expenses-title" className="text-heading-sm font-bold text-foreground">
            Hóa đơn chi phí phòng
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Theo dõi các khoản tiền chia và xác nhận thanh toán giữa các thành viên
          </p>
        </div>

        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Làm mới
          </Button>
        )}
      </header>

      {error && (
        <Alert variant="danger" title="Lỗi tải hóa đơn">
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert variant="danger" title="Lỗi thao tác">
          {actionError}
        </Alert>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          title="Chưa có hóa đơn nào"
          description="Hóa đơn sẽ được tạo sau khi nhóm chốt quán ăn thành công."
          icon="🧾"
          size="sm"
        />
      ) : (
        <div className="space-y-6">
          {expenses.map((expense) => {
            const isPayer = expense.payer.id === currentUserId;
            const canManageExpense = isPayer || isHost;
            const status = expenseStatusMeta[expense.status] ?? expenseStatusMeta.UNPAID;
            const canDelete = canManageExpense && expense.status === 'UNPAID';

            return (
              <Card
                key={expense.id}
                as="article"
                className="overflow-hidden rounded-card border border-border bg-card p-6 shadow-card space-y-5"
              >
                {/* Header hóa đơn */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Receipt size={18} className="text-primary" />
                      <h3 className="text-heading-sm font-bold text-foreground">
                        Tổng hóa đơn: {formatVND(expense.totalAmount)}đ
                      </h3>
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>

                    <p className="text-body-sm text-muted-foreground">
                      Chủ nợ: <strong className="text-foreground">{expense.payer.username}</strong>
                      {isPayer && <span className="ml-1 text-caption font-semibold text-primary">(Bạn)</span>}
                      {' · '}Hình thức:{' '}
                      <span className="font-semibold">
                        {expense.splitType === 'EVENLY' ? 'Chia đều' : 'Theo món'}
                      </span>
                    </p>
                  </div>

                  {/* Nút thao tác quản lý cấp hóa đơn */}
                  {(isPayer || canDelete) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {isPayer && !expense.fullyPaid && onPayAll && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<CheckCheck aria-hidden="true" size={16} />}
                          onClick={() => {
                            setActionError(null);
                            setExpenseToPayAll(expense.id);
                          }}
                        >
                          Xác nhận tất cả đã trả
                        </Button>
                      )}

                      {canDelete && onDeleteExpense && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 aria-hidden="true" size={16} />}
                          className="text-danger hover:bg-danger-soft"
                          onClick={() => {
                            setActionError(null);
                            setExpenseToDelete(expense.id);
                          }}
                        >
                          Xóa hóa đơn
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Danh sách các phần chia splits */}
                <div className="space-y-3">
                  <h4 className="text-body-sm font-bold text-foreground flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    <span>Chi tiết phần chia từng thành viên</span>
                  </h4>

                  <ul className="divide-y divide-border rounded-card border border-border bg-muted/20" role="list">
                    {expense.splits.map((split) => {
                      const isUserDebtor = split.user.id === currentUserId;
                      const isBusy = busyActionId === `${expense.id}-${split.user.id}`;

                      return (
                        <li
                          key={split.user.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-3.5 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-caption">
                              <User size={15} />
                            </div>
                            <div>
                              <p className="text-body-sm font-bold text-foreground">
                                {split.user.username}{' '}
                                {isUserDebtor && (
                                  <span className="text-caption font-semibold text-primary">(Bạn)</span>
                                )}
                              </p>
                              <p className="text-caption font-semibold tabular-nums text-primary-strong">
                                {formatVND(split.amountOwed)}đ
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Badge
                              variant={split.paid ? 'success' : 'warning'}
                              size="sm"
                            >
                              {split.paid ? 'Đã thanh toán' : 'Chưa trả'}
                            </Badge>

                            {/* Nút xem mã VietQR cho người nợ */}
                            {!split.paid && isUserDebtor && onOpenVietQR && (
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={<QrCode aria-hidden="true" size={14} />}
                                onClick={() => onOpenVietQR(split)}
                              >
                                Xem mã VietQR
                              </Button>
                            )}

                            {/* Nút xác nhận đã trả: CHỈ HIỂN THỊ CHO CHỦ NỢ (isPayer) */}
                            {!split.paid && isPayer && onPaySplit && (
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<Check aria-hidden="true" size={14} />}
                                loading={isBusy}
                                loadingText="Đang xác nhận..."
                                onClick={() => void handlePaySplit(expense.id, split.user.id)}
                              >
                                Xác nhận đã trả
                              </Button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal xác nhận xóa hóa đơn */}
      <Modal
        isOpen={expenseToDelete !== null}
        onClose={() => setExpenseToDelete(null)}
        title="Xác nhận xóa hóa đơn"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExpenseToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={busyActionId?.startsWith('delete-')}
              loadingText="Đang xóa..."
              onClick={() => void handleConfirmDelete()}
            >
              Xóa hóa đơn
            </Button>
          </div>
        }
      >
        <p className="text-body-sm text-muted-foreground">
          Bạn có chắc muốn xóa hóa đơn chi phí này? Toàn bộ danh sách chia tiền chưa thanh toán sẽ bị hủy.
        </p>
      </Modal>

      {/* Modal xác nhận thanh toán tất cả */}
      <Modal
        isOpen={expenseToPayAll !== null}
        onClose={() => setExpenseToPayAll(null)}
        title="Xác nhận thanh toán tất cả"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExpenseToPayAll(null)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              loading={busyActionId?.startsWith('pay-all-')}
              loadingText="Đang xác nhận..."
              onClick={() => void handleConfirmPayAll()}
            >
              Xác nhận tất cả
            </Button>
          </div>
        }
      >
        <p className="text-body-sm text-muted-foreground">
          Đánh dấu tất cả các thành viên trong hóa đơn này đã hoàn tất thanh toán tiền nợ?
        </p>
      </Modal>
    </section>
  );
}
