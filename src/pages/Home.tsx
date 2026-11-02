// Trang chủ giới thiệu ứng dụng Hôm Nay Ăn Gì
import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, Sparkles, Utensils, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/form/Button';
import { Card } from '../components/ui/display/Card';
import { Badge } from '../components/ui/display/Badge';
import { useUserStore } from '../store/userStore';

const CORE_FEATURES = [
  {
    icon: <Utensils className="size-6 text-primary" aria-hidden="true" />,
    badge: 'Quẹt thẻ nhóm',
    title: 'Quẹt thẻ chốt quán trong 60 giây',
    description:
      'Thích vuốt phải, không thích vuốt trái. Cả nhóm cùng tham gia trên điện thoại, hệ thống tự động chốt quán ngay khi có điểm chung 100%.',
  },
  {
    icon: <Users className="size-6 text-secondary-foreground" aria-hidden="true" />,
    badge: 'Radar Ghép hội',
    title: 'Tìm hội bạn cùng khẩu vị',
    description:
      'Đi ăn một mình? Chọn tâm trạng hôm nay (thèm lẩu, đồ cay, healthy...), hệ thống tự động ghép phòng với những người bạn quanh vị trí của bạn.',
  },
  {
    icon: <CreditCard className="size-6 text-success" aria-hidden="true" />,
    badge: 'Quyết toán VietQR',
    title: 'Chia tiền hóa đơn & VietQR tức thì',
    description:
      'Sau bữa ăn, chia đều hoặc chia theo món chỉ với 1 chạm. Tự động sinh mã VietQR thanh toán chính xác từng nghìn đồng, không lo sót nợ.',
  },
];

const MOOD_PILLS = [
  '🍲 Thèm lẩu',
  '🥩 Đồ nướng',
  '🍺 Nhậu lai rai',
  '🍣 Sushi & Đồ Nhật',
  '🥗 Eat Clean & Healthy',
  '🍕 Pizza & Mì Ý',
  '🍜 Bún bò phở gà',
  '☕ Cà phê tán gẫu',
];

export default function Home() {
  const authStatus = useUserStore((state) => state.authStatus);
  const currentUser = useUserStore((state) => state.currentUser);
  const isAuthenticated = authStatus === 'AUTHENTICATED';
  const roles = currentUser?.roles || [];
  const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  const targetAppHref = isAdmin ? '/admin' : '/app';

  return (
    <PageContainer maxWidth="xl" className="py-8 md:py-16">
      {/* 1. Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center overflow-hidden py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 max-w-3xl space-y-6"
        >
          {/* Animated Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-body-sm font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>Ứng dụng quẹt thẻ chọn quán ăn theo nhóm</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-foreground">
            Hôm nay ăn gì?{' '}
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-500">
              Quẹt là chốt! 🍜
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chấm dứt điệp khúc "Ăn gì cũng được" bằng trải nghiệm quẹt thẻ trực quan.
            Cả nhóm cùng chọn món, tự động ghép kết quả và chia hóa đơn VietQR minh bạch.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <>
                <Link to={targetAppHref}>
                  <Button size="lg" variant="primary" className="h-12 px-8 font-bold shadow-cta">
                    Vào ứng dụng ngay
                    <ArrowRight size={18} className="ml-1" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/app/room">
                  <Button size="lg" variant="outline" className="h-12 px-6">
                    Phòng ăn của tôi
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" variant="primary" className="h-12 px-8 font-bold shadow-cta">
                    Bắt đầu ngay — Miễn phí
                    <ArrowRight size={18} className="ml-1" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    Đăng nhập tài khoản
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* 2. Mood Tags Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-2 max-w-2xl"
        >
          <span className="text-caption font-semibold text-muted-foreground mr-1">
            Gợi ý tâm trạng:
          </span>
          {MOOD_PILLS.map((mood) => (
            <Badge key={mood} variant="default" size="md" className="cursor-default shadow-sm">
              {mood}
            </Badge>
          ))}
        </motion.div>
      </section>

      {/* 3. Core Features Showcase */}
      <section className="py-12 md:py-16 border-t border-border/70">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <Badge variant="info" size="sm">
            <Sparkles size={12} className="mr-1" aria-hidden="true" />
            Tính năng nổi bật
          </Badge>
          <h2 className="text-heading md:text-title font-bold text-foreground">
            Giải quyết câu chuyện muôn thuở mỗi bữa ăn
          </h2>
          <p className="text-body-sm text-muted-foreground">
            Thiết kế dành riêng cho hội bạn thân, đồng nghiệp văn phòng và những tín đồ ẩm thực.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CORE_FEATURES.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
            >
              <Card
                as="article"
                className="h-full border border-border bg-card p-6 shadow-card hover:shadow-raised transition-all"
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-control bg-muted/60 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <Badge variant="default" size="sm">
                        {item.badge}
                      </Badge>
                    </div>
                    <h3 className="text-heading-sm font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-body-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Bottom Call-to-Action Banner */}
      <section className="py-8 md:py-12">
        <Card
          as="section"
          variant="dark"
          className="relative overflow-hidden rounded-section p-8 md:p-12 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-heading md:text-title font-extrabold text-surface-dark-foreground">
              Trưa nay đi ăn cùng hội bạn?
            </h2>
            <p className="text-body-sm md:text-body text-surface-dark-foreground/80">
              Tạo phòng ăn trong chớp mắt, chia sẻ mã 6 ký tự để mọi người cùng quẹt thẻ ngay!
            </p>
            <div className="pt-2">
              <Link to={isAuthenticated ? '/app/room/new' : '/signup'}>
                <Button size="lg" variant="primary" className="font-bold shadow-cta">
                  {isAuthenticated ? 'Tạo phòng ăn mới' : 'Đăng ký tài khoản miễn phí'}
                  <ArrowRight size={18} className="ml-1.5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
