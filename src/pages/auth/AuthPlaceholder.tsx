import { AuthLayout } from "../../components/layout"

interface AuthPlaceholderProps {
  title: string
  description: string
}

export default function AuthPlaceholder({ title, description }: AuthPlaceholderProps) {
  return (
    <AuthLayout title={title} subtitle="Hôm nay ăn gì">
      <p className="text-sm leading-relaxed text-muted-foreground" role="status">
        {description}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Biểu mẫu và xác thực chưa được kết nối trong khung dự án này.
      </p>
    </AuthLayout>
  )
}
