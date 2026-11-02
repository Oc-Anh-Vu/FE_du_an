import { Alert } from "../../components/ui/feedback/Alert";
import { Button } from "../../components/ui/form/Button";
import { Spinner } from "../../components/ui/feedback/Spinner";

export function AdminLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-body-sm text-muted-foreground" role="status">
      <Spinner aria-hidden="true" />
      {label}
    </div>
  );
}

export function AdminLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Alert
      variant="danger"
      title="Không thể tải dữ liệu"
      action={<Button variant="outline" size="sm" onClick={onRetry}>Thử lại</Button>}
      role="alert"
    >
      {message}
    </Alert>
  );
}

export function AdminMutationError({ message }: { message: string }) {
  return <Alert className="mt-4" variant="danger" title="Thao tác chưa thành công" role="alert">{message}</Alert>;
}
