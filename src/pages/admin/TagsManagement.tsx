// Màn hình Quản trị Tags hệ thống & Khẩu vị ẩm thực
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminActions } from '../../features/admin/useAdminActions';
import AdminTagManager from '../../features/admin/AdminTagManager';

import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/form/Button';

export default function TagsManagement() {
  const navigate = useNavigate();
  const {
    tags,
    isLoading,
    error,
    fetchAllSystemTags,
    createSystemTag,
    updateSystemTag,
    deleteSystemTag,
  } = useAdminActions();

  useEffect(() => {
    void fetchAllSystemTags();
  }, [fetchAllSystemTags]);

  return (
    <PageContainer maxWidth="xl" className="py-6 space-y-6">
      <PageHeader
        title="Quản Lý Tags Hệ Thống"
        subtitle="Quản lý danh mục tag sở thích và tâm trạng ăn uống phục vụ cho thuật toán ghép hội ngẫu nhiên."
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

      <AdminTagManager
        tags={tags}
        isLoading={isLoading}
        error={error}
        onCreateTag={createSystemTag}
        onUpdateTag={updateSystemTag}
        onDeleteTag={deleteSystemTag}
        onRefresh={() => void fetchAllSystemTags()}
      />
    </PageContainer>
  );
}
