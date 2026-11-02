// Màn hình Thiết lập Ghép hội Radar ngẫu nhiên
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Radio, Sparkles } from 'lucide-react';
import { useMatchmakingActions } from '../../../features/matchmaking/useMatchmakingActions';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useUIStore } from '../../../store/uiStore';
import MoodTagSelector from '../../../features/matchmaking/MoodTagSelector';
import { LocationPrompt } from '../../../features/auth/LocationPrompt';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card } from '../../../components/ui/display/Card';
import { Slider } from '../../../components/ui/form/Slider';
import { Button } from '../../../components/ui/form/Button';
import { Alert } from '../../../components/ui/feedback/Alert';

export default function Match() {
  const navigate = useNavigate();
  const showToast = useUIStore((state) => state.showToast);
  const { coordinates } = useGeolocation();

  const {
    systemTags,
    selectedTagIds,
    isLoadingTags,
    isSubmitting,
    error,
    fetchSystemTags,
    toggleMoodTag,
    submitTemporaryMoodTags,
    startMatchmaking,
  } = useMatchmakingActions();

  // Cấu hình ghép hội
  const [radius, setRadius] = useState(5);
  const [targetGroupSize, setTargetGroupSize] = useState(4);
  const [localError, setLocalError] = useState<string | null>(null);

  // Nạp danh sách tag hệ thống khi mount
  useEffect(() => {
    void fetchSystemTags();
  }, [fetchSystemTags]);

  // Bắt đầu quét radar ghép hội
  const handleStartRadar = useCallback(async () => {
    setLocalError(null);

    if (!coordinates) {
      setLocalError('Vui lòng cấp quyền vị trí GPS hoặc chọn vị trí mặc định để quét tìm phòng xung quanh.');
      return;
    }

    try {
      // 1. Lưu các tags tâm trạng tạm thời nếu người dùng đã chọn
      if (selectedTagIds.length > 0) {
        await submitTemporaryMoodTags();
      }

      // 2. Gửi yêu cầu vào hàng đợi Matchmaking
      const status = await startMatchmaking({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius,
        targetGroupSize,
      });

      if (status) {
        if (status.status === 'MATCHED' && status.roomCode) {
          showToast('success', `Đã tìm thấy phòng ghép: ${status.roomCode}!`);
          navigate(`/app/room/${status.roomCode}/lobby`);
        } else {
          showToast('info', 'Đã tham gia hàng đợi quét Radar thành công');
          navigate('/app/room/queue');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể bắt đầu ghép hội lúc này.';
      setLocalError(msg);
    }
  }, [coordinates, selectedTagIds, submitTemporaryMoodTags, startMatchmaking, radius, targetGroupSize, showToast, navigate]);

  return (
    <PageContainer maxWidth="lg" className="py-6 space-y-6">
      <PageHeader
        title="Radar Ghép Hội Ăn Uống"
        subtitle="Chọn khẩu vị hôm nay và quét tìm những người bạn có cùng sở thích ăn uống xung quanh bạn."
        action={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/app/room')}
          >
            Quay lại
          </Button>
        }
      />

      {/* Nhắc nhở quyền GPS nếu chưa có tọa độ */}
      {!coordinates && (
        <LocationPrompt className="mb-4" />
      )}

      {localError && (
        <Alert variant="danger" title="Không thể quét Radar">
          {localError}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CỘT TRÁI: Chọn Tag tâm trạng ẩm thực (Tối đa 2 tag) */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 text-heading-sm font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Hôm nay bạn đang thèm món gì?</span>
            </div>
            <p className="text-body-sm text-foreground-muted mb-4">
              Chọn tối đa 2 tag tâm trạng để hệ thống ưu tiên ghép bạn vào các phòng có cùng gu ẩm thực:
            </p>

            <MoodTagSelector
              tags={systemTags}
              selectedTagIds={selectedTagIds}
              onToggleTag={toggleMoodTag}
              isLoading={isLoadingTags}
              error={error}
              onRetry={() => void fetchSystemTags()}
              maxTags={2}
            />
          </Card>
        </div>

        {/* CỘT PHẢI: Cấu hình Bán kính & Quy mô nhóm */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-heading-sm font-bold text-foreground flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              <span>Tiêu chí quét Radar</span>
            </h3>

            {/* Slider Bán kính quét */}
            <div className="space-y-2">
              <Slider
                label="Bán kính tìm kiếm"
                min={1}
                max={20}
                step={1}
                value={radius}
                onValueChange={(val) => setRadius(val)}
                formatValue={(val) => `${val} km`}
                aria-label="Bán kính tìm kiếm quán ăn xung quanh"
              />
              <p className="text-caption text-foreground-muted">
                Tìm các nhóm bạn và quán ăn trong vòng {radius} km quanh vị trí của bạn.
              </p>
            </div>

            {/* Slider Quy mô nhóm */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Slider
                label="Số người mỗi nhóm"
                min={2}
                max={10}
                step={1}
                value={targetGroupSize}
                onValueChange={(val) => setTargetGroupSize(val)}
                formatValue={(val) => `${val} người`}
                aria-label="Số lượng người mong muốn trong nhóm"
              />
              <p className="text-caption text-foreground-muted">
                Hệ thống sẽ gom tự động khi phòng đạt đủ {targetGroupSize} thành viên.
              </p>
            </div>

            {/* Nút Kích hoạt quét */}
            <div className="pt-3 border-t border-border">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={isSubmitting}
                leftIcon={<Radio className="h-5 w-5 animate-pulse" />}
                onClick={() => void handleStartRadar()}
              >
                Bắt đầu quét Radar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
