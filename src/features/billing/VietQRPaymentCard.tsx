import { CheckCircle2 } from 'lucide-react';
import type { ExpenseSplitResponse } from '../../types';
import { QRCodeDisplay } from '../../components/ui/display/QRCodeDisplay';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button } from '../../components/ui/form/Button';
import { formatVND } from '../../utils/currencyFormat';

export interface VietQRPaymentCardProps {
  split: ExpenseSplitResponse;
  onConfirmPaidClick?: (split: ExpenseSplitResponse) => Promise<void> | void;
  isPayer?: boolean;
  isSubmitting?: boolean;
  onClose?: () => void;
}

export default function VietQRPaymentCard({
  split,
  onConfirmPaidClick,
  isSubmitting = false,
  onClose,
}: VietQRPaymentCardProps) {
  const payer = split.payer;
  const receiverName = payer?.bankAccountName || payer?.username || 'Chủ nợ';
  const hasBankDetails = Boolean(payer?.bankAccountNumber);
  const qrCodeUrl = split.qrCodeUrl || undefined;

  return (
    <section aria-label={`Thông tin thanh toán cho ${split.user.username}`} className="w-full space-y-4">
      {qrCodeUrl && hasBankDetails ? (
        <QRCodeDisplay
          qrSrc={qrCodeUrl}
          amount={split.amountOwed}
          receiverName={receiverName}
          bankName={payer?.bankBin ?? undefined}
          accountNo={payer?.bankAccountNumber ?? undefined}
        />
      ) : (
        <div className="space-y-4 rounded-card border border-border bg-card p-6 shadow-card">
          <Alert variant="warning" title="Chưa có mã VietQR tự động">
            Người nhận chưa cài đặt đầy đủ tài khoản ngân hàng trong phần Hồ sơ cá nhân. Vui lòng chuyển khoản hoặc thanh toán tiền mặt theo thông tin bên dưới.
          </Alert>

          <dl className="grid gap-3 rounded-card border border-border bg-muted/40 p-4 text-body-sm sm:grid-cols-2">
            <div>
              <dt className="text-caption text-muted-foreground">Người nhận</dt>
              <dd className="font-bold text-foreground">{receiverName}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">Số tiền</dt>
              <dd className="font-bold tabular-nums text-primary-strong">
                {formatVND(split.amountOwed)}đ
              </dd>
            </div>
            {payer?.bankBin && (
              <div>
                <dt className="text-caption text-muted-foreground">Mã ngân hàng (BIN)</dt>
                <dd className="font-semibold text-foreground">{payer.bankBin}</dd>
              </div>
            )}
            {payer?.bankAccountNumber && (
              <div>
                <dt className="text-caption text-muted-foreground">Số tài khoản</dt>
                <dd className="font-semibold font-mono text-foreground">
                  {payer.bankAccountNumber}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Nút xác nhận thanh toán */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Đóng
          </Button>
        )}

        {onConfirmPaidClick && !split.paid && (
          <Button
            type="button"
            variant="primary"
            leftIcon={<CheckCircle2 aria-hidden="true" size={16} />}
            loading={isSubmitting}
            loadingText="Đang xác nhận..."
            onClick={() => void onConfirmPaidClick(split)}
          >
            Xác nhận đã chuyển khoản
          </Button>
        )}
      </div>

      <p className="text-center text-caption text-muted-foreground">
        * Nút xác nhận dùng để cập nhật trạng thái đã trả trong nhóm, không thay thế việc chuyển khoản ngân hàng thực tế.
      </p>
    </section>
  );
}
