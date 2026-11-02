// Màn hình Tạo phòng ăn mới kèm cấu hình bộ bài & vị trí GPS
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { CreateRoomRequest } from '../../../types';
import { useRoomActions } from '../../../features/room/useRoomActions';
import { useGeolocation } from '../../../hooks/useGeolocation';
import CreateRoomForm from '../../../features/room/CreateRoomForm';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/form/Button';

export default function RoomNew() {
  const navigate = useNavigate();
  const { coordinates } = useGeolocation();
  const { createNewRoom, isLoading, error } = useRoomActions();

  const handleCreateRoom = useCallback(
    async (request: CreateRoomRequest) => {
      const room = await createNewRoom(request);
      if (room) {
        navigate(`/app/room/${room.id}/lobby`);
      }
    },
    [createNewRoom, navigate],
  );

  return (
    <PageContainer maxWidth="md" className="py-6 space-y-6">
      <PageHeader
        title="Tạo Phòng Ăn Mới"
        subtitle="Thiết lập tên phòng, vị trí tìm kiếm quán ăn và cấu hình bộ bài quẹt thẻ cùng nhóm bạn."
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

      <div className="flex justify-center">
        <CreateRoomForm
          onSubmit={handleCreateRoom}
          initialCoords={coordinates}
          isSubmitting={isLoading}
          error={error}
          onCancel={() => navigate('/app/room')}
        />
      </div>
    </PageContainer>
  );
}
