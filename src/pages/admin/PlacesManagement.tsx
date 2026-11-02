// Màn hình Quản trị Danh mục Địa điểm & Quán ăn
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminActions } from '../../features/admin/useAdminActions';
import AdminPlaceManager from '../../features/admin/AdminPlaceManager';

import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/form/Button';

export default function PlacesManagement() {
  const navigate = useNavigate();
  const {
    places,
    isLoading,
    error,
    fetchAllPlaces,
    createPlaceByAdmin,
    updatePlaceByAdmin,
    deletePlaceByAdmin,
  } = useAdminActions();

  useEffect(() => {
    void fetchAllPlaces();
  }, [fetchAllPlaces]);

  return (
    <PageContainer maxWidth="xl" className="py-6 space-y-6">
      <PageHeader
        title="Quản Lý Địa Điểm"
        subtitle="Thêm mới quán ăn, tinh chỉnh tọa độ GPS, phân loại danh mục món ăn và khoảng giá."
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

      <AdminPlaceManager
        places={places}
        isLoading={isLoading}
        error={error}
        onCreatePlace={createPlaceByAdmin}
        onUpdatePlace={updatePlaceByAdmin}
        onDeletePlace={deletePlaceByAdmin}
        onRefresh={() => void fetchAllPlaces()}
      />
    </PageContainer>
  );
}
