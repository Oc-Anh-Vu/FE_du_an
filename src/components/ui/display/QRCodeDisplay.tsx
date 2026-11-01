import { forwardRef, useState } from "react";
import { Card } from "./Card";
import { Button } from "../form/Button";
import { Skeleton } from "../feedback/Skeleton";
import { formatVND } from "../../../utils/currencyFormat";
import { cn } from "../../../utils/cn";

export interface QRCodeDisplayProps extends React.HTMLAttributes<HTMLElement> {
  qrSrc?: string;
  loading?: boolean;
  hasError?: boolean;
  amount: number;
  receiverName: string;
  bankName?: string;
  accountNo?: string;
  note?: string;
  onRetry?: () => void;
}

export const QRCodeDisplay = forwardRef<HTMLElement, QRCodeDisplayProps>(
  ({ className, qrSrc, loading = false, hasError = false, amount, receiverName, bankName, accountNo, note, onRetry, ...props }, ref) => {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const imageFailed = Boolean(qrSrc && failedSrc === qrSrc);
    const showError = hasError || imageFailed;

    return (
    <Card
      ref={ref}
      className={cn("mx-auto max-w-xs text-center", className)}
      padding="none"
      {...props}
    >
      <div className="bg-primary-hover p-4 text-primary-foreground">
        <p className="text-caption">Thanh toán cho</p>
        <p className="text-heading-sm font-bold">{receiverName}</p>
      </div>
      <div className="flex flex-col items-center p-6">
        <div className="mb-4 flex size-48 items-center justify-center overflow-hidden rounded-panel border border-border bg-card" aria-busy={loading}>
          {loading ? (
            <Skeleton variant="rect" width="100%" height="100%" aria-label="Đang tải mã QR" />
          ) : showError || !qrSrc ? (
            <div className="space-y-2 p-4">
              <p className="text-body-sm font-semibold text-danger-soft-foreground">Không tải được mã QR</p>
              <p className="text-caption text-muted-foreground">Vui lòng chuyển khoản thủ công</p>
              {onRetry && <Button size="sm" variant="outline" onClick={() => { setFailedSrc(null); onRetry(); }}>Thử lại</Button>}
            </div>
          ) : (
            <img
              src={qrSrc}
              alt={`Mã VietQR chuyển ${formatVND(amount)} đồng cho ${receiverName}`}
              className="h-full w-full object-contain"
              onError={() => setFailedSrc(qrSrc)}
            />
          )}
        </div>
        <dl className="w-full space-y-3 text-left">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-caption text-muted-foreground">Số tiền</dt>
            <dd className="text-heading-sm font-bold tabular-nums text-primary-strong">{formatVND(amount)}đ</dd>
          </div>
          {bankName && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-caption text-muted-foreground">Ngân hàng</dt>
              <dd className="text-body-sm font-semibold text-foreground">{bankName}</dd>
            </div>
          )}
          {accountNo && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-caption text-muted-foreground">Số tài khoản</dt>
              <dd className="text-body-sm font-semibold text-foreground">{showError ? accountNo : `•••• ${accountNo.slice(-4)}`}</dd>
            </div>
          )}
          {note && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-caption text-muted-foreground">Nội dung</dt>
              <dd className="max-w-48 break-words text-right text-body-sm font-semibold text-foreground">{note}</dd>
            </div>
          )}
        </dl>
      </div>
    </Card>
    );
  },
);
QRCodeDisplay.displayName = "QRCodeDisplay";
