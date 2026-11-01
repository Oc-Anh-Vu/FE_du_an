import { PageContainer, PageHeader } from "../../components/layout"
import AdminTagManager from "../../features/admin/AdminTagManager"

export default function TagsManagement() {
  return (
    <PageContainer className="min-h-full" maxWidth="2xl">
      <PageHeader
        overline="Quản trị hệ thống"
        title="Tags hệ thống"
        subtitle="Quản lý danh mục Tags sở thích dùng chung."
      />
      <AdminTagManager />
    </PageContainer>
  )
}
