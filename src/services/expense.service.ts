// Dịch vụ quản lý hóa đơn chia tiền, theo dõi nợ cá nhân và VietQR
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient';
import type {
  ExpenseCreateRequest,
  ExpenseResponse,
  ExpenseSplitResponse,
  UUID,
} from '../types';

const EXPENSES_BASE_PATH = '/api/v1/expenses';

export function createExpense(payload: ExpenseCreateRequest): Promise<ExpenseResponse> {
  return apiPost<ExpenseResponse, ExpenseCreateRequest>(EXPENSES_BASE_PATH, payload);
}

export function getExpenseById(expenseId: UUID): Promise<ExpenseResponse> {
  return apiGet<ExpenseResponse>(`${EXPENSES_BASE_PATH}/${encodeURIComponent(expenseId)}`);
}

export function getExpensesByRoom(roomId: UUID): Promise<ExpenseResponse[]> {
  return apiGet<ExpenseResponse[]>(`${EXPENSES_BASE_PATH}/room/${encodeURIComponent(roomId)}`);
}

export const getRoomExpenses = getExpensesByRoom;

export function getMyDebts(): Promise<ExpenseSplitResponse[]> {
  return apiGet<ExpenseSplitResponse[]>(`${EXPENSES_BASE_PATH}/my-debts`);
}

export const getMyUnpaidDebts = getMyDebts;

export function markSplitAsPaid(expenseId: UUID, userId: UUID): Promise<ExpenseSplitResponse> {
  return apiPatch<ExpenseSplitResponse, undefined>(
    `${EXPENSES_BASE_PATH}/${encodeURIComponent(expenseId)}/splits/${encodeURIComponent(userId)}/pay`,
  );
}

export const payExpenseSplit = markSplitAsPaid;

export function markAllSplitsAsPaid(expenseId: UUID): Promise<ExpenseResponse> {
  return apiPatch<ExpenseResponse, undefined>(
    `${EXPENSES_BASE_PATH}/${encodeURIComponent(expenseId)}/pay-all`,
  );
}

export const payAllExpenseSplits = markAllSplitsAsPaid;

export function deleteExpense(expenseId: UUID): Promise<string> {
  return apiDelete<string>(`${EXPENSES_BASE_PATH}/${encodeURIComponent(expenseId)}`);
}

export const expenseService = {
  createExpense,
  getExpenseById,
  getExpensesByRoom,
  getRoomExpenses,
  getMyDebts,
  getMyUnpaidDebts,
  markSplitAsPaid,
  payExpenseSplit,
  markAllSplitsAsPaid,
  payAllExpenseSplits,
  deleteExpense,
};

export default expenseService;
