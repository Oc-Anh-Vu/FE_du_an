import { useState, type FormEvent } from "react";
import { MapPin } from "lucide-react";
import { Alert, Button, Card, Input, Slider } from "../../components/ui";
import type { CreateRoomRequest } from "../../types/api";

const fallbackLocations = {
  "ho-chi-minh": { label: "Trung tâm TP. Hồ Chí Minh", latitude: 10.776889, longitude: 106.700806 },
  hanoi: { label: "Trung tâm Hà Nội", latitude: 21.028511, longitude: 105.854167 },
} as const;

type FallbackLocation = keyof typeof fallbackLocations;

export interface CreateRoomFormProps {
  onSubmit: (request: CreateRoomRequest) => Promise<void> | void;
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Không thể tạo phòng. Vui lòng thử lại.";
}

export default function CreateRoomForm({ onSubmit }: CreateRoomFormProps) {
  const [name, setName] = useState("");
  const [radius, setRadius] = useState(5);
  const [deckSize, setDeckSize] = useState("15");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function useCurrentLocation() {
    setLocationError(null);
    setFormError(null);

    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ lấy vị trí. Bạn có thể chọn vị trí mặc định bên dưới.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationLabel("Vị trí hiện tại");
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Bạn chưa cấp quyền vị trí. Hãy chọn khu vực mặc định bên dưới hoặc cấp quyền rồi thử lại."
            : "Không lấy được vị trí hiện tại. Hãy chọn khu vực mặc định bên dưới.";
        setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function selectFallbackLocation(value: string) {
    if (!value) return;
    const location = fallbackLocations[value as FallbackLocation];
    if (!location) return;

    setCoordinates({ latitude: location.latitude, longitude: location.longitude });
    setLocationLabel(location.label);
    setLocationError(null);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!coordinates) {
      setLocationError("Hãy chọn vị trí hiện tại hoặc khu vực mặc định trước khi tạo phòng.");
      return;
    }

    const parsedDeckSize = Number(deckSize);
    if (!Number.isInteger(parsedDeckSize) || parsedDeckSize < 3 || parsedDeckSize > 50) {
      setFormError("Số lượng quán phải là số nguyên từ 3 đến 50.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...(name.trim() ? { name: name.trim() } : {}),
        ...coordinates,
        radius,
        deckSize: parsedDeckSize,
      });
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      as="section"
      title="Tạo phòng ăn"
      description="Tạo phòng và chia sẻ mã với bạn bè để cùng chọn địa điểm."
      className="mx-auto w-full max-w-xl rounded-section"
      padding="lg"
    >
      <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {formError && <Alert variant="danger" title="Chưa thể tạo phòng">{formError}</Alert>}

        <Input
          label="Tên phòng"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder="Ví dụ: Ăn trưa cuối tuần"
          maxLength={100}
        />

        <fieldset className="space-y-3">
          <legend className="text-body-sm font-semibold text-foreground">Vị trí tìm quán</legend>
          <Button
            type="button"
            variant="outline"
            leftIcon={<MapPin aria-hidden="true" size={18} />}
            onClick={useCurrentLocation}
          >
            Dùng vị trí hiện tại
          </Button>
          <div className="space-y-2">
            <label htmlFor="room-fallback-location" className="block text-caption font-semibold text-muted-foreground">
              Hoặc chọn khu vực mặc định
            </label>
            <select
              id="room-fallback-location"
              defaultValue=""
              onChange={(event) => selectFallbackLocation(event.currentTarget.value)}
              className="focus-ring h-11 w-full rounded-control border border-input bg-card px-4 text-body text-foreground"
            >
              <option value="" disabled>Chọn TP. Hồ Chí Minh hoặc Hà Nội</option>
              {Object.entries(fallbackLocations).map(([value, location]) => (
                <option key={value} value={value}>{location.label}</option>
              ))}
            </select>
          </div>
          {locationLabel && (
            <p className="text-caption font-semibold text-success-soft-foreground" aria-live="polite">
              Đang dùng: {locationLabel}
            </p>
          )}
          {locationError && <p role="alert" className="text-caption font-semibold text-danger">{locationError}</p>}
        </fieldset>

        <Slider
          label="Bán kính tìm quán"
          min={0.1}
          max={50}
          step={0.1}
          value={radius}
          onValueChange={setRadius}
          formatValue={(value) => `${value.toFixed(1)} km`}
        />

        <Input
          label="Số lượng quán trong bộ bài"
          type="number"
          min={3}
          max={50}
          step={1}
          value={deckSize}
          onChange={(event) => setDeckSize(event.currentTarget.value)}
          hint="Chọn từ 3 đến 50 quán."
          required
        />

        <Button type="submit" fullWidth size="lg" loading={isSubmitting} loadingText="Đang tạo phòng...">
          Tạo phòng
        </Button>
      </form>
    </Card>
  );
}
