// Màn hình Quản trị Người dùng & Phân quyền tài khoản
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminActions } from '../../features/admin/useAdminActions';
import AdminUserManager from '../../features/admin/AdminUserManager';

import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/form/Button';

export default function UsersManagement() {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    error,
    fetchAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
  } = useAdminActions();

  useEffect(() => {
    void fetchAllUsers();
  }, [fetchAllUsers]);

  return (
    <PageContainer maxWidth="xl" className="py-6 space-y-6">
      <PageHeader
        title="Quản Lý Người Dùng"
        subtitle="Tra cứu danh sách thành viên, cập nhật thông tin tài khoản hoặc phân quyền hệ thống."
        action={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/admin')}
          >
            Về Dashboard
          </Button>
        }
      />

      <AdminUserManager
        users={users}
        isLoading={isLoading}
        error={error}
        onUpdateUser={updateUserByAdmin}
        onDeleteUser={deleteUserByAdmin}
        onRefresh={() => void fetchAllUsers()}
      />
    </PageContainer>
  );
}
