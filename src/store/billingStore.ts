// Store quản lý trạng thái tài chính: khoản nợ cá nhân (myDebts kèm VietQR) và hóa đơn phòng (FE_SPEC.md Mục 5.2)
import { create } from 'zustand';
import {
  ExpenseStatus,
  type ExpenseResponse,
  type ExpenseSplitResponse,
  type UUID,
} from '../types';

export interface BillingStoreData {
  myDebts: ExpenseSplitResponse[];
  roomExpenses: ExpenseResponse[];
}

export interface BillingStoreState extends BillingStoreData {
  setMyDebts: (debts: ExpenseSplitResponse[]) => void;
  markMyDebtPaid: (expenseId: UUID, userId?: UUID) => void;
  setRoomExpenses: (expenses: ExpenseResponse[]) => void;
  upsertRoomExpense: (expense: ExpenseResponse) => void;
  updateSplitInRoomExpense: (updatedSplit: ExpenseSplitResponse) => void;
  removeRoomExpense: (expenseId: UUID) => void;
  resetBillingStore: () => void;
}

export const initialBillingState: BillingStoreData = {
  myDebts: [],
  roomExpenses: [],
};

function computeExpenseStatus(splits: ExpenseSplitResponse[]): {
  status: ExpenseStatus;
  fullyPaid: boolean;
} {
  if (splits.length === 0) {
    return { status: ExpenseStatus.UNPAID, fullyPaid: false };
  }
  const paidCount = splits.filter((split) => split.paid).length;
  if (paidCount === 0) {
    return { status: ExpenseStatus.UNPAID, fullyPaid: false };
  }
  if (paidCount === splits.length) {
    return { status: ExpenseStatus.FULLY_PAID, fullyPaid: true };
  }
  return { status: ExpenseStatus.PARTIALLY_PAID, fullyPaid: false };
}

export const useBillingStore = create<BillingStoreState>((set) => ({
  ...initialBillingState,

  setMyDebts: (debts) =>
    set({
      myDebts: Array.isArray(debts) ? debts : [],
    }),

  markMyDebtPaid: (expenseId, userId) =>
    set((state) => ({
      myDebts: state.myDebts.filter(
        (split) =>
          !(split.expenseId === expenseId && (userId === undefined || split.user.id === userId)),
      ),
    })),

  setRoomExpenses: (expenses) =>
    set({
      roomExpenses: Array.isArray(expenses) ? expenses : [],
    }),

  upsertRoomExpense: (expense) =>
    set((state) => {
      const index = state.roomExpenses.findIndex((item) => item.id === expense.id);
      if (index === -1) {
        return {
          roomExpenses: [expense, ...state.roomExpenses],
        };
      }
      const nextExpenses = [...state.roomExpenses];
      nextExpenses[index] = expense;
      return {
        roomExpenses: nextExpenses,
      };
    }),

  updateSplitInRoomExpense: (updatedSplit) =>
    set((state) => {
      const nextRoomExpenses = state.roomExpenses.map((expense) => {
        if (expense.id !== updatedSplit.expenseId) {
          return expense;
        }
        const nextSplits = expense.splits.map((split) =>
          split.user.id === updatedSplit.user.id ? { ...split, ...updatedSplit } : split,
        );
        const { status, fullyPaid } = computeExpenseStatus(nextSplits);
        return {
          ...expense,
          splits: nextSplits,
          status,
          fullyPaid,
        };
      });

      const nextMyDebts = updatedSplit.paid
        ? state.myDebts.filter(
            (debt) =>
              !(
                debt.expenseId === updatedSplit.expenseId &&
                debt.user.id === updatedSplit.user.id
              ),
          )
        : state.myDebts.map((debt) =>
            debt.expenseId === updatedSplit.expenseId && debt.user.id === updatedSplit.user.id
              ? { ...debt, ...updatedSplit }
              : debt,
          );

      return {
        roomExpenses: nextRoomExpenses,
        myDebts: nextMyDebts,
      };
    }),

  removeRoomExpense: (expenseId) =>
    set((state) => ({
      roomExpenses: state.roomExpenses.filter((expense) => expense.id !== expenseId),
      myDebts: state.myDebts.filter((debt) => debt.expenseId !== expenseId),
    })),

  resetBillingStore: () =>
    set({
      ...initialBillingState,
    }),
}));

export default useBillingStore;
