import {
  SplitType,
  type ExpenseCreateRequest,
  type RoomResponse,
  type UUID,
} from '../../types';

export type MemberAmounts = Record<UUID, number | null>;

export function getSplitTotal(amounts: MemberAmounts): number {
  return Object.values(amounts).reduce<number>(
    (total, amount) => total + (typeof amount === 'number' ? Math.round(amount) : 0),
    0,
  );
}

export function getExpenseAmountDifference(totalAmount: number, splitAmount: number): number {
  return Math.round(totalAmount) - Math.round(splitAmount);
}

export function buildExpenseCreateRequest({
  room,
  payerId,
  splitType,
  totalAmount,
  memberAmounts,
}: {
  room: RoomResponse;
  payerId: UUID;
  splitType: SplitType;
  totalAmount: number;
  memberAmounts: MemberAmounts;
}): ExpenseCreateRequest {
  const normalizedTotal = Math.round(totalAmount);
  if (!Number.isFinite(normalizedTotal) || normalizedTotal <= 0) {
    throw new Error('Tổng hóa đơn phải lớn hơn 0.');
  }

  const members = room.members ?? [];
  if (!members.some((member) => member.id === payerId)) {
    throw new Error('Người trả tiền phải là thành viên của phòng.');
  }

  if (splitType === SplitType.EVENLY) {
    return {
      roomId: room.id,
      payerId,
      totalAmount: normalizedTotal,
      splitType,
      items: [{ itemName: 'Tổng hóa đơn chung', price: normalizedTotal, sharerIds: null }],
    };
  }

  const items = members.flatMap((member) => {
    const rawPrice = memberAmounts[member.id];
    const price = typeof rawPrice === 'number' ? Math.round(rawPrice) : null;
    return typeof price === 'number' && price > 0
      ? [{ itemName: `Phần của ${member.username}`, price, sharerIds: [member.id] }]
      : [];
  });

  if (Object.values(memberAmounts).some((amount) => typeof amount === 'number' && amount < 0)) {
    throw new Error('Số tiền từng thành viên không được âm.');
  }
  if (items.length === 0) {
    throw new Error('Hãy nhập số tiền cho ít nhất một thành viên.');
  }
  if (items.some((item) => !Number.isFinite(item.price))) {
    throw new Error('Số tiền từng thành viên không hợp lệ.');
  }
  const itemsSum = items.reduce((sum, item) => sum + item.price, 0);
  if (itemsSum !== normalizedTotal) {
    throw new Error('Tổng các phần chia phải khớp chính xác với tổng hóa đơn.');
  }

  return { roomId: room.id, payerId, totalAmount: normalizedTotal, splitType, items };
}
