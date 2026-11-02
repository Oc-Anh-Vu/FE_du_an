import { PageContainer, PageHeader } from "../../components/layout"
import AdminUserManager from "../../features/admin/AdminUserManager"

export default function UsersManagement() {
  return (
    <PageContainer className="min-h-full" maxWidth="2xl">
      <PageHeader
        overline="Quản trị hệ thống"
        title="Người dùng"
        subtitle="Xem hồ sơ và quản lý thông tin người dùng."
      />
      <AdminUserManager />
    </PageContainer>
  )
}
