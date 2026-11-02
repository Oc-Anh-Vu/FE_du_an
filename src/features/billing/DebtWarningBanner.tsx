import { ArrowRight, RefreshCw, Wallet } from 'lucide-react';
import type { ExpenseSplitResponse } from '../../types';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button } from '../../components/ui/form/Button';
import { formatVND } from '../../utils/currencyFormat';

export interface DebtWarningBannerProps {
  debts?: ExpenseSplitResponse[];
  compact?: boolean;
  onViewDebtsClick?: () => void;
  onRefresh?: () => Promise<void> | void;
}

export default function DebtWarningBanner({
  debts = [],
  compact = false,
  onViewDebtsClick,
  onRefresh,
}: DebtWarningBannerProps) {
  const unpaidDebts = debts.filter((debt) => !debt.paid);

  if (unpaidDebts.length === 0) {
    return null;
  }

  const totalOwed = unpaidDebts.reduce((sum, debt) => sum + debt.amountOwed, 0);

  return (
    <div className="w-full">
      <Alert
        variant="warning"
        title="Bạn có khoản tiền cần thanh toán"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RefreshCw aria-hidden="true" size={14} />}
                onClick={() => void onRefresh()}
              >
                Làm mới
              </Button>
            )}
            {onViewDebtsClick && (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight aria-hidden="true" size={14} />}
                onClick={onViewDebtsClick}
              >
                Thanh toán ngay
              </Button>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Wallet size={16} className="shrink-0 text-warning-soft-foreground" />
          <span>
            Bạn đang có <strong>{unpaidDebts.length}</strong> khoản chưa thanh toán, tổng cộng{' '}
            <strong className="tabular-nums text-foreground">{formatVND(totalOwed)}đ</strong>.
            {!compact && ' Vui lòng mở mã VietQR để chuyển khoản cho chủ nợ sớm nhé.'}
          </span>
        </div>
      </Alert>
    </div>
  );
}
