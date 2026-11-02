// Màn hình Tổng quan Quản trị hệ thống
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminActions } from '../../features/admin/useAdminActions';
import AdminOverviewStats from '../../features/admin/AdminOverviewStats';

import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { overviewStats, isLoading, error, fetchAdminOverview } = useAdminActions();

  useEffect(() => {
    void fetchAdminOverview();
  }, [fetchAdminOverview]);

  return (
    <PageContainer maxWidth="xl" className="py-6 space-y-6">
      <PageHeader
        title="Trung Tâm Quản Trị"
        subtitle="Thống kê tổng quan người dùng, địa điểm ăn uống và tags ẩm thực trên toàn hệ thống."
      />

      <AdminOverviewStats
        stats={overviewStats}
        isLoading={isLoading}
        error={error}
        onRefresh={() => void fetchAdminOverview()}
        onNavigateToSection={(section) => {
          navigate(`/admin/${section}`);
        }}
      />
    </PageContainer>
  );
}
