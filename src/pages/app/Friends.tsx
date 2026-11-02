// Màn hình Quản lý Hội ăn & Kết bạn
import { useEffect, useState } from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitView } from '../../components/layout/SplitView';
import { Card } from '../../components/ui/display/Card';
import { Button } from '../../components/ui/form/Button';
import FriendList from '../../features/social/FriendList';
import FriendRequestTabs from '../../features/social/FriendRequestTabs';
import UserSearchModal from '../../features/social/UserSearchModal';
import { useSocialActions } from '../../features/social/useSocialActions';
import { useUserStore } from '../../store/userStore';

export default function Friends() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const currentUserId = useUserStore((state) => state.currentUser?.id);

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    isLoading,
    error,
    isSearchForbidden,
    fetchAllSocialData,
    sendRequest,
    acceptRequest,
    removeOrDecline,
    searchUsersOrFallbackByUuid,
  } = useSocialActions();

  useEffect(() => {
    void fetchAllSocialData();
  }, [fetchAllSocialData]);

  const existingFriendIds = friends.map((f) => f.id);
  const existingOutgoingIds = outgoingRequests.map((r) => r.addressee.id);

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Hội ăn của bạn"
        subtitle="Quản lý danh sách bạn bè, duyệt các lời mời kết bạn và tìm thêm bạn cùng gu ẩm thực."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />}
              onClick={() => void fetchAllSocialData()}
            >
              Làm mới
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus size={16} aria-hidden="true" />}
              onClick={() => setIsSearchOpen(true)}
            >
              Tìm bạn mới
            </Button>
          </div>
        }
      />

      {/* 2. Khối nội dung 2 cột: Danh sách bạn bè & Lời mời kết bạn */}
      <SplitView
        ratio="equal"
        left={
          <Card
            as="section"
            title={`Bạn bè chính thức (${friends.length})`}
            description="Những người bạn đã kết nối trong hội ăn"
            className="h-full"
          >
            <FriendList
              friends={friends}
              onRemoveFriend={async (targetId) => {
                await removeOrDecline(targetId);
              }}
            />
          </Card>
        }
        right={
          <Card
            as="section"
            title="Yêu cầu kết bạn"
            description="Duyệt các lời mời kết bạn đến hoặc thu hồi lời mời đã gửi"
            className="h-full"
          >
            <FriendRequestTabs
              incomingRequests={incomingRequests}
              outgoingRequests={outgoingRequests}
              isLoading={isLoading}
              loadError={error}
              onAccept={async (requesterId) => {
                await acceptRequest(requesterId);
              }}
              onDecline={async (requesterId) => {
                await removeOrDecline(requesterId);
              }}
              onCancel={async (addresseeId) => {
                await removeOrDecline(addresseeId);
              }}
              onRefresh={() => void fetchAllSocialData()}
            />
          </Card>
        }
      />

      {/* 3. Modal tìm kiếm người dùng & gửi lời mời */}
      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchUsers={searchUsersOrFallbackByUuid}
        onSendRequest={sendRequest}
        currentUserId={currentUserId}
        existingFriendIds={existingFriendIds}
        existingOutgoingRequestIds={existingOutgoingIds}
        isSearchForbidden={isSearchForbidden}
      />
    </PageContainer>
  );
}
