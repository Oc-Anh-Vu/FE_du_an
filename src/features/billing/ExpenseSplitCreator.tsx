import { useMemo, useState, type FormEvent } from 'react';
import { Calculator, DollarSign, Users } from 'lucide-react';
import {
  SplitType,
  type ExpenseResponse,
  type RoomResponse,
  type UUID,
} from '../../types';
import { Card } from '../../components/ui/display/Card';
import { Badge } from '../../components/ui/display/Badge';
import { Button } from '../../components/ui/form/Button';
import { CurrencyInput } from '../../components/ui/form/CurrencyInput';
import { SegmentedControl } from '../../components/ui/form/SegmentedControl';
import { Alert } from '../../components/ui/feedback/Alert';
import { formatVND } from '../../utils/currencyFormat';
import {
  getExpenseAmountDifference,
  getSplitTotal,
  type MemberAmounts,
} from './billingHelpers';

export interface ExpenseSplitCreatorProps {
  room: RoomResponse;
  currentUserId?: UUID;
  isSubmitting?: boolean;
  error?: string | null;
  onCreateExpense: (params: {
    room: RoomResponse;
    payerId: UUID;
    totalAmount: number;
    splitType: SplitType;
    memberAmounts: MemberAmounts;
  }) => Promise<ExpenseResponse | null | void>;
  onCancel?: () => void;
}

