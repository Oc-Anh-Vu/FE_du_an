// Màn hình Danh sách phòng ăn & Trung tâm điều phối phòng
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, PlusCircle, Radio } from 'lucide-react';
import type { RoomResponse } from '../../../types';
import { useRoomActions } from '../../../features/room/useRoomActions';
import ActiveRoomList from '../../../features/room/ActiveRoomList';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Card } from '../../../components/ui/display/Card';
import { Button } from '../../../components/ui/form/Button';

export default function RoomHome() {
  const navigate = useNavigate();
  const { activeRooms, isLoading, error, fetchMyActiveRooms } = useRoomActions();

  // Nạp danh sách phòng khi mount
  useEffect(() => {
    void fetchMyActiveRooms();
  }, [fetchMyActiveRooms]);

  // Điều hướng thông minh theo trạng thái của phòng
  const handleRoomClick = useCallback(
    (room: RoomResponse) => {
      if (room.status === 'SWIPING') {
        navigate(`/app/room/${room.id}/swipe`);
      } else if (room.status === 'CLOSED') {
        navigate(`/app/room/${room.id}/summary`);
      } else {
        navigate(`/app/room/${room.id}/lobby`);
      }
    },
    [navigate],
  );

  return (
    <PageContainer maxWidth="xl" className="py-6 space-y-6">
      <PageHeader
        title="Phòng Ăn Của Bạn"
        subtitle="Quản lý các phòng ăn đang mở, tạo phòng quẹt thẻ mới hoặc ghép hội ngẫu nhiên."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogIn className="h-4 w-4" />}
              onClick={() => navigate('/app/room/join')}
            >
              Nhập mã phòng
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              onClick={() => navigate('/app/room/new')}
            >
              Tạo phòng mới
            </Button>
          </div>
        }
      />

      {/* Lối tắt 3 hành động nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="p-5 hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => navigate('/app/room/new')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-body font-bold text-foreground">Tạo phòng ăn</h3>
              <p className="text-caption text-foreground-muted">Chọn quán cùng nhóm bạn</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-5 hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => navigate('/app/room/join')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10 text-info group-hover:scale-105 transition-transform">
              <LogIn className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-body font-bold text-foreground">Vào bằng mã</h3>
              <p className="text-caption text-foreground-muted">Nhập mã 6 ký tự tham gia</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-5 hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => navigate('/app/room/match')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10 text-warning group-hover:scale-105 transition-transform">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-body font-bold text-foreground">Radar ghép hội</h3>
              <p className="text-caption text-foreground-muted">Tìm phòng theo tâm trạng</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Danh sách phòng đang hoạt động */}
      <ActiveRoomList
        rooms={activeRooms}
        isLoading={isLoading}
        error={error}
        onRetry={() => void fetchMyActiveRooms()}
        onRoomClick={handleRoomClick}
        onCreateClick={() => navigate('/app/room/new')}
        onJoinClick={() => navigate('/app/room/join')}
        onMatchClick={() => navigate('/app/room/match')}
      />
    </PageContainer>
  );
}
