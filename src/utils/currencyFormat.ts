export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function parseVND(value: string): number {
  return Number(value.replace(/[^0-9]/g, ''));
}