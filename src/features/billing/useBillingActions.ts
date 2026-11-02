import { useCallback, useState } from 'react';
import type {
  ExpenseResponse,
  ExpenseSplitResponse,
  RoomResponse,
  SplitType,
  UUID,
} from '../../types';
import { ApiErrorCode } from '../../types';
import { expenseService } from '../../services/expense.service';
import { useBillingStore } from '../../store/billingStore';
import { useUIStore } from '../../store/uiStore';
import {
  buildExpenseCreateRequest,
  type MemberAmounts,
} from './billingHelpers';

export interface UseBillingActionsReturn {
  myDebts: ExpenseSplitResponse[];
  roomExpenses: ExpenseResponse[];
  isLoading: boolean;
  error: string | null;
  fetchMyUnpaidDebts: () => Promise<ExpenseSplitResponse[]>;
  fetchExpensesByRoom: (roomId: UUID) => Promise<ExpenseResponse[]>;
  buildAndCreateExpense: (params: {
    room: RoomResponse;
    payerId: UUID;
    totalAmount: number;
    splitType: SplitType;
    memberAmounts: MemberAmounts;
  }) => Promise<ExpenseResponse | null>;
  confirmSplitPaid: (expenseId: UUID, userId: UUID) => Promise<boolean>;
  confirmAllSplitsPaid: (expenseId: UUID) => Promise<boolean>;
  removeUnpaidExpense: (expenseId: UUID) => Promise<boolean>;
  clearError: () => void;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error && typeof error === 'object') {
    const err = error as { code?: number; message?: string; status?: number };
    if (err.code === ApiErrorCode.BILL_AMOUNT_MISMATCH) {
      return 'Tổng các khoản chia không khớp với tổng tiền hóa đơn.';
    }
    if (err.code === ApiErrorCode.ROOM_NOT_CLOSED) {
      return 'Phòng ăn chưa đóng phiên quẹt thẻ, không thể tạo hóa đơn lúc này.';
    }
    if (err.code === ApiErrorCode.EXPENSE_ALREADY_EXISTS) {
      return 'Phòng ăn đã tồn tại hóa đơn chi phí. Vui lòng xóa hóa đơn cũ trước khi tạo lại.';
    }
    if (err.code === ApiErrorCode.CANNOT_DELETE_PAID_EXPENSE) {
      return 'Hóa đơn đã có thành viên thanh toán nên không thể xóa.';
    }
    if (err.code === ApiErrorCode.EXPENSE_NOT_FOUND) {
      return 'Không tìm thấy thông tin hóa đơn chi phí.';
    }
    if (err.message) {
      return err.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}

export function useBillingActions(): UseBillingActionsReturn {
  const myDebts = useBillingStore((state) => state.myDebts);
  const roomExpenses = useBillingStore((state) => state.roomExpenses);

  const setMyDebts = useBillingStore((state) => state.setMyDebts);
  const markMyDebtPaid = useBillingStore((state) => state.markMyDebtPaid);
  const setRoomExpenses = useBillingStore((state) => state.setRoomExpenses);
  const upsertRoomExpense = useBillingStore((state) => state.upsertRoomExpense);
  const updateSplitInRoomExpense = useBillingStore((state) => state.updateSplitInRoomExpense);
  const removeRoomExpense = useBillingStore((state) => state.removeRoomExpense);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Lấy danh sách các khoản nợ cá nhân chưa thanh toán */
  const fetchMyUnpaidDebts = useCallback(async (): Promise<ExpenseSplitResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const debts = await expenseService.getMyDebts();
      const validDebts = Array.isArray(debts) ? debts : [];
      setMyDebts(validDebts);
      return validDebts;
    } catch (err) {
      const message = getErrorMessage(err, 'Không thể tải danh sách khoản nợ của bạn.');
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setMyDebts]);

  /** Lấy danh sách hóa đơn theo phòng ăn */
  const fetchExpensesByRoom = useCallback(
    async (roomId: UUID): Promise<ExpenseResponse[]> => {
      setIsLoading(true);
      setError(null);
      try {
        const expenses = await expenseService.getExpensesByRoom(roomId);
        const validExpenses = Array.isArray(expenses) ? expenses : [];

        // Đồng bộ danh sách hóa đơn của phòng vào store
        const currentAllExpenses = useBillingStore.getState().roomExpenses;
        const otherExpenses = currentAllExpenses.filter((e) => e.room.id !== roomId);
        setRoomExpenses([...otherExpenses, ...validExpenses]);

        return validExpenses;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tải danh sách hóa đơn của phòng.');
        setError(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [setRoomExpenses],
  );

  /** Đóng gói payload chuẩn FE_SPEC Mục 6.5 và tạo hóa đơn mới */
  const buildAndCreateExpense = useCallback(
    async (params: {
      room: RoomResponse;
      payerId: UUID;
      totalAmount: number;
      splitType: SplitType;
      memberAmounts: MemberAmounts;
    }): Promise<ExpenseResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = buildExpenseCreateRequest(params);
        const createdExpense = await expenseService.createExpense(payload);

        upsertRoomExpense(createdExpense);
        useUIStore.getState().showToast('success', 'Đã tạo hóa đơn chia tiền thành công!');
        return createdExpense;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể tạo hóa đơn chia tiền.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [upsertRoomExpense],
  );

  /** Xác nhận 1 thành viên đã thanh toán khoản chia của họ */
  const confirmSplitPaid = useCallback(
    async (expenseId: UUID, userId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedSplit = await expenseService.markSplitAsPaid(expenseId, userId);

        updateSplitInRoomExpense(updatedSplit);
        markMyDebtPaid(expenseId, userId);
        useUIStore.getState().showToast('success', 'Đã xác nhận thanh toán phần chia!');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xác nhận thanh toán.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [markMyDebtPaid, updateSplitInRoomExpense],
  );

  /** Xác nhận toàn bộ thành viên trong hóa đơn đã thanh toán */
  const confirmAllSplitsPaid = useCallback(
    async (expenseId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedExpense = await expenseService.markAllSplitsAsPaid(expenseId);

        upsertRoomExpense(updatedExpense);
        useUIStore.getState().showToast('success', 'Đã xác nhận tất cả thành viên thanh toán xong!');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xác nhận thanh toán tất cả.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [upsertRoomExpense],
  );

  /** Xóa hóa đơn chưa thanh toán (chỉ cho phép khi UNPAID) */
  const removeUnpaidExpense = useCallback(
    async (expenseId: UUID): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await expenseService.deleteExpense(expenseId);

        removeRoomExpense(expenseId);
        useUIStore.getState().showToast('info', 'Đã xóa hóa đơn chi phí.');
        return true;
      } catch (err) {
        const message = getErrorMessage(err, 'Không thể xóa hóa đơn chi phí.');
        setError(message);
        useUIStore.getState().showToast('danger', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [removeRoomExpense],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    myDebts,
    roomExpenses,
    isLoading,
    error,
    fetchMyUnpaidDebts,
    fetchExpensesByRoom,
    buildAndCreateExpense,
    confirmSplitPaid,
    confirmAllSplitsPaid,
    removeUnpaidExpense,
    clearError,
  };
}

export default useBillingActions;
