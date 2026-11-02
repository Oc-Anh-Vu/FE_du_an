import { useState, type FormEvent } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import type { CreateRoomRequest } from '../../types';
import { Card } from '../../components/ui/display/Card';
import { Input } from '../../components/ui/form/Input';
import { Slider } from '../../components/ui/form/Slider';
import { Button } from '../../components/ui/form/Button';
import { Alert } from '../../components/ui/feedback/Alert';
import { LocationPrompt } from '../auth/LocationPrompt';
import type { GeoCoordinates } from '../../utils/geoCalculator';

export interface CreateRoomFormProps {
  onSubmit: (request: CreateRoomRequest) => Promise<void> | void;
  initialCoords?: GeoCoordinates | null;
  isSubmitting?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

export default function CreateRoomForm({
  onSubmit,
  initialCoords = null,
  isSubmitting = false,
  error = null,
  onCancel,
}: CreateRoomFormProps) {
  const [name, setName] = useState('');
  const [radius, setRadius] = useState(5);
  const [deckSize, setDeckSize] = useState(15);
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(initialCoords);
  const [prevInitialCoords, setPrevInitialCoords] = useState<GeoCoordinates | null>(initialCoords);
  const [localError, setLocalError] = useState<string | null>(null);

  // Đồng bộ tọa độ bất đồng bộ khi GPS sẵn sàng từ trang cha (React adjusting state when prop changes)
  if (initialCoords !== prevInitialCoords) {
    setPrevInitialCoords(initialCoords);
    if (initialCoords && !coordinates) {
      setCoordinates(initialCoords);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!coordinates) {
      setLocalError('Vui lòng cấp quyền GPS hoặc chọn vị trí mặc định để tìm quán ăn xung quanh.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim() ? name.trim() : undefined,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius,
        deckSize,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Không thể tạo phòng lúc này.');
    }
  }

  const displayError = error || localError;

  return (
    <Card
      as="section"
      title="Tạo phòng ăn mới"
      description="Thiết lập vị trí và thông số để cùng bạn bè quẹt thẻ tìm quán"
      className="mx-auto w-full max-w-lg rounded-card border border-border bg-card p-6 shadow-card"
    >
      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {displayError && (
          <Alert variant="danger" title="Không thể tạo phòng">
            {displayError}
          </Alert>
        )}

        {/* Tên phòng */}
        <Input
          label="Tên phòng (tùy chọn)"
          placeholder="Ví dụ: Bữa trưa văn phòng, Hội cạ cứng..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />

        {/* Tọa độ GPS */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-body-sm font-semibold text-foreground">
            <Compass size={16} className="text-primary" />
            <span>Vị trí tìm quán (GPS)</span>
          </label>
          <LocationPrompt
            compact
            onLocationChange={(coords) => {
              setCoordinates(coords);
              setLocalError(null);
            }}
            onSelectDefaultCity={(_, coords) => {
              setCoordinates(coords);
              setLocalError(null);
            }}
          />
        </div>

        {/* Bán kính tìm kiếm */}
        <Slider
          label="Bán kính tìm kiếm quán ăn"
          min={1}
          max={30}
          step={1}
          value={radius}
          onValueChange={setRadius}
          formatValue={(val) => `${val} km`}
          disabled={isSubmitting}
        />

        {/* Số lượng quán quẹt thẻ */}
        <Slider
          label="Số lượng quán trong bộ bài quẹt"
          min={5}
          max={30}
          step={1}
          value={deckSize}
          onValueChange={setDeckSize}
          formatValue={(val) => `${val} quán`}
          disabled={isSubmitting}
        />

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
            leftIcon={<Sparkles aria-hidden="true" size={18} />}
            loading={isSubmitting}
            loadingText="Đang tạo phòng..."
            disabled={!coordinates || isSubmitting}
          >
            Tạo phòng ăn ngay
          </Button>
        </div>
      </form>
    </Card>
  );
}
