// Màn hình Khám phá Địa điểm & Chế độ Ăn một mình
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { PlaceCatalogView, type CatalogMode } from '../../features/place/PlaceCatalogView';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc chế độ hiển thị từ URL search params (?mode=swipe hoặc ?mode=list)
  const currentModeParam = searchParams.get('mode');
  const activeMode: CatalogMode = currentModeParam === 'swipe' ? 'swipe' : 'list';

  const handleModeChange = (newMode: CatalogMode) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newMode === 'swipe') {
          next.set('mode', 'swipe');
        } else {
          next.delete('mode');
        }
        return next;
      },
      { replace: true },
    );
  };

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      <PageHeader
        title="Khám phá Ẩm thực"
        subtitle="Tìm kiếm hàng ngàn quán ngon quanh đây hoặc chuyển sang chế độ Quẹt thẻ để tự chọn bữa ăn một mình."
      />

      <PlaceCatalogView
        mode={activeMode}
        onModeChange={handleModeChange}
      />
    </PageContainer>
  );
}
