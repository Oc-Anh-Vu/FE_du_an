import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Card, OtpInput } from "../../components/ui";

export interface JoinRoomFormProps {
  onSubmit: (roomCode: string) => Promise<void> | void;
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Không thể tham gia phòng. Vui lòng kiểm tra mã và thử lại.";
}

export default function JoinRoomForm({ onSubmit }: JoinRoomFormProps) {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedCode = roomCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      setError("Mã phòng phải gồm đúng 6 chữ cái hoặc chữ số.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(normalizedCode);
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      as="section"
      title="Tham gia phòng"
      description="Nhập mã gồm 6 ký tự do chủ phòng chia sẻ."
      className="mx-auto w-full max-w-md rounded-section"
      padding="lg"
    >
      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {error && <Alert variant="danger" title="Không thể tham gia phòng">{error}</Alert>}
        <div className="space-y-2">
          <p className="text-body-sm font-semibold text-foreground">Mã phòng</p>
          <OtpInput
            length={6}
            mode="alphanumeric"
            value={roomCode}
            onValueChange={setRoomCode}
            aria-label="Mã phòng gồm 6 ký tự"
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          loadingText="Đang tham gia..."
          disabled={roomCode.length !== 6}
        >
          Tham gia phòng
        </Button>
        <p className="text-center text-body-sm text-muted-foreground">
          Chưa có mã?{" "}
          <Link to="/app/room/new" className="focus-ring rounded-control font-semibold text-primary-strong hover:underline">
            Tạo phòng mới
          </Link>
        </p>
      </form>
    </Card>
  );
}
