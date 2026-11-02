import { useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { Card } from '../../components/ui/display/Card';
import { OtpInput } from '../../components/ui/form/OtpInput';
import { Button } from '../../components/ui/form/Button';
import { Alert } from '../../components/ui/feedback/Alert';

export interface JoinRoomFormProps {
  onSubmit: (roomCode: string) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
  onCreateNewClick?: () => void;
}

export default function JoinRoomForm({
  onSubmit,
  isSubmitting = false,
  error = null,
  onCreateNewClick,
}: JoinRoomFormProps) {
  const [roomCode, setRoomCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const normalizedCode = roomCode.trim().toUpperCase();
    if (normalizedCode.length !== 6) {
      setLocalError('Mã phòng phải gồm đúng 6 ký tự chữ hoặc số.');
      return;
    }

    try {
      await onSubmit(normalizedCode);
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : 'Không thể tham gia phòng. Vui lòng kiểm tra lại mã phòng.',
      );
    }
  }

  const displayError = error || localError;

  return (
    <Card
      as="section"
      title="Tham gia phòng ăn"
      description="Nhập mã gồm 6 ký tự do chủ phòng chia sẻ để tham gia quẹt thẻ"
      className="mx-auto w-full max-w-md rounded-card border border-border bg-card p-6 shadow-card"
    >
      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {displayError && (
          <Alert variant="danger" title="Không thể tham gia">
            {displayError}
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-3">
          <label className="text-body-sm font-semibold text-foreground">
            Mã phòng (6 ký tự)
          </label>
          <OtpInput
            length={6}
            mode="alphanumeric"
            value={roomCode}
            onValueChange={(val) => {
              setRoomCode(val.toUpperCase());
              setLocalError(null);
            }}
            onComplete={(code) => {
              setRoomCode(code.toUpperCase());
            }}
            aria-label="Mã phòng gồm 6 ký tự chữ hoặc số"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          variant="primary"
          leftIcon={<LogIn aria-hidden="true" size={18} />}
          loading={isSubmitting}
          loadingText="Đang vào phòng..."
          disabled={roomCode.trim().length !== 6 || isSubmitting}
        >
          Tham gia phòng ngay
        </Button>

        {onCreateNewClick && (
          <div className="text-center text-body-sm text-muted-foreground">
            Chưa có mã phòng?{' '}
            <button
              type="button"
              className="font-bold text-primary hover:underline focus-ring rounded"
              onClick={onCreateNewClick}
            >
              Tạo phòng mới
            </button>
          </div>
        )}
      </form>
    </Card>
  );
}