export default function ExpenseSplitCreator({
  room,
  currentUserId,
  isSubmitting = false,
  error = null,
  onCreateExpense,
  onCancel,
}: ExpenseSplitCreatorProps) {
  const members = useMemo(
    () => room.members?.length ? room.members : room.currentMembers === 1 ? [room.host] : [],
    [room.currentMembers, room.host, room.members],
  );
  const hasCompleteMemberList = members.length >= room.currentMembers;
  const payerOptions = useMemo(() => members.length > 0 ? members : [room.host], [members, room.host]);

  const defaultPayerId = useMemo(() => {
    if (currentUserId && payerOptions.some((m) => m.id === currentUserId)) {
      return currentUserId;
    }
    return payerOptions[0]?.id ?? '';
  }, [currentUserId, payerOptions]);

  const [splitType, setSplitType] = useState<SplitType>(SplitType.EVENLY);
  const [payerId, setPayerId] = useState<UUID>(defaultPayerId);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [memberAmounts, setMemberAmounts] = useState<MemberAmounts>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const splitTotal = useMemo(() => getSplitTotal(memberAmounts), [memberAmounts]);
  const difference = getExpenseAmountDifference(totalAmount ?? 0, splitTotal);
  const hasValidTotal = typeof totalAmount === 'number' && totalAmount > 0;
  const isByItemBalanced = splitType === SplitType.EVENLY || (hasValidTotal && difference === 0 && splitTotal > 0);

  const canSubmit =
    hasValidTotal &&
    Boolean(payerId) &&
    isByItemBalanced &&
    !isSubmitting &&
    (splitType !== SplitType.BY_ITEM || hasCompleteMemberList);

  const evenAmountPerMember = useMemo(() => {
    if (!hasValidTotal || room.currentMembers === 0) return 0;
    return Math.round((totalAmount ?? 0) / room.currentMembers);
  }, [hasValidTotal, room.currentMembers, totalAmount]);

  function handleMemberAmountChange(memberId: UUID, amount: number | null) {
    setMemberAmounts((prev) => ({
      ...prev,
      [memberId]: amount,
    }));
    setLocalError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!hasValidTotal) {
      setLocalError('Vui lòng nhập tổng tiền hóa đơn hợp lệ (lớn hơn 0đ).');
      return;
    }

    if (!payerId) {
      setLocalError('Vui lòng chọn người đứng ra thanh toán trước hóa đơn.');
      return;
    }

    if (splitType === SplitType.BY_ITEM && difference !== 0) {
      setLocalError(
        `Tổng tiền các thành viên (${formatVND(splitTotal)}đ) chưa khớp với tổng hóa đơn (${formatVND(totalAmount ?? 0)}đ).`,
      );
      return;
    }

    try {
      await onCreateExpense({
        room,
        payerId,
        totalAmount: totalAmount ?? 0,
        splitType,
        memberAmounts,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Không thể tạo hóa đơn chia tiền.');
    }
  }

  const displayError = error || localError;

  return (
    <Card
      as="section"
      title="Tạo hóa đơn chia tiền"
      description="Chia đều cho cả nhóm hoặc nhập số tiền cụ thể của từng người"
      className="mx-auto w-full max-w-xl rounded-card border border-border bg-card p-6 shadow-card"
    >
      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {displayError && (
          <Alert variant="danger" title="Không thể tạo hóa đơn">
            {displayError}
          </Alert>
        )}
        {splitType === SplitType.BY_ITEM && !hasCompleteMemberList && (
          <Alert variant="warning" title="Chưa có đủ danh sách thành viên">
            Không thể chia hóa đơn theo từng người vì dữ liệu thành viên của phòng chưa đầy đủ. Hãy tải lại thông tin phòng hoặc chọn chế độ chia đều.
          </Alert>
        )}

        {/* Chế độ chia tiền */}
        <div className="space-y-2">
          <label className="text-body-sm font-semibold text-foreground">
            Chế độ chia tiền
          </label>
          <SegmentedControl
            aria-label="Chế độ chia tiền"
            value={splitType}
            onValueChange={(val: string) => setSplitType(val as SplitType)}
            options={[
              { value: SplitType.EVENLY, label: 'Chia đều cho tất cả' },
              { value: SplitType.BY_ITEM, label: 'Chia theo từng người' },
            ]}
          />
        </div>

        {/* Người thanh toán trước */}
        <div className="space-y-2">
          <label htmlFor="payer-select" className="text-body-sm font-semibold text-foreground">
            Người đã thanh toán trước (Chủ nợ)
          </label>
          <select
            id="payer-select"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            disabled={isSubmitting}
            className="focus-ring h-11 w-full rounded-control border border-border bg-card px-3 text-body-sm font-semibold text-foreground transition-colors hover:border-primary/50"
          >
            {payerOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.username} {member.id === currentUserId ? '(Bạn)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Tổng tiền hóa đơn */}
        <div className="space-y-2">
          <CurrencyInput
            label="Tổng tiền hóa đơn chung"
            placeholder="Ví dụ: 300.000"
            value={totalAmount}
            onValueChange={setTotalAmount}
            disabled={isSubmitting}
          />
        </div>

        {/* Chi tiết chế độ EVENLY */}
        {splitType === SplitType.EVENLY && hasValidTotal && (
          <div className="flex items-center justify-between rounded-card border border-border bg-muted/40 p-4 text-body-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users size={16} className="text-primary" />
              <span>Mỗi người ({room.currentMembers} thành viên):</span>
            </span>
            <strong className="text-heading-sm tabular-nums text-primary-strong">
              {formatVND(evenAmountPerMember)}đ
            </strong>
          </div>
        )}

        {/* Chi tiết chế độ BY_ITEM */}
        {splitType === SplitType.BY_ITEM && (
          <div className="space-y-4 rounded-card border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-body-sm font-bold text-foreground">
                <Calculator size={16} className="text-primary" />
                <span>Số tiền từng thành viên</span>
              </h4>

              {hasValidTotal && (
                <div aria-live="polite">
                  {difference === 0 && splitTotal > 0 ? (
                    <Badge variant="success" size="sm">
                      Khớp 100% tổng tiền
                    </Badge>
                  ) : difference > 0 ? (
                    <Badge variant="warning" size="sm">
                      Thiếu {formatVND(difference)}đ
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      Dư {formatVND(Math.abs(difference))}đ
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-card border border-border bg-card p-2.5"
                >
                  <span className="truncate text-body-sm font-semibold text-foreground">
                    {member.username} {member.id === currentUserId ? '(Bạn)' : ''}
                  </span>
                  <div className="w-40">
                    <CurrencyInput
                      placeholder="0"
                      value={memberAmounts[member.id] ?? null}
                      onValueChange={(val) => handleMemberAmountChange(member.id, val)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Hủy
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            leftIcon={<DollarSign aria-hidden="true" size={18} />}
            loading={isSubmitting}
            loadingText="Đang tạo hóa đơn..."
            disabled={!canSubmit}
          >
            Tạo hóa đơn chia tiền
          </Button>
        </div>
      </form>
    </Card>
  );
}
