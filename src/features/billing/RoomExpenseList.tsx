import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, EmptyState, Modal, Spinner } from "../../components/ui";
import { normalizeApiError } from "../../services/apiClient";
import {
  deleteExpense,
  getExpensesByRoom,
  getMyDebts,
  markAllSplitsAsPaid,
  markSplitAsPaid,
} from "../../services/expense.service";
import { useBillingStore } from "../../store/billingStore";
import { useUserStore } from "../../store/userStore";
import { ExpenseStatus, type ExpenseResponse, type UUID } from "../../types";
import { formatVND } from "../../utils/currencyFormat";
import VietQRPaymentCard from "./VietQRPaymentCard";

type PendingAction =
  | { kind: "pay"; expenseId: UUID; userId: UUID; username: string }
  | { kind: "pay-all"; expenseId: UUID }
  | { kind: "delete"; expenseId: UUID };

export interface RoomExpenseListProps {
  roomId: UUID;
}

export default function RoomExpenseList({ roomId }: RoomExpenseListProps) {
  const currentUser = useUserStore((state) => state.currentUser);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getExpensesByRoom(roomId);
      setExpenses(result);
      const currentExpenses = useBillingStore.getState().roomExpenses;
      useBillingStore.getState().setRoomExpenses([
        ...currentExpenses.filter((expense) => expense.room.id !== roomId),
        ...result,
      ]);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    let active = true;
    getExpensesByRoom(roomId)
      .then((result) => {
        if (!active) return;
        setExpenses(result);
        const currentExpenses = useBillingStore.getState().roomExpenses;
        useBillingStore.getState().setRoomExpenses([
          ...currentExpenses.filter((expense) => expense.room.id !== roomId),
          ...result,
        ]);
      })
      .catch((requestError: unknown) => {
        if (active) setError(normalizeApiError(requestError).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [roomId]);

  const refreshRelatedData = async () => {
    const [updatedExpenses, updatedDebts] = await Promise.all([
      getExpensesByRoom(roomId),
      getMyDebts(),
    ]);
    setExpenses(updatedExpenses);
    const billingStore = useBillingStore.getState();
    billingStore.setRoomExpenses([
      ...billingStore.roomExpenses.filter((expense) => expense.room.id !== roomId),
      ...updatedExpenses,
    ]);
    billingStore.setMyDebts(updatedDebts);
  };

  const runPendingAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    setError(null);
    try {
      if (pendingAction.kind === "pay") {
        await markSplitAsPaid(pendingAction.expenseId, pendingAction.userId);
      } else if (pendingAction.kind === "pay-all") {
        await markAllSplitsAsPaid(pendingAction.expenseId);
      } else {
        await deleteExpense(pendingAction.expenseId);
      }
      setPendingAction(null);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
      setActionLoading(false);
      return;
    }

    try {
      await refreshRelatedData();
    } catch (refreshError) {
      setError(
        `Thao tác đã thành công nhưng không thể tải lại dữ liệu mới: ${
          normalizeApiError(refreshError).message
        }`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6" aria-live="polite">
        <Spinner />
        <span className="text-body-sm text-muted-foreground">Đang tải hóa đơn phòng...</span>
      </div>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <Alert
        variant="danger"
        title="Không tải được hóa đơn"
        action={<Button variant="outline" size="sm" onClick={() => void loadExpenses()}>Thử lại</Button>}
      >
        {error}
      </Alert>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-3">
        {error && <Alert variant="danger" title="Không tải được hóa đơn">{error}</Alert>}
        <EmptyState title="Phòng chưa có hóa đơn" description="Hóa đơn sẽ xuất hiện ở đây sau khi được tạo." />
      </div>
    );
  }

  const selectedExpense = pendingAction
    ? expenses.find((expense) => expense.id === pendingAction.expenseId)
    : undefined;
  const actionDescription =
    pendingAction?.kind === "pay"
      ? `Xác nhận ${pendingAction.username} đã báo thanh toán khoản nợ này? Ứng dụng không xác minh giao dịch ngân hàng.`
      : pendingAction?.kind === "pay-all"
        ? "Xác nhận toàn bộ các khoản đã thanh toán? Hành động này cập nhật trạng thái trong ứng dụng, không xác minh giao dịch ngân hàng."
        : "Xóa hóa đơn chưa thanh toán này? Không thể hoàn tác.";

  return (
    <section aria-labelledby="room-expenses-title" className="space-y-5">
      <h2 id="room-expenses-title" className="text-heading-sm font-bold">Hóa đơn phòng</h2>
      {error && (
        <Alert
          variant="danger"
          title="Cần kiểm tra trạng thái hóa đơn"
          action={<Button variant="outline" size="sm" onClick={() => void loadExpenses()}>Tải lại hóa đơn</Button>}
        >
          {error}
        </Alert>
      )}
      {expenses.map((expense) => {
        const isPayer = currentUser?.id === expense.payer.id;
        const isHost = currentUser?.id === expense.room.host.id;
        const canDelete = (isPayer || isHost) && expense.status === ExpenseStatus.UNPAID;
        const unpaidSplits = expense.splits.filter((split) => !split.paid);

        return (
          <Card
            key={expense.id}
            title={`Hóa đơn ${expense.room.name || "phòng ăn"}`}
            description={`Người trả: ${expense.payer.username} · ${new Date(expense.createdAt).toLocaleDateString("vi-VN")}`}
            headerAction={
              <Badge variant={expense.status === ExpenseStatus.FULLY_PAID ? "success" : expense.status === ExpenseStatus.PARTIALLY_PAID ? "warning" : "danger"}>
                {expense.status === ExpenseStatus.FULLY_PAID
                  ? "Đã đủ"
                  : expense.status === ExpenseStatus.PARTIALLY_PAID
                    ? "Đã trả một phần"
                    : "Chưa thanh toán"}
              </Badge>
            }
          >
            <div className="space-y-5">
              <p className="text-heading-sm font-bold tabular-nums">
                Tổng cộng: {formatVND(expense.totalAmount)}đ
              </p>
              <section aria-label="Các khoản trong hóa đơn" className="space-y-2">
                <h3 className="font-semibold">Chi tiết</h3>
                <ul className="space-y-1">
                  {expense.items.map((item) => (
                    <li key={item.id} className="flex flex-wrap justify-between gap-2 text-body-sm">
                      <span>{item.itemName}</span>
                      <span className="tabular-nums">{formatVND(item.price)}đ</span>
                    </li>
                  ))}
                </ul>
              </section>

              {isPayer && unpaidSplits.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setPendingAction({ kind: "pay-all", expenseId: expense.id })}
                >
                  Xác nhận tất cả đã trả
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  onClick={() => setPendingAction({ kind: "delete", expenseId: expense.id })}
                >
                  Xóa hóa đơn
                </Button>
              )}

              <ul className="space-y-4">
                {expense.splits.map((split) => {
                  const isDebtor = currentUser?.id === split.user.id;
                  const canConfirmPaid = !split.paid && (isPayer || isDebtor);
                  return (
                    <li key={split.user.id} className="space-y-3 border-t border-border pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{split.user.username}</p>
                          <p className="text-body-sm tabular-nums text-muted-foreground">
                            {formatVND(split.amountOwed)}đ · {split.paid ? "Đã xác nhận" : "Chưa thanh toán"}
                          </p>
                        </div>
                        {canConfirmPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setPendingAction({
                                kind: "pay",
                                expenseId: expense.id,
                                userId: split.user.id,
                                username: split.user.username,
                              })
                            }
                          >
                            {isPayer && !isDebtor ? "Xác nhận đã nhận tiền" : "Tôi đã chuyển khoản"}
                          </Button>
                        )}
                      </div>
                      {!split.paid && <VietQRPaymentCard split={{ ...split, payer: split.payer ?? expense.payer }} />}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        );
      })}

      <Modal
        isOpen={pendingAction !== null}
        onClose={() => {
          if (!actionLoading) setPendingAction(null);
        }}
        title={
          pendingAction?.kind === "delete"
            ? "Xóa hóa đơn?"
            : pendingAction?.kind === "pay-all"
              ? "Xác nhận tất cả khoản nợ?"
              : "Xác nhận khoản đã thanh toán?"
        }
        description={actionDescription}
        closeOnOverlayClick={!actionLoading}
        closeOnEsc={!actionLoading}
        footer={
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button variant="outline" disabled={actionLoading} onClick={() => setPendingAction(null)}>
              Hủy
            </Button>
            <Button
              variant={pendingAction?.kind === "delete" ? "danger" : "primary"}
              loading={actionLoading}
              disabled={!selectedExpense}
              onClick={() => void runPendingAction()}
            >
              Xác nhận
            </Button>
          </div>
        }
      >
        {error && <Alert variant="danger" title="Thao tác chưa hoàn tất">{error}</Alert>}
      </Modal>
    </section>
  );
}