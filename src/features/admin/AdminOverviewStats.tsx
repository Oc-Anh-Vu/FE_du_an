import { ArrowRight, Compass, RefreshCw, ShieldCheck, Tags, UsersRound } from 'lucide-react';
import type { AdminOverviewData } from './useAdminActions';
import { StatCard } from '../../components/ui/display/StatCard';
import { Card } from '../../components/ui/display/Card';
import { Button } from '../../components/ui/form/Button';
import { Spinner } from '../../components/ui/feedback/Spinner';
import { Alert } from '../../components/ui/feedback/Alert';

export interface AdminOverviewStatsProps {
  stats?: AdminOverviewData | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => Promise<void> | void;
  onNavigateToSection?: (section: 'users' | 'places' | 'tags') => void;
}

const adminShortcuts = [
  {
    key: 'users' as const,
    title: 'Quản lý Người dùng',
    description: 'Xem danh sách, chỉnh sửa thông tin tài khoản và kiểm soát quyền hạn.',
    icon: UsersRound,
  },
  {
    key: 'places' as const,
    title: 'Quản lý Địa điểm',
    description: 'Thêm mới quán ăn, cập nhật tọa độ GPS, danh mục và khoảng giá.',
    icon: Compass,
  },
  {
    key: 'tags' as const,
    title: 'Quản lý Tags hệ thống',
    description: 'Quản lý danh mục tag sở thích và tâm trạng dùng chung cho việc ghép hội.',
    icon: Tags,
  },
];

export default function AdminOverviewStats({
  stats,
  isLoading = false,
  error = null,
  onRefresh,
  onNavigateToSection,
}: AdminOverviewStatsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16" aria-live="polite">
        <Spinner size="lg" label="Đang tải số liệu thống kê hệ thống..." />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header và nút làm mới */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-heading-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            <span>Thống kê & Tổng quan Hệ thống</span>
          </h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Số liệu thống kê thời gian thực từ cơ sở dữ liệu
          </p>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw aria-hidden="true" size={16} />}
            onClick={() => void onRefresh()}
          >
            Làm mới
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" title="Không thể tải số liệu thống kê">
          {error}
        </Alert>
      )}

      {/* Lưới thẻ StatCard KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Tổng người dùng"
          value={stats?.totalUsers ?? 0}
          description={
            stats
              ? `${stats.adminCount} quản trị viên · ${stats.totalUsers - stats.adminCount} người dùng`
              : 'Đang cập nhật'
          }
          icon={<UsersRound size={20} className="text-primary" />}
        />

        <StatCard
          title="Địa điểm ăn uống"
          value={stats?.totalPlaces ?? 0}
          description="Quán ăn đã lưu trên hệ thống"
          icon={<Compass size={20} className="text-primary" />}
        />

        <StatCard
          title="Tags hệ thống"
          value={stats?.totalTags ?? 0}
          description="Danh mục sở thích & tâm trạng"
          icon={<Tags size={20} className="text-primary" />}
        />
      </div>

      {/* Lối tắt quản trị */}
      <div className="space-y-4">
        <h3 className="text-body font-bold text-foreground">
          Lối tắt phân hệ quản trị
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          {adminShortcuts.map(({ key, title, description, icon: Icon }) => (
            <div
              key={key}
              role="button"
              tabIndex={0}
              className="focus-ring block h-full rounded-card cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => onNavigateToSection?.(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigateToSection?.(key);
                }
              }}
              aria-label={`Mở phân hệ ${title}`}
            >
              <Card className="h-full border border-border bg-card p-5 transition-shadow hover:shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                    <Icon size={22} />
                  </span>
                  <ArrowRight size={18} className="text-muted-foreground" />
                </div>
                <h4 className="mt-4 text-heading-sm font-bold text-foreground">
                  {title}
                </h4>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  {description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
