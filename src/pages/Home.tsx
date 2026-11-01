import { Link } from "react-router-dom"
import { PageContainer, PageHeader } from "../components/layout"

export default function Home() {
  return (
    <PageContainer className="py-12 md:py-20" maxWidth="xl">
      <div className="max-w-3xl space-y-8">
        <PageHeader
          overline="Hôm Nay Ăn Gì"
          title="Chọn món nhanh hơn, vui hơn cùng hội bạn."
          subtitle="Một nơi để khám phá quán ăn và cùng nhau quyết định bữa tiếp theo."
        />
        <div className="flex flex-wrap gap-3">
          <Link
            className="focus-ring rounded-control bg-primary-hover px-6 py-3 font-semibold text-primary-foreground"
            to="/signup"
          >
            Bắt đầu
          </Link>
          <Link
            className="focus-ring rounded-control border border-border bg-card px-6 py-3 font-semibold text-foreground"
            to="/login"
          >
            Đăng nhập
          </Link>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Đây là khung giao diện ban đầu. Các luồng tài khoản, khám phá và phòng ăn sẽ được nối
          theo hợp đồng API của dự án.
        </p>
      </div>
    </PageContainer>
  )
}
