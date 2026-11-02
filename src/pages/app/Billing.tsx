// Màn hình Quản lý Tài chính & Quyết toán công nợ
import { useEffect, useState } from 'react';
import { CheckCircle2, QrCode, RefreshCw, Wallet } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageSection } from '../../components/layout/PageSection';
import { Card } from '../../components/ui/display/Card';
import { Avatar } from '../../components/ui/display/Avatar';
import { Badge } from '../../components/ui/display/Badge';
import { Button } from '../../components/ui/form/Button';
import { Modal } from '../../components/ui/feedback/Modal';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Spinner } from '../../components/ui/feedback/Spinner';
import DebtWarningBanner from '../../features/billing/DebtWarningBanner';
import VietQRPaymentCard from '../../features/billing/VietQRPaymentCard';
import { useBillingActions } from '../../features/billing/useBillingActions';
import type { ExpenseSplitResponse } from '../../types';
import { formatVND } from '../../utils/currencyFormat';

export default function Billing() {
  const [selectedSplitForPayment, setSelectedSplitForPayment] = useState<ExpenseSplitResponse | null>(null);

  const {
    myDebts,
    isLoading,
    fetchMyUnpaidDebts,
    confirmSplitPaid,
  } = useBillingActions();

  useEffect(() => {
    void fetchMyUnpaidDebts();
  }, [fetchMyUnpaidDebts]);

  const unpaidDebts = myDebts.filter((d) => !d.paid);
  const totalOwed = unpaidDebts.reduce((sum, d) => sum + d.amountOwed, 0);

  const handleConfirmPaid = async (split: ExpenseSplitResponse) => {
    if (!split.expenseId || !split.user?.id) return;
    const success = await confirmSplitPaid(split.expenseId, split.user.id);
    if (success) {
      setSelectedSplitForPayment(null);
      void fetchMyUnpaidDebts();
    }
  };

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Tài chính & Quyết toán"
        subtitle="Theo dõi các khoản tiền cần thanh toán sau mỗi bữa ăn nhóm và thanh toán qua mã VietQR."
        action={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />}
            onClick={() => void fetchMyUnpaidDebts()}
          >
            Làm mới
          </Button>
        }
      />

      {/* 2. Banner cảnh báo tổng nợ */}
      <DebtWarningBanner
        debts={myDebts}
        onRefresh={() => void fetchMyUnpaidDebts()}
      />

      {/* 3. Thẻ thống kê tài chính */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning">
              <Wallet size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Tổng tiền cần trả</p>
              <p className="text-heading font-black tabular-nums text-foreground">
                {formatVND(totalOwed)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <QrCode size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Khoản nợ chưa thanh toán</p>
              <p className="text-heading font-black tabular-nums text-foreground">
                {unpaidDebts.length} bữa ăn
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Đã hoàn tất thanh toán</p>
              <p className="text-heading font-black tabular-nums text-foreground">
                {myDebts.filter((d) => d.paid).length} khoản
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Danh sách các khoản nợ cá nhân */}
      <PageSection
        title="Danh sách khoản nợ của bạn"
        subtitle="Chi tiết từng khoản tiền cần gửi cho người đã trả trước"
        variant="surface"
      >
        {isLoading && myDebts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" label="Đang tải danh sách khoản nợ..." />
          </div>
        ) : myDebts.length === 0 ? (
          <EmptyState
            size="md"
            icon={<CheckCircle2 size={36} className="text-success" aria-hidden="true" />}
            title="Tuyệt vời! Bạn không còn khoản nợ nào"
            description="Tất cả các bữa ăn trước đó của bạn đều đã được thanh toán sòng phẳng."
          />
        ) : (
          <div className="divide-y divide-border">
            {myDebts.map((split) => {
              const payerName = split.payer?.bankAccountName || split.payer?.username || 'Chủ nợ';
              const isUnpaid = !split.paid;

              return (
                <div
                  key={`${split.expenseId}-${split.user.id}`}
                  className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={payerName} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground text-body">
                          Trả cho: {payerName}
                        </p>
                        <Badge variant={isUnpaid ? 'warning' : 'success'} size="sm">
                          {isUnpaid ? 'Chưa trả' : 'Đã thanh toán'}
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground mt-0.5">
                        {split.payer?.bankAccountNumber
                          ? `STK: ${split.payer.bankAccountNumber} (${split.payer.bankBin || 'Ngân hàng'})`
                          : 'Chưa cập nhật tài khoản ngân hàng'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span className="font-black tabular-nums text-heading-sm text-primary-strong">
                      {formatVND(split.amountOwed)}
                    </span>

                    {isUnpaid && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<QrCode size={16} aria-hidden="true" />}
                        onClick={() => setSelectedSplitForPayment(split)}
                      >
                        Quét VietQR
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageSection>

      {/* 5. Modal Quét mã VietQR chuyển khoản */}
      {selectedSplitForPayment && (
        <Modal
          isOpen={Boolean(selectedSplitForPayment)}
          onClose={() => setSelectedSplitForPayment(null)}
          title="Thanh toán chuyển khoản VietQR"
          description="Quét mã QR bằng ứng dụng ngân hàng bất kỳ để chuyển tiền nhanh chóng."
          size="md"
        >
          <VietQRPaymentCard
            split={selectedSplitForPayment}
            onConfirmPaidClick={handleConfirmPaid}
            onClose={() => setSelectedSplitForPayment(null)}
          />
        </Modal>
      )}
    </PageContainer>
  );
}
