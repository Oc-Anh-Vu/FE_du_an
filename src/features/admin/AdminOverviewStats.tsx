import { Link } from "react-router-dom";
import { ArrowRight, Compass, Tags, UsersRound } from "lucide-react";
import { Alert } from "../../components/ui/feedback/Alert";
import { Card } from "../../components/ui/display/Card";

const adminSections = [
  {
    title: "Người dùng",
    description: "Xem hồ sơ, cập nhật thông tin và quản lý tài khoản.",
    to: "/admin/users",
    icon: UsersRound,
  },
  {
    title: "Địa điểm",
    description: "Thêm, chỉnh sửa và xóa địa điểm ăn uống.",
    to: "/admin/places",
    icon: Compass,
  },
  {
    title: "Tags hệ thống",
    description: "Quản lý danh mục Tag sở thích dùng chung.",
    to: "/admin/tags",
    icon: Tags,
  },
];

export default function AdminOverviewStats() {
  return (
    <div className="space-y-6">
      <Alert variant="info" title="Chưa có API thống kê tổng quan">
        Trang này chưa hiển thị số liệu KPI. API hiện tại chưa cung cấp endpoint tổng hợp thống kê;
        các mục bên dưới dẫn tới dữ liệu quản trị được tải trực tiếp từ máy chủ.
      </Alert>
      <div className="grid gap-4 md:grid-cols-3">
        {adminSections.map(({ title, description, to, icon: Icon }) => (
          <Link
            key={to}
            className="focus-ring rounded-card"
            to={to}
            aria-label={`Mở quản lý ${title}`}
          >
            <Card className="h-full transition-shadow hover:shadow-raised" padding="md">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <ArrowRight aria-hidden="true" className="text-muted-foreground" size={18} />
              </div>
              <h2 className="mt-5 text-heading-sm font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-body-sm text-muted-foreground">{description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
