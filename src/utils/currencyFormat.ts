const vndFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export function formatVND(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "0";
  }
  const rounded = Math.round(amount);
  return vndFormatter.format(Object.is(rounded, -0) ? 0 : rounded);
}

export function parseVND(value: string): number {
  if (!value) {
    return 0;
  }
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}
