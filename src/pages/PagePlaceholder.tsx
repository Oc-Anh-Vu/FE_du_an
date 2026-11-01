import { PageContainer, PageHeader } from "../components/layout"

interface PagePlaceholderProps {
  title: string
  description: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <PageContainer className="min-h-full" maxWidth="xl">
      <PageHeader title={title} subtitle={description} animated={false} />
      <section
        aria-label="Trạng thái triển khai"
        className="rounded-panel border border-border bg-card p-6"
      >
        <p className="font-semibold text-foreground">Khung giao diện đã sẵn sàng</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Trang này chưa kết nối nghiệp vụ hoặc dữ liệu Backend. Các tính năng sẽ được triển khai
          theo hợp đồng đã xác nhận.
        </p>
      </section>
    </PageContainer>
  )
}
