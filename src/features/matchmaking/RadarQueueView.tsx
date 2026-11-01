import { Alert, Button, Card } from "../../components/ui";

export interface RadarQueueViewProps {
  onBack?: () => void;
}

export default function RadarQueueView({ onBack }: RadarQueueViewProps) {
  return (
    <Card title="Radar ghép hội" description="Ghép người cùng sở thích ăn uống">
      <div className="space-y-4">
        <Alert variant="warning" title="Hàng đợi ghép hội chưa khả dụng">
          Backend hiện chưa cung cấp API tham gia hàng đợi, theo dõi trạng thái hoặc hủy ghép. Tag
          tâm trạng đã chọn không có nghĩa là bạn đang được ghép với người khác.
        </Alert>
        <p className="text-body-sm text-muted-foreground">
          Khi có hợp đồng hàng đợi chính thức, tính năng sẽ được kết nối mà không tạo kết quả ghép
          giả hoặc tự động chuyển bạn vào phòng.
        </p>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Quay lại chọn tag
          </Button>
        )}
      </div>
    </Card>
  );
}
