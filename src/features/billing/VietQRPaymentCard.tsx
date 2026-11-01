import { Link } from "react-router-dom";
import { QRCodeDisplay, Alert } from "../../components/ui";
import type { ExpenseSplitResponse } from "../../types";

export interface VietQRPaymentCardProps {
  split: ExpenseSplitResponse;
}

export default function VietQRPaymentCard({ split }: VietQRPaymentCardProps) {
  const payer = split.payer;
  const receiverName = payer?.bankAccountName || payer?.username || "Chủ nợ";
  const hasBankDetails = Boolean(payer?.bankAccountNumber);
  const qrCodeUrl = split.qrCodeUrl || undefined;

  return (
    <section aria-label={`Thông tin thanh toán cho ${split.user.username}`} className="space-y-3">
      {qrCodeUrl && hasBankDetails ? (
        <QRCodeDisplay
          qrSrc={qrCodeUrl}
          amount={split.amountOwed}
          receiverName={receiverName}
          bankName={payer?.bankBin ?? undefined}
          accountNo={payer?.bankAccountNumber ?? undefined}
        />
      ) : (
        <div className="space-y-3">
          <Alert variant="warning" title="Chưa có mã VietQR">
            Người nhận chưa cấu hình đầy đủ thông tin ngân hàng. Vui lòng liên hệ người nhận để
            chuyển khoản thủ công.
            {payer?.id && (
              <>
                {" "}
                Người nhận có thể cập nhật thông tin tại{" "}
                <Link className="font-semibold underline" to="/app/profile">
                  Hồ sơ
                </Link>
                .
              </>
            )}
          </Alert>
          <dl className="grid gap-2 rounded-card border border-border bg-card p-4 text-body-sm sm:grid-cols-2">
            <div>
              <dt className="text-caption text-muted-foreground">Người nhận</dt>
              <dd className="font-semibold">{receiverName}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">Số tiền</dt>
              <dd className="font-semibold tabular-nums">
                {new Intl.NumberFormat("vi-VN").format(split.amountOwed)}đ
              </dd>
            </div>
            {payer?.bankBin && (
              <div>
                <dt className="text-caption text-muted-foreground">Mã ngân hàng</dt>
                <dd className="font-semibold">{payer.bankBin}</dd>
              </div>
            )}
            {payer?.bankAccountNumber && (
              <div>
                <dt className="text-caption text-muted-foreground">Số tài khoản</dt>
                <dd className="font-semibold">{payer.bankAccountNumber}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
      <p className="text-caption text-muted-foreground">
        Việc xác nhận bên dưới chỉ cập nhật trạng thái trong ứng dụng, không xác minh giao dịch ngân
        hàng.
      </p>
    </section>
  );
}