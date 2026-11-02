// Màn hình Tham gia phòng ăn bằng mã 6 ký tự
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRoomActions } from '../../../features/room/useRoomActions';
import JoinRoomForm from '../../../features/room/JoinRoomForm';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui/form/Button';

export default function Join() {
  const navigate = useNavigate();
  const { joinRoomByCode, isLoading, error } = useRoomActions();

  const handleJoinRoom = useCallback(
    async (roomCode: string) => {
      const room = await joinRoomByCode(roomCode);
      if (room) {
        if (room.status === 'SWIPING') {
          navigate(`/app/room/${room.id}/swipe`);
        } else if (room.status === 'CLOSED') {
          navigate(`/app/room/${room.id}/summary`);
        } else {
          navigate(`/app/room/${room.id}/lobby`);
        }
      }
    },
    [joinRoomByCode, navigate],
  );

  return (
    <PageContainer maxWidth="md" className="py-6 space-y-6">
      <PageHeader
        title="Tham Gia Phòng Ăn"
        subtitle="Nhập mã 6 ký tự được bạn bè chia sẻ để cùng tham gia phiên quẹt thẻ chọn quán."
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

      <div className="flex justify-center pt-4">
        <JoinRoomForm
          onSubmit={handleJoinRoom}
          isSubmitting={isLoading}
          error={error}
          onCreateNewClick={() => navigate('/app/room/new')}
        />
      </div>
    </PageContainer>
  );
}
