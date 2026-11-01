import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { EmptyState } from '../../components/ui/feedback/EmptyState';
import { Button } from '../../components/ui/form';
import { PlaceCard } from '../../components/ui/display';
import type { PlaceResponse } from '../../types';

interface SoloSwipeDeckProps {
  places: PlaceResponse[];
  onSelectPlace: (place: PlaceResponse) => void;
}

export default function SoloSwipeDeck({ places, onSelectPlace }: SoloSwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const currentPlace = places[index];

  function passCurrentPlace() {
    setIndex((currentIndex) => currentIndex + 1);
  }

  function likeCurrentPlace() {
    if (!currentPlace) return;
    onSelectPlace(currentPlace);
    setIndex((currentIndex) => currentIndex + 1);
  }

  if (places.length === 0) {
    return (
      <EmptyState
        title="Chưa có địa điểm để quẹt"
        description="Hãy thử đổi bộ lọc để tìm thêm địa điểm."
        icon="🍽️"
        size="lg"
      />
    );
  }

  if (!currentPlace) {
    return (
      <EmptyState
        title="Bạn đã xem hết danh sách"
        description="Bắt đầu lại để xem các địa điểm từ đầu."
        icon="🎉"
        size="lg"
        action={
          <Button
            leftIcon={<RotateCcw aria-hidden="true" size={18} />}
            onClick={() => setIndex(0)}
          >
            Quẹt lại
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="mb-3 text-center text-body-sm text-muted-foreground" aria-live="polite">
        Địa điểm {index + 1} / {places.length} · Vuốt sang trái để bỏ qua, sang phải để chọn
      </p>
      <motion.div
        key={currentPlace.id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100) likeCurrentPlace();
          else if (info.offset.x < -100) passCurrentPlace();
        }}
        className="cursor-grab touch-pan-y active:cursor-grabbing"
      >
        <PlaceCard
          place={currentPlace}
          showActions
          onPass={passCurrentPlace}
          onLike={likeCurrentPlace}
          aria-label={`Địa điểm ${currentPlace.name}`}
        />
      </motion.div>
      <p className="sr-only">Có thể dùng các nút Bỏ qua và Thích để thao tác không cần vuốt.</p>
    </div>
  );
}
