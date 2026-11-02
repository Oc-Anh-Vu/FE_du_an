// Popup chúc mừng khi chốt quán ăn cá nhân trong Solo Mode: hiển thị PlaceCard, hiệu ứng Confetti và nút mở chỉ đường Google Maps (FE_SPEC.md Mục 6.2)
import { ExternalLink, Navigation } from 'lucide-react';
import { PlaceCard } from '../../components/ui/display/PlaceCard';
import { Confetti } from '../../components/ui/effects/Confetti';
import { Modal } from '../../components/ui/feedback/Modal';
import { Button } from '../../components/ui/form/Button';
import { buttonVariants } from '../../components/ui/form/buttonVariants';
import { Stack } from '../../components/layout/Stack';
import type { PlaceResponse } from '../../types/api';
import { toPlaceCardItem } from './usePlaceActions';

export interface SoloMatchModalProps {
  isOpen: boolean;
  place: PlaceResponse | null;
  distanceKm?: number;
  onClose: () => void;
  onContinueSwiping: () => void;
}

export function SoloMatchModal({
  isOpen,
  place,
  distanceKm,
  onClose,
  onContinueSwiping,
}: SoloMatchModalProps) {
  if (!place) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  const placeItem = toPlaceCardItem(place);

  return (
    <>
      <Confetti trigger={isOpen ? 1 : 0} />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Tuyệt vời! Đã chọn được quán 🎉"
        description="Bạn đã ưng ý quán ăn này. Bạn có thể mở bản đồ chỉ đường ngay hoặc tiếp tục khám phá các quán khác."
        size="md"
        footer={
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                onContinueSwiping();
                onClose();
              }}
            >
              Tiếp tục xem quán khác
            </Button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'primary', fullWidth: true })}
            >
              <Navigation aria-hidden="true" size={18} />
              Chỉ đường Google Maps
              <ExternalLink aria-hidden="true" size={16} className="ml-0.5 opacity-80" />
            </a>
          </div>
        }
      >
        <Stack gap={4}>
          <PlaceCard place={placeItem} distanceKm={distanceKm} layout="vertical" />
        </Stack>
      </Modal>
    </>
  );
}

export default SoloMatchModal;
