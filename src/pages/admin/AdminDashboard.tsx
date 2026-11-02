import { PageContainer, PageHeader } from "../../components/layout"
import AdminOverviewStats from "../../features/admin/AdminOverviewStats"

export default function AdminDashboard() {
  return (
    <PageContainer className="min-h-full" maxWidth="xl">
      <PageHeader
        overline="HNAG Admin"
        title="Tổng quan quản trị"
        subtitle="Truy cập nhanh các khu vực quản lý hệ thống."
      />
      <AdminOverviewStats />
    </PageContainer>
  )
}
