import { Link } from "react-router-dom"
import { PageContainer, PageHeader } from "../components/layout"

export default function NotFound() {
  return (
    <PageContainer className="min-h-[60vh] justify-center" maxWidth="md">
      <PageHeader
        title="404 — Không tìm thấy trang"
        subtitle="Đường dẫn này chưa có trong ứng dụng."
      />
      <Link
        className="focus-ring w-fit rounded-control bg-primary-hover px-6 py-3 font-semibold text-primary-foreground"
        to="/"
      >
        Về trang chủ
      </Link>
    </PageContainer>
  )
}
