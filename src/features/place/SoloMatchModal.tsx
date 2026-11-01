import { Confetti } from '../../components/ui/effects';
import { Alert } from '../../components/ui/feedback/Alert';
import { Modal } from '../../components/ui/feedback/Modal';
import { Button } from '../../components/ui/form';
import { PlaceCard } from '../../components/ui/display';
import type { PlaceResponse } from '../../types';

interface SoloMatchModalProps {
  place: PlaceResponse | null;
  isOpen: boolean;
  celebrating: boolean;
  celebrationTrigger: number;
  detailsLoading: boolean;
  detailsError: string | null;
  onClose: () => void;
  onContinue: () => void;
}

export default function SoloMatchModal({
  place,
  isOpen,
  celebrating,
  celebrationTrigger,
  detailsLoading,
  detailsError,
  onClose,
  onContinue,
}: SoloMatchModalProps) {
  const mapUrl = place
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
    : undefined;

  return (
    <>
      <Confetti trigger={celebrationTrigger} count={36} duration={2400} />
      <Modal
        isOpen={isOpen && place !== null}
        onClose={onClose}
        title={celebrating ? 'Hôm nay mình ăn ở đây nhé!' : 'Thông tin địa điểm'}
        description={
          celebrating
            ? 'Bạn đã chọn được một địa điểm. Lưu lại để xem chi tiết hoặc mở chỉ đường.'
            : 'Thông tin được tải từ danh mục địa điểm.'
        }
        footer={
          place && (
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Button variant="ghost" onClick={onContinue}>
                Xem địa điểm khác
              </Button>
              {mapUrl && (
                <a
                  className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-ring"
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở chỉ đường
                </a>
              )}
            </div>
          )
        }
      >
        {place && (
          <div className="space-y-4">
            {detailsError && (
              <Alert variant="warning" title="Không tải được thông tin mới nhất" role="status">
                {detailsError}
              </Alert>
            )}
            {detailsLoading && (
              <p className="text-body-sm text-muted-foreground" role="status">
                Đang tải thông tin địa điểm...
              </p>
            )}
            <PlaceCard place={place} layout="horizontal" />
            <dl className="grid gap-3 rounded-card bg-muted p-4 text-body-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-muted-foreground">Địa chỉ</dt>
                <dd>{place.address || 'Chưa có thông tin'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Tọa độ</dt>
                <dd>
                  {place.latitude}, {place.longitude}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </>
  );
}
