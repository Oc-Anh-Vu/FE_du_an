// Khung store quản lý tài chính, khoản nợ cá nhân (myDebts kèm VietQR) và hóa đơn phòng
import { create } from 'zustand';
import type { ExpenseResponse, ExpenseSplitResponse, UUID } from '../types';

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

export const useBillingStore = create<BillingStoreState>(() => ({
  ...initialBillingState,
  setMyDebts: () => {
    // coming soon
  },
  markMyDebtPaid: () => {
    // coming soon
  },
  setRoomExpenses: () => {
    // coming soon
  },
  upsertRoomExpense: () => {
    // coming soon
  },
  updateSplitInRoomExpense: () => {
    // coming soon
  },
  removeRoomExpense: () => {
    // coming soon
  },
  resetBillingStore: () => {
    // coming soon
  },
}));

export default useBillingStore;
