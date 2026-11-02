import { PageContainer, PageHeader } from "../../components/layout"
import AdminPlaceManager from "../../features/admin/AdminPlaceManager"

export default function PlacesManagement() {
  return (
    <PageContainer className="min-h-full" maxWidth="2xl">
      <PageHeader
        overline="Quản trị hệ thống"
        title="Địa điểm"
        subtitle="Quản lý danh mục địa điểm ăn uống trên hệ thống."
      />
      <AdminPlaceManager />
    </PageContainer>
  )
}
