// Khối hiển thị trạng thái định vị GPS, nút xin quyền vị trí và 2 nút chọn nhanh tọa độ mặc định TP.HCM / Hà Nội
import { Compass, MapPin, Navigation } from 'lucide-react';
import { Badge, type BadgeProps } from '../../components/ui/display/Badge';
import { Card } from '../../components/ui/display/Card';
import { Alert } from '../../components/ui/feedback/Alert';
import { Button } from '../../components/ui/form/Button';
import { Stack } from '../../components/layout/Stack';
import {
  DEFAULT_CITY_LOCATIONS,
  useGeolocation,
  type DefaultCityPreset,
  type GeolocationPermissionStatus,
} from '../../hooks/useGeolocation';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';
import type { GeoCoordinates } from '../../utils/geoCalculator';

export interface LocationPromptProps {
  onLocationChange?: (coords: GeoCoordinates) => void;
  onRequestLocation?: (coords: GeoCoordinates | null) => void;
  onSelectDefaultCity?: (preset: DefaultCityPreset, coords: GeoCoordinates) => void;
  compact?: boolean;
  className?: string;
}

interface StatusBadgeMeta {
  variant: NonNullable<BadgeProps['variant']>;
  label: string;
  dot: boolean;
}

function getStatusBadgeMeta(
  status: GeolocationPermissionStatus,
  hasCoordinates: boolean,
): StatusBadgeMeta {
  if (status === 'REQUESTING') {
    return { variant: 'warning', label: 'Đang lấy vị trí...', dot: true };
  }
  if (status === 'GRANTED' && hasCoordinates) {
    return { variant: 'success', label: 'Đã cấp quyền GPS', dot: true };
  }
  if (status === 'FALLBACK' && hasCoordinates) {
    return { variant: 'info', label: 'Tọa độ mặc định', dot: true };
  }
  if (status === 'DENIED' || status === 'UNSUPPORTED') {
    return { variant: 'danger', label: 'Chưa cấp quyền GPS', dot: false };
  }
  if (hasCoordinates) {
    return { variant: 'success', label: 'Đã có tọa độ', dot: true };
  }
  return { variant: 'warning', label: 'Chưa thiết lập vị trí', dot: false };
}

function matchCityPreset(coords: GeoCoordinates | null): DefaultCityPreset | null {
  if (!coords) return null;
  const isHcm =
    Math.abs(coords.latitude - DEFAULT_CITY_LOCATIONS.HCM.latitude) < 0.0001 &&
    Math.abs(coords.longitude - DEFAULT_CITY_LOCATIONS.HCM.longitude) < 0.0001;
  if (isHcm) return 'HCM';

  const isHanoi =
    Math.abs(coords.latitude - DEFAULT_CITY_LOCATIONS.HANOI.latitude) < 0.0001 &&
    Math.abs(coords.longitude - DEFAULT_CITY_LOCATIONS.HANOI.longitude) < 0.0001;
  if (isHanoi) return 'HANOI';

  return null;
}

export function LocationPrompt({
  onLocationChange,
  onRequestLocation,
  onSelectDefaultCity,
  compact = false,
  className,
}: LocationPromptProps) {
  const {
    coordinates,
    hasCoordinates,
    status,
    isRequesting,
    error,
    requestLocation,
    useDefaultLocation: applyDefaultLocation,
  } = useGeolocation();

  const badgeMeta = getStatusBadgeMeta(status, hasCoordinates);
  const matchedPreset = matchCityPreset(coordinates);

  async function handleRequestGps() {
    const nextCoords = await requestLocation();
    onRequestLocation?.(nextCoords);
    if (nextCoords) {
      useUIStore
        .getState()
        .showToast('success', 'Đã cập nhật tọa độ GPS hiện tại của bạn.');
      onLocationChange?.(nextCoords);
    }
  }

  function handleSelectPreset(preset: DefaultCityPreset) {
    const nextCoords = applyDefaultLocation(preset);
    const cityLabel = DEFAULT_CITY_LOCATIONS[preset].label;
    useUIStore
      .getState()
      .showToast('info', `Đã chọn tọa độ mặc định: ${cityLabel}`);
    onSelectDefaultCity?.(preset, nextCoords);
    onLocationChange?.(nextCoords);
  }

  return (
    <Card
      as="section"
      variant={hasCoordinates ? 'default' : 'highlight'}
      padding={compact ? 'sm' : 'md'}
      title="Vị trí khám phá & tạo phòng ăn"
      description="Tọa độ GPS giúp hệ thống gợi ý quán ăn gần bạn và khởi tạo bộ bài quẹt thẻ chính xác."
      headerAction={
        <Badge variant={badgeMeta.variant} dot={badgeMeta.dot}>
          {badgeMeta.label}
        </Badge>
      }
      className={cn('w-full', className)}
    >
      <Stack gap={3}>
        {error && (
          <Alert variant="warning" role="status">
            {error}
          </Alert>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border bg-muted/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-body-sm text-foreground">
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
            {hasCoordinates && coordinates ? (
              <span>
                Tọa độ hiện tại:{' '}
                <strong className="font-semibold tabular-nums">
                  {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </strong>
                {matchedPreset && (
                  <span className="ml-1.5 text-caption text-muted-foreground">
                    ({DEFAULT_CITY_LOCATIONS[matchedPreset].label})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Chưa có tọa độ. Hãy cấp quyền GPS hoặc chọn nhanh khu vực bên dưới.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="primary"
            size={compact ? 'sm' : 'md'}
            loading={isRequesting}
            loadingText="Đang định vị GPS..."
            leftIcon={<Navigation aria-hidden="true" className="size-4" />}
            onClick={() => void handleRequestGps()}
          >
            Cấp quyền vị trí GPS
          </Button>

          <Button
            type="button"
            variant={matchedPreset === 'HCM' ? 'secondary' : 'outline'}
            size={compact ? 'sm' : 'md'}
            disabled={isRequesting}
            leftIcon={<Compass aria-hidden="true" className="size-4" />}
            onClick={() => handleSelectPreset('HCM')}
          >
            Mặc định TP.HCM
          </Button>

          <Button
            type="button"
            variant={matchedPreset === 'HANOI' ? 'secondary' : 'outline'}
            size={compact ? 'sm' : 'md'}
            disabled={isRequesting}
            leftIcon={<Compass aria-hidden="true" className="size-4" />}
            onClick={() => handleSelectPreset('HANOI')}
          >
            Mặc định Hà Nội
          </Button>
        </div>
      </Stack>
    </Card>
  );
}

export default LocationPrompt;
