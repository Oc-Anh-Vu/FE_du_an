import { useCallback, useEffect, useState } from "react";
import { Alert, Button, EmptyState, Spinner } from "../../components/ui";
import { normalizeApiError } from "../../services/apiClient";
import { getMyDebts } from "../../services/expense.service";
import { useBillingStore } from "../../store/billingStore";
import { formatVND } from "../../utils/currencyFormat";
import VietQRPaymentCard from "./VietQRPaymentCard";

export interface DebtWarningBannerProps {
  compact?: boolean;
}

export default function DebtWarningBanner({ compact = false }: DebtWarningBannerProps) {
  const debts = useBillingStore((state) => state.myDebts);
  const setMyDebts = useBillingStore((state) => state.setMyDebts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDebts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyDebts();
      setMyDebts(result);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [setMyDebts]);

  useEffect(() => {
    let active = true;
    getMyDebts()
      .then((result) => {
        if (active) setMyDebts(result);
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
  }, [setMyDebts]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4" aria-live="polite">
        <Spinner size="sm" />
        <span className="text-body-sm text-muted-foreground">Đang tải các khoản nợ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="Không tải được các khoản nợ"
        action={<Button variant="outline" size="sm" onClick={() => void loadDebts()}>Thử lại</Button>}
      >
        {error}
      </Alert>
    );
  }

  const unpaidDebts = debts.filter((debt) => !debt.paid);
  if (unpaidDebts.length === 0) {
    return (
      <EmptyState
        size={compact ? "sm" : "md"}
        title="Bạn không có khoản nợ chưa thanh toán"
        description="Danh sách này chỉ bao gồm các khoản chưa thanh toán được trả về từ máy chủ."
      />
    );
  }

  const totalOwed = unpaidDebts.reduce((total, debt) => total + debt.amountOwed, 0);

  return (
    <section aria-labelledby="personal-debts-title" className="space-y-5">
      <Alert
        variant="warning"
        title="Khoản cần thanh toán"
        action={<Button variant="outline" size="sm" onClick={() => void loadDebts()}>Tải lại khoản nợ</Button>}
      >
        Bạn có {unpaidDebts.length} khoản chưa thanh toán, tổng cộng{" "}
        <strong className="tabular-nums">{formatVND(totalOwed)}đ</strong>.
        {!compact && (
          <> Đây không phải lịch sử các khoản đã thanh toán.</>
        )}
      </Alert>
      <h2 id="personal-debts-title" className="text-heading-sm font-bold">
        Khoản nợ chưa thanh toán
      </h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {unpaidDebts.map((debt) => (
          <article key={`${debt.expenseId}-${debt.user.id}`} className="space-y-3 rounded-card border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">Người nhận: {debt.payer?.username ?? "Chưa rõ"}</h3>
              <p className="text-body-sm text-muted-foreground">Mã hóa đơn: {debt.expenseId}</p>
            </div>
            <VietQRPaymentCard split={debt} />
          </article>
        ))}
      </div>
    </section>
  );
}