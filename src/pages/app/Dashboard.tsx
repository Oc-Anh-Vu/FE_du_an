// Màn hình Tổng quan người dùng (Dashboard)
import { useEffect } from 'react';
import { Compass, LogIn, PlusCircle, Radio, Utensils } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitView } from '../../components/layout/SplitView';
import { Card } from '../../components/ui/display/Card';
import { Button } from '../../components/ui/form/Button';
import { LocationPrompt } from '../../features/auth/LocationPrompt';
import DebtWarningBanner from '../../features/billing/DebtWarningBanner';
import ActiveRoomList from '../../features/room/ActiveRoomList';
import FriendList from '../../features/social/FriendList';
import { useBillingActions } from '../../features/billing/useBillingActions';
import { useRoomActions } from '../../features/room/useRoomActions';
import { useSocialActions } from '../../features/social/useSocialActions';
import { useUserStore } from '../../store/userStore';

function formatCurrentDate(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const coordinates = useUserStore((state) => state.coordinates);

  const { myDebts, fetchMyUnpaidDebts } = useBillingActions();
  const {
    activeRooms,
    isLoading: isLoadingRooms,
    error: roomsError,
    fetchMyActiveRooms,
  } = useRoomActions();
  const {
    friends,
    fetchAllSocialData,
    removeOrDecline,
  } = useSocialActions();

  useEffect(() => {
    void fetchMyUnpaidDebts();
    void fetchMyActiveRooms();
    void fetchAllSocialData();
  }, [fetchAllSocialData, fetchMyActiveRooms, fetchMyUnpaidDebts]);

  const username = currentUser?.username || 'Bạn';

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* 1. Tiêu đề chào mừng */}
      <PageHeader
        overline={formatCurrentDate()}
        title={`Chào ${username}, trưa nay ăn gì?`}
        subtitle="Chọn một cách thức bên dưới để bắt đầu bữa ăn ngon miệng cùng bạn bè."
      />

      {/* 2. Banner cảnh báo nợ (nếu có) */}
      <DebtWarningBanner
        debts={myDebts}
        onViewDebtsClick={() => navigate('/app/billing')}
        onRefresh={() => void fetchMyUnpaidDebts()}
      />

      {/* 3. Lời nhắc cấp quyền GPS (nếu chưa có tọa độ) */}
      {!coordinates && (
        <LocationPrompt
          compact
          onLocationChange={() => void fetchMyActiveRooms()}
        />
      )}

      {/* 4. Bốn thẻ hành động nhanh */}
      <section aria-label="Hành động nhanh" className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        <Link
          to="/app/explore?mode=swipe"
          className="group flex flex-col justify-between rounded-card border border-border bg-card p-4 transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-card md:p-5"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Utensils size={20} aria-hidden="true" />
          </div>
          <div className="mt-4">
            <p className="font-bold text-foreground text-body group-hover:text-primary transition-colors">
              Ăn một mình
            </p>
            <p className="text-caption text-muted-foreground">
              Quẹt chọn quán hợp gu
            </p>
          </div>
        </Link>

        <Link
          to="/app/room/new"
          className="group flex flex-col justify-between rounded-card border border-border bg-card p-4 transition-all hover:scale-[1.02] hover:border-secondary-foreground/50 hover:shadow-card md:p-5"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <PlusCircle size={20} aria-hidden="true" />
          </div>
          <div className="mt-4">
            <p className="font-bold text-foreground text-body group-hover:text-primary transition-colors">
              Tạo phòng
            </p>
            <p className="text-caption text-muted-foreground">
              Rủ bạn bè cùng quẹt
            </p>
          </div>
        </Link>

        <Link
          to="/app/room/join"
          className="group flex flex-col justify-between rounded-card border border-border bg-card p-4 transition-all hover:scale-[1.02] hover:border-success/50 hover:shadow-card md:p-5"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-success-soft text-success">
            <LogIn size={20} aria-hidden="true" />
          </div>
          <div className="mt-4">
            <p className="font-bold text-foreground text-body group-hover:text-success transition-colors">
              Nhập mã phòng
            </p>
            <p className="text-caption text-muted-foreground">
              Vào phòng bằng mã 6 số
            </p>
          </div>
        </Link>

        <Link
          to="/app/room/match"
          className="group flex flex-col justify-between rounded-card border border-border bg-card p-4 transition-all hover:scale-[1.02] hover:border-warning/50 hover:shadow-card md:p-5"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-warning-soft text-warning">
            <Radio size={20} aria-hidden="true" />
          </div>
          <div className="mt-4">
            <p className="font-bold text-foreground text-body group-hover:text-warning transition-colors">
              Radar Ghép hội
            </p>
            <p className="text-caption text-muted-foreground">
              Gặp người cùng khẩu vị
            </p>
          </div>
        </Link>
      </section>

      {/* 5. Khối nội dung chính: Phòng đang mở & Bạn bè thân thiết */}
      <SplitView
        ratio="sidebar-right"
        left={
          <ActiveRoomList
            rooms={activeRooms}
            isLoading={isLoadingRooms}
            error={roomsError}
            onRetry={() => void fetchMyActiveRooms()}
            onRoomClick={(room) => navigate(`/app/room/${room.id}/lobby`)}
            onCreateClick={() => navigate('/app/room/new')}
            onJoinClick={() => navigate('/app/room/join')}
            onMatchClick={() => navigate('/app/room/match')}
          />
        }
        right={
          <Card
            as="section"
            title="Hội bạn thân"
            description="Bạn bè của bạn trên hệ thống"
            headerAction={
              <Link to="/app/friends">
                <Button variant="ghost" size="sm" rightIcon={<Compass size={14} aria-hidden="true" />}>
                  Xem tất cả
                </Button>
              </Link>
            }
          >
            <FriendList
              friends={friends.slice(0, 5)}
              onRemoveFriend={async (targetId) => {
                await removeOrDecline(targetId);
              }}
            />
          </Card>
        }
      />
    </PageContainer>
  );
}
