import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CurrencyInput, SegmentedControl, Spinner } from "../../components/ui";
import { normalizeApiError } from "../../services/apiClient";
import { createExpense, getExpensesByRoom } from "../../services/expense.service";
import { useBillingStore } from "../../store/billingStore";
import { useUserStore } from "../../store/userStore";
import { RoomStatus, SplitType, type ExpenseResponse, type RoomResponse, type UUID } from "../../types";
import { formatVND } from "../../utils/currencyFormat";
import {
  buildExpenseCreateRequest,
  getExpenseAmountDifference,
  getSplitTotal,
  type MemberAmounts,
} from "./billingHelpers";

export interface ExpenseSplitCreatorProps {
  room: RoomResponse;
  existingExpenses?: ExpenseResponse[];
  onCreated?: (expense: ExpenseResponse) => void;
}

export default function ExpenseSplitCreator({
  room,
  existingExpenses,
  onCreated,
}: ExpenseSplitCreatorProps) {
  const currentUser = useUserStore((state) => state.currentUser);
  const upsertRoomExpense = useBillingStore((state) => state.upsertRoomExpense);
  const members = useMemo(() => room.members ?? [], [room.members]);
  const isMember = Boolean(currentUser && members.some((member) => member.id === currentUser.id));
  const [splitType, setSplitType] = useState<SplitType>(SplitType.EVENLY);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [memberAmounts, setMemberAmounts] = useState<MemberAmounts>({});
  const [payerId, setPayerId] = useState<UUID>("");
  const [createdExpense, setCreatedExpense] = useState(false);
  const [checkedExpenses, setCheckedExpenses] = useState<{
    roomId: UUID;
    expenses: ExpenseResponse[];
  } | null>(null);
  const [checkError, setCheckError] = useState<{ roomId: UUID; message: string } | null>(null);
  const [checkAttempt, setCheckAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingExpenses !== undefined) {
      return;
    }

    let active = true;
    getExpensesByRoom(room.id)
      .then((expenses) => {
        if (active) setCheckedExpenses({ roomId: room.id, expenses });
      })
      .catch((requestError: unknown) => {
        if (active) setCheckError({ roomId: room.id, message: normalizeApiError(requestError).message });
      });

    return () => {
      active = false;
    };
  }, [checkAttempt, existingExpenses, room.id]);

  const activeCheckError = checkError?.roomId === room.id ? checkError.message : null;
  const checkingExisting =
    existingExpenses === undefined &&
    checkedExpenses?.roomId !== room.id &&
    activeCheckError === null;
  const hasExistingExpense =
    createdExpense ||
    (existingExpenses !== undefined
      ? existingExpenses.length > 0
      : checkedExpenses?.roomId === room.id && checkedExpenses.expenses.length > 0);
  const selectedPayerId = members.some((member) => member.id === payerId)
    ? payerId
    : (members.find((member) => member.id === currentUser?.id) ?? members[0])?.id ?? "";
  const splitTotal = useMemo(() => getSplitTotal(memberAmounts), [memberAmounts]);
  const difference = getExpenseAmountDifference(totalAmount ?? 0, splitTotal);
  const validTotal = typeof totalAmount === "number" && totalAmount > 0;
  const byItemMatches = splitType === SplitType.EVENLY || (validTotal && difference === 0 && splitTotal > 0);
  const canSubmit =
    room.status === RoomStatus.CLOSED &&
    isMember &&
    !hasExistingExpense &&
    !checkingExisting &&
    !checkError &&
    !submitting &&
    validTotal &&
    Boolean(selectedPayerId) &&
    byItemMatches;

  if (room.status !== RoomStatus.CLOSED || !isMember) return null;

  if (checkingExisting) {
    return (
      <div className="flex items-center gap-3 py-4" aria-live="polite">
        <Spinner size="sm" />
        <span className="text-body-sm text-muted-foreground">Đang kiểm tra hóa đơn phòng...</span>
      </div>
    );
  }

  if (activeCheckError) {
    return (
      <Alert
        variant="danger"
        title="Không thể kiểm tra hóa đơn phòng"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCheckError(null);
              setCheckedExpenses(null);
              setCheckAttempt((attempt) => attempt + 1);
            }}
          >
            Thử lại
          </Button>
        }
      >
        {activeCheckError}
      </Alert>
    );
  }

  if (hasExistingExpense) {
    return (
      <Alert variant="info" title="Phòng đã có hóa đơn">
        Mỗi phòng chỉ có thể có một hóa đơn. Hãy xem hóa đơn hiện có bên dưới.
      </Alert>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = buildExpenseCreateRequest({
        room,
        payerId: selectedPayerId,
        splitType,
        totalAmount: totalAmount ?? 0,
        memberAmounts,
      });
      setSubmitting(true);
      const created = await createExpense(payload);
      upsertRoomExpense(created);
      setCreatedExpense(true);
      onCreated?.(created);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Tạo hóa đơn" description="Chỉ tạo một hóa đơn cho phòng đã đóng.">
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        {error && <Alert variant="danger" title="Không thể tạo hóa đơn">{error}</Alert>}
        <fieldset disabled={submitting} className="space-y-5 disabled:opacity-70">
          <div className="space-y-2">
            <span className="text-body-sm font-semibold">Cách chia tiền</span>
            <SegmentedControl
              aria-label="Chọn cách chia hóa đơn"
              value={splitType}
              onValueChange={(value) => setSplitType(value as SplitType)}
              options={[
                { label: "Chia đều", value: SplitType.EVENLY },
                { label: "Theo thành viên", value: SplitType.BY_ITEM },
              ]}
            />
          </div>

          <label className="block space-y-2 text-body-sm font-semibold" htmlFor="billing-payer">
            Người trả hóa đơn
            <select
              id="billing-payer"
              className="min-h-11 w-full rounded-control border border-border bg-card px-3 text-body-sm text-foreground focus-ring"
              value={selectedPayerId}
              onChange={(event) => setPayerId(event.currentTarget.value)}
              required
            >
              <option value="" disabled>Chọn thành viên</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.username}</option>
              ))}
            </select>
          </label>

          <CurrencyInput
            label="Tổng hóa đơn"
            value={totalAmount}
            onValueChange={setTotalAmount}
            placeholder="Nhập tổng tiền"
            min={1}
            required
          />

          {splitType === SplitType.EVENLY ? (
            <p className="rounded-control bg-muted p-3 text-body-sm" aria-live="polite">
              Ước tính mỗi thành viên:{" "}
              <strong>{formatVND(members.length > 0 ? Math.round((totalAmount ?? 0) / members.length) : 0)}đ</strong>
              {members.length === 0 && " (phòng chưa có thành viên)"}
            </p>
          ) : (
            <fieldset className="space-y-3">
              <legend className="text-body-sm font-semibold">Số tiền của từng thành viên</legend>
              {members.map((member) => (
                <CurrencyInput
                  key={member.id}
                  label={member.username}
                  value={memberAmounts[member.id] ?? null}
                  onValueChange={(amount) =>
                    setMemberAmounts((current) => ({ ...current, [member.id]: amount }))
                  }
                  placeholder="Để trống nếu không có phần"
                  min={0}
                />
              ))}
              <div
                className="rounded-control bg-muted p-3 text-body-sm"
                aria-live="polite"
                aria-atomic="true"
              >
                Tổng đã chia: <strong>{formatVND(splitTotal)}đ</strong>
                {validTotal && difference !== 0 && (
                  <span className="ml-2 text-danger-soft-foreground">
                    {difference > 0
                      ? `Còn thiếu ${formatVND(difference)}đ`
                      : `Đang vượt ${formatVND(Math.abs(difference))}đ`}
                  </span>
                )}
              </div>
            </fieldset>
          )}

          <Button type="submit" loading={submitting} disabled={!canSubmit} fullWidth>
            Tạo hóa đơn
          </Button>
        </fieldset>
      </form>
    </Card>
  );
}