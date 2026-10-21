import { useState } from "react"
import {
  // Phần 1: ui/form (12)
  Button,
  IconButton,
  Tag,
  Input,
  PasswordInput,
  SearchInput,
  CurrencyInput,
  OtpInput,
  Checkbox,
  Switch,
  Slider,
  SegmentedControl,
  // Phần 2: ui/display (10)
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  StatCard,
  PlaceCard,
  ListItem,
  CopyableCode,
  QRCodeDisplay,
  Divider,
  // Phần 3: ui/feedback (8)
  Spinner,
  ProgressBar,
  Skeleton,
  Alert,
  Stepper,
  EmptyState,
  Toast,
  Modal,
  // Phần 4: ui/effects (2)
  Confetti,
  FloatingHearts,
  // Phần 5: layout (8)
  Stack,
  Grid,
  PageContainer,
  PageHeader,
  PageSection,
  SplitView,
  MainLayout,
  AuthLayout,
  type Place,
} from "./components"

interface DocBoxProps {
  index: string
  name: string
  path: string
  type: "interactive" | "display" | "layout"
  purpose: string
  howToTest: string
  usageCode: string
  children: React.ReactNode
}

function ComponentDocCard({
  index,
  name,
  path,
  type,
  purpose,
  howToTest,
  usageCode,
  children,
}: DocBoxProps) {
  const typeBadges = {
    interactive: { label: "⚡ Tương tác (Interactive)", variant: "default" as const },
    display: { label: "👁️ Hiển thị (Display)", variant: "info" as const },
    layout: { label: "📐 Bố cục (Layout)", variant: "success" as const },
  }

  return (
    <div className="bg-card border border-border rounded-[28px] overflow-hidden shadow-xs">
      {/* Header tên component + đường dẫn */}
      <div className="px-6 py-4 bg-muted/60 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="size-8 rounded-xl bg-primary text-primary-foreground font-extrabold text-[13px] flex items-center justify-center shrink-0">
            {index}
          </span>
          <div>
            <h3 className="text-[18px] font-bold text-foreground leading-snug">{name}</h3>
            <code className="text-[12px] text-muted-foreground font-mono">{path}</code>
          </div>
        </div>
        <Badge variant={typeBadges[type].variant}>{typeBadges[type].label}</Badge>
      </div>

      {/* Khối ghi chú: Mục đích · Cách tương tác · Cách sử dụng */}
      <div className="px-6 py-3.5 bg-background/70 border-b border-border grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
        <div className="bg-card p-3 rounded-xl border border-border">
          <p className="font-bold text-foreground mb-1">🎯 Mục đích</p>
          <p className="text-muted-foreground leading-relaxed">{purpose}</p>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border">
          <p className="font-bold text-primary mb-1">👆 Cách tương tác / Kiểm thử</p>
          <p className="text-muted-foreground leading-relaxed">{howToTest}</p>
        </div>
        <div className="bg-card p-3 rounded-xl border border-border">
          <p className="font-bold text-foreground mb-1">💻 Cách sử dụng (Props chính)</p>
          <code className="text-[12px] font-mono text-secondary-foreground bg-secondary/50 px-1.5 py-0.5 rounded break-words block">
            {usageCode}
          </code>
        </div>
      </div>

      {/* Khu vực chạy thử thực tế */}
      <div className="p-6">{children}</div>
    </div>
  )
}

const DEMO_PLACES: (Place & { distanceKm: number })[] = [
  {
    id: "1",
    name: "Lẩu Phan Thái Hà",
    category: "Lẩu",
    price_range: 2,
    image_url: "https://images.unsplash.com/photo-1582295528072-4d1d916cc691?auto=format&fit=crop&q=80&w=600",
    address: "16 Thái Hà, Đống Đa",
    latitude: 21.01,
    longitude: 105.82,
    rating: 4.7,
    distanceKm: 1.6,
  },
  {
    id: "2",
    name: "Bún Chả Hương Liên",
    category: "Bún / Phở",
    price_range: 1,
    image_url: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=600",
    address: "24 Lê Văn Hưu, Hai Bà Trưng",
    latitude: 21.02,
    longitude: 105.85,
    rating: 4.8,
    distanceKm: 0.8,
  },
]

const ALL_MOCK_USERS = [
  { id: "1", name: "Linh Anh", color: "bg-purple-500" },
  { id: "2", name: "Nam Minh", color: "bg-blue-500" },
  { id: "3", name: "Thu Hà", color: "bg-pink-500" },
  { id: "4", name: "Quang Duy", color: "bg-emerald-600" },
  { id: "5", name: "Hải Đăng", color: "bg-amber-500" },
  { id: "6", name: "Tuấn Anh", color: "bg-indigo-500" },
]

const DEMO_NAV_ITEMS = [
  {
    key: "home",
    label: "Trang chủ",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "explore",
    label: "Khám phá",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    key: "friends",
    label: "Hội ăn",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    badge: <Badge size="sm" variant="default">4</Badge>,
  },
  {
    key: "billing",
    label: "Tài chính",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
]

type SectionFilter = "all" | "part1" | "part2" | "part3" | "part4" | "part5"

export default function AppDemo() {
  const [activeFilter, setActiveFilter] = useState<SectionFilter>("all")

  // --- States cho PHẦN 1: ui/form ---
  const [btnLoading, setBtnLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(["Lẩu", "Trà sữa"])
  const [inputText, setInputText] = useState("Hội ăn trưa thứ 5")
  const [showInputError, setShowInputError] = useState(true)
  const [passwordVal, setPasswordVal] = useState("MatKhau@123")
  const [searchVal, setSearchVal] = useState("Bún chả Hà Nội")
  const [currencyVal, setCurrencyVal] = useState<number | null>(250000)
  const [otpVal, setOtpVal] = useState("123456")
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [switchChecked, setSwitchChecked] = useState(true)
  const [segmentVal, setSegmentVal] = useState("equal")
  const [sliderVal, setSliderVal] = useState(5)

  // --- States cho PHẦN 2: ui/display ---
  const [avatarGroupMax, setAvatarGroupMax] = useState(4)
  const [placeFeedback, setPlaceFeedback] = useState<string>("Chưa chọn hành động")
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState(false)

  // --- States cho PHẦN 3: ui/feedback ---
  const [progressVal, setProgressVal] = useState(75)
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true)
  const [stepperCurrent, setStepperCurrent] = useState(1)
  const [modalSize, setModalSize] = useState<"sm" | "md" | "lg">("md")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastState, setToastState] = useState<{
    visible: boolean
    type: "success" | "error" | "warning" | "info"
    message: string
  }>({
    visible: true,
    type: "success",
    message: "Đã sao chép mã phòng thành công!",
  })

  // --- States cho PHẦN 4: ui/effects ---
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [heartTrigger, setHeartTrigger] = useState(0)
  const [heartBatchCount, setHeartBatchCount] = useState(5)

  // --- States cho PHẦN 5: layout ---
  const [splitRatio, setSplitRatio] = useState<"equal" | "sidebar-left" | "sidebar-right">("sidebar-left")
  const [activeNav, setActiveNav] = useState("home")

  const toggleTag = (label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    )
  }

  const handleSimulateLoading = () => {
    setBtnLoading(true)
    setTimeout(() => setBtnLoading(false), 1200)
  }

  const showPart = (part: SectionFilter) => activeFilter === "all" || activeFilter === part

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Hiệu ứng Confetti toàn màn hình */}
      <Confetti trigger={confettiTrigger} count={55} />

      {/* Header Cố Định & Bộ Lọc 5 Phần */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl shadow-xs">
                🍜
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[18px] md:text-[20px] font-extrabold text-foreground tracking-tight">
                    Bản Mẫu Kiểm Thử Hệ Thống Dumb Components (40 Components)
                  </h1>
                  <Badge variant="default">5 Phân Mục</Badge>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Tài liệu trực quan kèm hướng dẫn mục đích, cách tương tác và cú pháp sử dụng cho từng component trong <code>/ssrc/components</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setConfettiTrigger((c) => c + 1)}
              >
                🎉 Test nhanh Pháo hoa
              </Button>
            </div>
          </div>

          {/* Thanh chọn nhanh 5 phần theo cấu trúc thư mục */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: "all", label: "📋 Hiển thị tất cả (40)" },
              { id: "part1", label: "1. ui/form (12)" },
              { id: "part2", label: "2. ui/display (10)" },
              { id: "part3", label: "3. ui/feedback (8)" },
              { id: "part4", label: "4. ui/effects (2)" },
              { id: "part5", label: "5. layout (8)" },
            ].map((tab) => {
              const active = activeFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as SectionFilter)}
                  className={`px-3.5 py-1.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 space-y-16">
        {/* =====================================================================
            PHẦN 1: ssrc/components/ui/form (12 COMPONENTS)
        ===================================================================== */}
        {showPart("part1") && (
          <section className="space-y-6">
            <div className="bg-secondary/60 border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-primary">
                  PHẦN 1 / 5 · THƯ MỤC: ssrc/components/ui/form
                </span>
                <h2 className="text-[24px] md:text-[28px] font-extrabold text-foreground mt-0.5">
                  1. Nhóm Form & Điều Khiển Tương Tác (12 Components)
                </h2>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Bao gồm toàn bộ các thành phần nhận dữ liệu đầu vào, nút bấm, bộ chọn và thanh trượt có trạng thái tương tác trực tiếp.
                </p>
              </div>
              <Badge variant="default">12 Interactive Components</Badge>
            </div>

            {/* 1.1 Button & IconButton */}
            <ComponentDocCard
              index="1.1"
              name="Button & IconButton"
              path="ssrc/components/ui/form/Button.tsx · IconButton.tsx"
              type="interactive"
              purpose="Nút bấm thực thi hành động chính/phụ trong toàn ứng dụng và nút tròn chỉ chứa icon (bắt buộc có aria-label hỗ trợ trợ năng)."
              howToTest="Bấm vào nút 'Giả lập Loading 1.2s' để kiểm tra hiệu ứng khóa nút và xoay Spinner tự động."
              usageCode='<Button variant="primary" size="md" loading={isLoading} onClick={...}>Lưu</Button>'
            >
              <Stack gap={5}>
                <div>
                  <p className="text-[13px] font-bold text-muted-foreground mb-2.5">5 Variants của Button:</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button variant="primary" onClick={handleSimulateLoading} loading={btnLoading}>
                      {btnLoading ? "Đang xử lý..." : "Primary (Bấm thử Loading 1.2s)"}
                    </Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>

                <Divider />

                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div>
                    <p className="text-[13px] font-bold text-muted-foreground mb-2.5">3 Kích thước (sm, md, lg):</p>
                    <div className="flex flex-wrap gap-3 items-center">
                      <Button size="sm">Size SM</Button>
                      <Button size="md">Size MD</Button>
                      <Button size="lg">Size LG</Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-muted-foreground mb-2.5">IconButton (4 sizes & variants):</p>
                    <div className="flex flex-wrap gap-3 items-center">
                      <IconButton aria-label="Đóng" variant="secondary" size="sm">✕</IconButton>
                      <IconButton aria-label="Cài đặt" variant="outline" size="md">⚙️</IconButton>
                      <IconButton aria-label="Thả tim" variant="danger" size="lg">❤️</IconButton>
                      <IconButton aria-label="Đang tải" variant="primary" size="md" loading />
                    </div>
                  </div>
                </div>
              </Stack>
            </ComponentDocCard>

            {/* 1.2 Tag */}
            <ComponentDocCard
              index="1.2"
              name="Tag (Thẻ chọn khẩu vị / bộ lọc)"
              path="ssrc/components/ui/form/Tag.tsx"
              type="interactive"
              purpose="Dùng để chọn nhiều khẩu vị món ăn (Lẩu, Nướng, Healthy...) khi tạo phòng hoặc lọc danh sách quán."
              howToTest="Bấm trực tiếp vào từng Tag bên dưới để bật/tắt trạng thái selected."
              usageCode='<Tag label="Lẩu" emoji="🍲" selected={isSelected} onClick={toggle} />'
            >
              <Stack gap={3}>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: "Lẩu", emoji: "🍲" },
                    { label: "Nướng BBQ", emoji: "🔥" },
                    { label: "Món Hàn", emoji: "🍱" },
                    { label: "Trà sữa", emoji: "🧋" },
                    { label: "Healthy", emoji: "🥗" },
                    { label: "Gần đây ≤ 2km", emoji: "📍" },
                  ].map((item) => (
                    <Tag
                      key={item.label}
                      label={item.label}
                      emoji={item.emoji}
                      selected={selectedTags.includes(item.label)}
                      onClick={() => toggleTag(item.label)}
                    />
                  ))}
                </div>
                <p className="text-[13px] text-muted-foreground">
                  Đang chọn ({selectedTags.length}):{" "}
                  <b className="text-primary">{selectedTags.join(", ") || "Chưa chọn thẻ nào"}</b>
                </p>
              </Stack>
            </ComponentDocCard>

            {/* 1.3 Input, PasswordInput, SearchInput */}
            <ComponentDocCard
              index="1.3"
              name="Input · PasswordInput · SearchInput"
              path="ssrc/components/ui/form/Input.tsx · PasswordInput.tsx · SearchInput.tsx"
              type="interactive"
              purpose="Bộ ô nhập văn bản chuẩn, ô mật khẩu có nút ẩn/hiện kèm thanh đo độ mạnh, và ô tìm kiếm có nút xóa nhanh."
              howToTest="1) Bấm nút Bật/Tắt lỗi ở Input; 2) Gõ thêm ký tự vào PasswordInput để xem vạch đo độ mạnh; 3) Gõ vào SearchInput và bấm nút (✕) để xóa."
              usageCode='<Input label="..." error="..." /> | <PasswordInput showStrengthMeter /> | <SearchInput onClear={...} />'
            >
              <Grid cols={1} mdCols={3} gap={4}>
                <div className="space-y-2">
                  <Input
                    label="Tên phòng ăn"
                    required
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    hint="Hiển thị cho mọi thành viên trong phòng"
                    error={showInputError ? "Tên phòng này đã tồn tại!" : undefined}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowInputError((prev) => !prev)}
                  >
                    {showInputError ? "✅ Tắt thông báo lỗi" : "⚠️ Bật thử trạng thái lỗi"}
                  </Button>
                </div>

                <div>
                  <PasswordInput
                    label="Mật khẩu (Có đo độ mạnh)"
                    value={passwordVal}
                    onChange={(e) => setPasswordVal(e.target.value)}
                    showStrengthMeter
                    hint="Thử xóa bớt hoặc thêm chữ hoa, số, ký tự đặc biệt"
                  />
                </div>

                <div>
                  <SearchInput
                    label="Tìm kiếm quán ăn"
                    placeholder="Gõ tên món ăn..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onClear={() => setSearchVal("")}
                    hint={`Từ khóa hiện tại: "${searchVal || "(trống)"}"`}
                  />
                </div>
              </Grid>
            </ComponentDocCard>

            {/* 1.4 CurrencyInput & OtpInput */}
            <ComponentDocCard
              index="1.4"
              name="CurrencyInput & OtpInput"
              path="ssrc/components/ui/form/CurrencyInput.tsx · OtpInput.tsx"
              type="interactive"
              purpose="CurrencyInput tự động tách dấu chấm phần nghìn VNĐ khi nhập hóa đơn; OtpInput 6 ô hỗ trợ tự nhảy ô, phím mũi tên, Backspace và Paste."
              howToTest="Gõ số bất kỳ vào ô số tiền để xem tự động format VNĐ; gõ hoặc copy-paste chuỗi 6 số vào OtpInput."
              usageCode='<CurrencyInput value={amount} onValueChange={setAmount} /> | <OtpInput length={6} value={otp} onChange={setOtp} />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <div className="space-y-3">
                  <CurrencyInput
                    label="Tổng hóa đơn bữa ăn"
                    value={currencyVal}
                    onValueChange={setCurrencyVal}
                    placeholder="Nhập số tiền..."
                    hint={`Giá trị số thực tế (number): ${currencyVal ?? 0} VNĐ`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {[150000, 350000, 1250000].map((preset) => (
                      <Button
                        key={preset}
                        size="sm"
                        variant="secondary"
                        onClick={() => setCurrencyVal(preset)}
                      >
                        +{preset.toLocaleString("vi-VN")}đ
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[14px] font-bold text-foreground">
                    Mã xác nhận OTP / Mã phòng (6 ký tự):
                  </p>
                  <OtpInput length={6} value={otpVal} onChange={setOtpVal} />
                  <div className="flex items-center justify-between text-[13px] text-muted-foreground">
                    <span>
                      Giá trị thu được: <b className="text-primary font-mono">{otpVal || "(trống)"}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpVal("")}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      Xóa trắng OTP
                    </button>
                  </div>
                </div>
              </Grid>
            </ComponentDocCard>

            {/* 1.5 Checkbox, Switch, SegmentedControl, Slider */}
            <ComponentDocCard
              index="1.5"
              name="Checkbox · Switch · SegmentedControl · Slider"
              path="ssrc/components/ui/form/Checkbox.tsx · Switch.tsx · SegmentedControl.tsx · Slider.tsx"
              type="interactive"
              purpose="Các công tắc bật/tắt tùy chọn, thanh chuyển đổi chế độ có hiệu ứng trượt Framer Motion, và thanh kéo chọn khoảng cách/ngân sách."
              howToTest="Tích chọn Checkbox, gạt Switch, bấm đổi tab trên SegmentedControl và kéo thanh Slider để xem giá trị cập nhật tức thì."
              usageCode='<Switch checked={on} onCheckedChange={setOn} /> | <Slider min={1} max={20} value={km} onChange={setKm} />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <Stack gap={4}>
                  <Checkbox
                    label="Đồng ý chia đều hóa đơn cho cả nhóm"
                    description={`Trạng thái hiện tại: ${checkboxChecked ? "Đang bật (Checked)" : "Đang tắt (Unchecked)"}`}
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                  />
                  <Divider />
                  <Switch
                    label={`Chế độ Ăn một mình (Solo Mode): ${switchChecked ? "BẬT" : "TẮT"}`}
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                  />
                </Stack>

                <Stack gap={5}>
                  <div>
                    <p className="text-[13px] font-bold text-muted-foreground mb-2">
                      SegmentedControl (Đang chọn: <span className="text-primary">{segmentVal}</span>):
                    </p>
                    <SegmentedControl
                      layoutId="demo-part1-segment"
                      options={[
                        { label: "Chia đều", value: "equal" },
                        { label: "Chia theo món", value: "itemized" },
                        { label: "Chủ chi trả", value: "host" },
                      ]}
                      value={segmentVal}
                      onChange={setSegmentVal}
                    />
                  </div>

                  <Slider
                    label="Bán kính tìm kiếm quán ăn"
                    min={1}
                    max={15}
                    step={0.5}
                    value={sliderVal}
                    onChange={setSliderVal}
                    formatValue={(v) => `${v} km`}
                  />
                </Stack>
              </Grid>
            </ComponentDocCard>
          </section>
        )}

        {/* =====================================================================
            PHẦN 2: ssrc/components/ui/display (10 COMPONENTS)
        ===================================================================== */}
        {showPart("part2") && (
          <section className="space-y-6">
            <div className="bg-secondary/60 border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-primary">
                  PHẦN 2 / 5 · THƯ MỤC: ssrc/components/ui/display
                </span>
                <h2 className="text-[24px] md:text-[28px] font-extrabold text-foreground mt-0.5">
                  2. Nhóm Hiển Thị Dữ Liệu — Data Display (10 Components)
                </h2>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Các component trình bày thông tin người dùng, thẻ quán ăn, thống kê tài chính, mã phòng và mã QR VietQR.
                </p>
              </div>
              <Badge variant="info">10 Display Components</Badge>
            </div>

            {/* 2.1 Avatar & AvatarGroup */}
            <ComponentDocCard
              index="2.1"
              name="Avatar & AvatarGroup"
              path="ssrc/components/ui/display/Avatar.tsx · AvatarGroup.tsx"
              type="display"
              purpose="Hiển thị ảnh đại diện hoặc chữ viết tắt tên người dùng kèm chấm xanh online, vòng sáng trạng thái sẵn sàng (ring) và nhóm xếp chồng tự tính số dư (+N)."
              howToTest="Bấm nút (+/-) ở phần AvatarGroup để kiểm tra cách nhóm tự động thu gọn thành +N khi số người vượt mức max."
              usageCode='<Avatar size="lg" isOnline ring="ready" /> | <AvatarGroup users={users} max={4} />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <div>
                  <p className="text-[13px] font-bold text-muted-foreground mb-3">
                    Các kích thước (sm, md, lg, xl) & trạng thái Ring:
                  </p>
                  <div className="flex flex-wrap gap-5 items-end">
                    <Avatar initials="SM" size="sm" color="bg-blue-500" />
                    <Avatar initials="MD" size="md" color="bg-pink-500" isOnline />
                    <Avatar initials="LG" size="lg" color="bg-purple-500" isOnline ring="ready" />
                    <Avatar
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                      size="xl"
                      isOnline
                      ring="idle"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold text-muted-foreground">
                      AvatarGroup (6 thành viên, hiển thị tối đa: <b className="text-primary">{avatarGroupMax}</b>)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAvatarGroupMax((m) => Math.max(2, m - 1))}
                      >
                        Giảm max
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAvatarGroupMax((m) => Math.min(6, m + 1))}
                      >
                        Tăng max
                      </Button>
                    </div>
                  </div>
                  <AvatarGroup users={ALL_MOCK_USERS} max={avatarGroupMax} size="lg" />
                </div>
              </Grid>
            </ComponentDocCard>

            {/* 2.2 Badge & Divider */}
            <ComponentDocCard
              index="2.2"
              name="Badge & Divider"
              path="ssrc/components/ui/display/Badge.tsx · Divider.tsx"
              type="display"
              purpose="Badge dùng gắn nhãn điểm đánh giá, trạng thái sẵn sàng hoặc khoản nợ; Divider tạo đường phân cách ngang/dọc có hỗ trợ nhãn chữ ở giữa."
              howToTest="Quan sát 5 biến thể màu của Badge (kèm chấm tròn dot) và đường phân cách Divider bên dưới."
              usageCode='<Badge variant="success" dot>Sẵn sàng</Badge> | <Divider label="Hoặc" />'
            >
              <Stack gap={4}>
                <div className="flex flex-wrap gap-3 items-center">
                  <Badge variant="default">⭐ 4.8 / 5.0</Badge>
                  <Badge variant="success" dot>Sẵn sàng</Badge>
                  <Badge variant="warning" dot>Đang chọn món</Badge>
                  <Badge variant="error">Còn nợ 185.000đ</Badge>
                  <Badge variant="info">Phòng mới</Badge>
                  <Badge variant="default" size="sm">Size SM</Badge>
                </div>
                <Divider label="Đường phân cách có nhãn (Divider)" className="py-2" />
              </Stack>
            </ComponentDocCard>

            {/* 2.3 Card & StatCard */}
            <ComponentDocCard
              index="2.3"
              name="Card & StatCard"
              path="ssrc/components/ui/display/Card.tsx · StatCard.tsx"
              type="display"
              purpose="Card là khung chứa đa năng có headerAction và footer; StatCard chuyên hiển thị các con số thống kê tài chính (Được nhận, Phải trả, Tổng chi)."
              howToTest="So sánh 3 biến thể của StatCard (default, danger, dark) và Card có nút hành động ở cả Header lẫn Footer."
              usageCode='<StatCard title="Được nhận" value="342.000đ" variant="default" /> | <Card title="..." footer={...}>'
            >
              <Stack gap={5}>
                <Grid cols={1} mdCols={3} gap={4}>
                  <StatCard
                    title="Bạn được nhận"
                    value="342.000đ"
                    description="Từ 3 thành viên"
                    variant="default"
                    icon={<span>💵</span>}
                  />
                  <StatCard
                    title="Bạn phải trả"
                    value="125.000đ"
                    description="Cho Nam Minh"
                    variant="danger"
                    icon={<span>💳</span>}
                  />
                  <StatCard
                    title="Chi tiêu tháng này"
                    value="2.480.000đ"
                    description="Giảm 8% so với tháng trước"
                    variant="dark"
                    icon={<span>🔥</span>}
                  />
                </Grid>

                <Card
                  title="Thông tin phòng ăn #HNAG28"
                  description="Tạo bởi Linh Anh · 4 thành viên"
                  headerAction={<Badge variant="success" dot>Đang mở</Badge>}
                  footer={
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">Rời phòng</Button>
                      <Button variant="primary" size="sm">Bắt đầu quẹt thẻ</Button>
                    </div>
                  }
                >
                  <p className="text-[14px] text-muted-foreground">
                    Khung Card chuẩn hỗ trợ 3 biến thể (<code>default</code>, <code>highlight</code>, <code>dark</code>) và 4 mức padding (<code>none</code>, <code>sm</code>, <code>md</code>, <code>lg</code>).
                  </p>
                </Card>
              </Stack>
            </ComponentDocCard>

            {/* 2.4 PlaceCard */}
            <ComponentDocCard
              index="2.4"
              name="PlaceCard (Thẻ địa điểm ăn uống)"
              path="ssrc/components/ui/display/PlaceCard.tsx"
              type="interactive"
              purpose="Hiển thị quán ăn ở 2 chế độ: 'vertical' (dùng cho màn hình Quẹt thẻ có nút Thích/Bỏ qua) và 'horizontal' (dùng cho danh sách Khám phá)."
              howToTest="Bấm nút '✕ Bỏ qua' hoặc '❤️ Thích' trên thẻ dọc bên trái để kiểm tra callback sự kiện."
              usageCode='<PlaceCard place={place} distanceKm={1.6} layout="vertical" showActions onLike={...} onPass={...} />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <div>
                  <PlaceCard
                    place={DEMO_PLACES[0]}
                    distanceKm={DEMO_PLACES[0].distanceKm}
                    layout="vertical"
                    showActions
                    onLike={() => setPlaceFeedback("❤️ Bạn vừa THÍCH quán Lẩu Phan Thái Hà!")}
                    onPass={() => setPlaceFeedback("✕ Bạn vừa BỎ QUA quán Lẩu Phan Thái Hà.")}
                  />
                </div>

                <Stack gap={4} justify="between">
                  <div className="space-y-3">
                    <p className="text-[13px] font-bold text-muted-foreground">
                      Chế độ <code>layout="horizontal"</code> (Dùng cho danh sách gọn):
                    </p>
                    <PlaceCard
                      place={DEMO_PLACES[0]}
                      distanceKm={DEMO_PLACES[0].distanceKm}
                      layout="horizontal"
                    />
                    <PlaceCard
                      place={DEMO_PLACES[1]}
                      distanceKm={DEMO_PLACES[1].distanceKm}
                      layout="horizontal"
                    />
                  </div>

                  <Alert variant="info" title="Kết quả tương tác PlaceCard">
                    {placeFeedback}
                  </Alert>
                </Stack>
              </Grid>
            </ComponentDocCard>

            {/* 2.5 UserListItem, CopyableCode, QRCodeDisplay */}
            <ComponentDocCard
              index="2.5"
              name="UserListItem · CopyableCode · QRCodeDisplay"
              path="ssrc/components/ui/display/UserListItem.tsx · CopyableCode.tsx · QRCodeDisplay.tsx"
              type="interactive"
              purpose="UserListItem hiển thị dòng thành viên/giao dịch; CopyableCode sao chép nhanh mã phòng; QRCodeDisplay hiển thị mã VietQR kèm trạng thái tải và báo lỗi."
              howToTest="1) Bấm vào mã phòng HNAG28 để copy; 2) Bấm nút 'Giả lập Đang tải' hoặc 'Giả lập Lỗi ảnh QR' để xem fallback của QRCodeDisplay."
              usageCode='<UserListItem title="..." isOnline isReady action={...} /> | <CopyableCode code="HNAG28" /> | <QRCodeDisplay amount={150000} ... />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <Stack gap={4}>
                  <div className="bg-muted/50 p-4 rounded-2xl border border-border space-y-2">
                    <p className="text-[12px] font-bold uppercase text-muted-foreground">
                      UserListItem (Trong phòng chờ & Hóa đơn)
                    </p>
                    <ListItem
                      title="Linh Anh"
                      subtitle="Chủ phòng · Đã chọn khẩu vị"
                      avatarColor="bg-purple-500"
                      isOnline
                      isReady={true}
                      action={<Badge variant="success">Sẵn sàng</Badge>}
                    />
                    <Divider />
                    <ListItem
                      title="Nam Minh"
                      subtitle="Cần thanh toán bữa Lẩu Phan"
                      avatarColor="bg-blue-500"
                      isOnline
                      isReady={false}
                      action={<span className="font-bold text-primary">+150.000đ</span>}
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-2xl border border-border flex flex-col items-center">
                    <CopyableCode code="HNAG28" label="Bấm vào mã phòng bên dưới để sao chép" />
                  </div>
                </Stack>

                <Stack gap={3} align="center">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      size="sm"
                      variant={qrLoading ? "primary" : "secondary"}
                      onClick={() => {
                        setQrLoading((l) => !l)
                        setQrError(false)
                      }}
                    >
                      {qrLoading ? "Tắt Loading QR" : "Giả lập Đang tải QR"}
                    </Button>
                    <Button
                      size="sm"
                      variant={qrError ? "danger" : "secondary"}
                      onClick={() => {
                        setQrError((e) => !e)
                        setQrLoading(false)
                      }}
                    >
                      {qrError ? "Tắt Lỗi QR" : "Giả lập Lỗi ảnh QR"}
                    </Button>
                  </div>

                  <QRCodeDisplay
                    className="w-full"
                    loading={qrLoading}
                    hasError={qrError}
                    qrSrc="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=HomNayAnGi_150000"
                    amount={150000}
                    receiverName="NGUYEN LINH ANH"
                    bankName="Techcombank"
                    accountNo="19031234567890"
                    note="Chia tien an trua Lau Phan"
                  />
                </Stack>
              </Grid>
            </ComponentDocCard>
          </section>
        )}

        {/* =====================================================================
            PHẦN 3: ssrc/components/ui/feedback (8 COMPONENTS)
        ===================================================================== */}
        {showPart("part3") && (
          <section className="space-y-6">
            <div className="bg-secondary/60 border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-primary">
                  PHẦN 3 / 5 · THƯ MỤC: ssrc/components/ui/feedback
                </span>
                <h2 className="text-[24px] md:text-[28px] font-extrabold text-foreground mt-0.5">
                  3. Nhóm Phản Hồi & Trạng Thái — Feedback (8 Components)
                </h2>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Các component thông báo, tiến trình từng bước, hộp thoại Modal, Toast nổi và trạng thái tải / trống dữ liệu.
                </p>
              </div>
              <Badge variant="warning">8 Feedback Components</Badge>
            </div>

            {/* 3.1 Spinner, ProgressBar, Stepper */}
            <ComponentDocCard
              index="3.1"
              name="Spinner · ProgressBar · Stepper"
              path="ssrc/components/ui/feedback/Spinner.tsx · ProgressBar.tsx · Stepper.tsx"
              type="interactive"
              purpose="Biểu thị tiến độ tải (Spinner), phần trăm thành viên sẵn sàng (ProgressBar), và các bước trong quy trình tạo phòng / thanh toán (Stepper)."
              howToTest="Bấm các nút (+/- 25%) để xem ProgressBar chạy mượt; bấm 'Bước trước / Bước tiếp' để kiểm tra Stepper."
              usageCode='<ProgressBar value={75} label="..." /> | <Stepper steps={["Bước 1", "Bước 2"]} current={1} />'
            >
              <Stack gap={6}>
                <div className="flex flex-wrap items-center gap-6">
                  <span className="text-[13px] font-bold text-muted-foreground">Spinner (sm, md, lg):</span>
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>

                <Divider />

                <div className="space-y-3">
                  <ProgressBar
                    value={progressVal}
                    label="Tiến độ thành viên sẵn sàng trong phòng"
                    color={progressVal === 100 ? "bg-green-500" : "bg-[#f05a32]"}
                    animated={progressVal === 100}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setProgressVal((v) => Math.max(0, v - 25))}>
                      -25%
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setProgressVal((v) => Math.min(100, v + 25))}>
                      +25%
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => setProgressVal(100)}>
                      Đạt 100% (Match!)
                    </Button>
                  </div>
                </div>

                <Divider />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-muted-foreground">
                      Stepper (Đang ở bước {stepperCurrent + 1} / 4):
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={stepperCurrent === 0}
                        onClick={() => setStepperCurrent((c) => Math.max(0, c - 1))}
                      >
                        ◀ Bước trước
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={stepperCurrent === 3}
                        onClick={() => setStepperCurrent((c) => Math.min(3, c + 1))}
                      >
                        Bước tiếp theo ▶
                      </Button>
                    </div>
                  </div>
                  <div className="px-4 pt-2">
                    <Stepper
                      steps={["Tạo phòng", "Mời bạn bè", "Quẹt thẻ", "Chốt quán"]}
                      current={stepperCurrent}
                    />
                  </div>
                </div>
              </Stack>
            </ComponentDocCard>

            {/* 3.2 Alert, Skeleton, EmptyState */}
            <ComponentDocCard
              index="3.2"
              name="Alert · Skeleton · EmptyState"
              path="ssrc/components/ui/feedback/Alert.tsx · Skeleton.tsx · EmptyState.tsx"
              type="interactive"
              purpose="Alert hiển thị cảnh báo/nhắc nợ; Skeleton giữ chỗ khi đang tải API; EmptyState hiển thị khi danh sách trống."
              howToTest="Bấm nút 'Chuyển đổi Skeleton ↔ Dữ liệu thật' để xem cách Skeleton giữ khung giao diện."
              usageCode='<Alert variant="warning" title="..." action={...} /> | <Skeleton variant="rect" /> | <EmptyState title="..." />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <Stack gap={3}>
                  <Alert variant="info" title="Thông tin phòng">
                    Mã phòng sẽ tự động hết hạn sau 24 phút không hoạt động.
                  </Alert>
                  <Alert variant="success" title="Thanh toán hoàn tất">
                    Bạn đã chuyển khoản 150.000đ cho Linh Anh.
                  </Alert>
                  <Alert
                    variant="warning"
                    title="Chưa bật định vị GPS"
                    action={<Button size="sm" variant="secondary">Bật ngay</Button>}
                  >
                    Hãy cấp quyền vị trí để tìm quán trong bán kính 2km.
                  </Alert>
                  <Alert variant="error" title="Mã phòng không hợp lệ">
                    Không tìm thấy phòng ăn với mã vừa nhập.
                  </Alert>
                </Stack>

                <Stack gap={4}>
                  <div className="p-4 rounded-2xl border border-border bg-muted/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-foreground">
                        Kiểm thử Skeleton Loading:
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsSkeletonLoading((s) => !s)}
                      >
                        {isSkeletonLoading ? "Hiện dữ liệu thật" : "Bật lại Skeleton"}
                      </Button>
                    </div>

                    {isSkeletonLoading ? (
                      <div className="flex items-center gap-3 py-2">
                        <Skeleton variant="circle" className="size-12 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </div>
                      </div>
                    ) : (
                      <ListItem
                        title="Bún Chả Hương Liên"
                        subtitle="Cách bạn 0.8km · Đánh giá 4.8⭐"
                        avatarColor="bg-[#f05a32]"
                      />
                    )}
                  </div>

                  <EmptyState
                    size="sm"
                    icon="📭"
                    title="Chưa có bạn bè nào trong phòng"
                    description="Hãy gửi mã phòng để rủ hội bạn cùng vào quẹt thẻ chọn quán nhé!"
                    action={<Button size="sm">Sao chép mã mời</Button>}
                  />
                </Stack>
              </Grid>
            </ComponentDocCard>

            {/* 3.3 Modal & Toast */}
            <ComponentDocCard
              index="3.3"
              name="Modal & Toast"
              path="ssrc/components/ui/feedback/Modal.tsx · Toast.tsx"
              type="interactive"
              purpose="Modal hiển thị hộp thoại xác nhận qua React Portal (hỗ trợ phím Escape và khóa cuộn nền); Toast thông báo nhanh kết quả thao tác."
              howToTest="Bấm chọn kích thước để mở Modal (thử bấm phím ESC hoặc nền mờ để đóng); bấm 4 nút màu bên phải để đổi loại Toast."
              usageCode='<Modal isOpen={open} onClose={...} title="..." footer={...}> | <Toast message="..." type="success" isVisible={...} />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <div className="space-y-3">
                  <p className="text-[13px] font-bold text-muted-foreground">
                    Mở thử Modal theo 3 kích thước (sm, md, lg):
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {(["sm", "md", "lg"] as const).map((sz) => (
                      <Button
                        key={sz}
                        variant="primary"
                        onClick={() => {
                          setModalSize(sz)
                          setIsModalOpen(true)
                        }}
                      >
                        Mở Modal ({sz.toUpperCase()})
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[13px] font-bold text-muted-foreground">
                    Bấm đổi 4 trạng thái của Toast Notification:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setToastState({ visible: true, type: "success", message: "Đã sao chép mã phòng thành công!" })
                      }
                    >
                      ✅ Success
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setToastState({ visible: true, type: "info", message: "Nam Minh vừa tham gia phòng ăn." })
                      }
                    >
                      ℹ️ Info
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setToastState({ visible: true, type: "warning", message: "Phòng sẽ đóng sau 5 phút nữa." })
                      }
                    >
                      ⚠️ Warning
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setToastState({ visible: true, type: "error", message: "Kết nối mạng bị gián đoạn!" })
                      }
                    >
                      ❌ Error
                    </Button>
                  </div>

                  <div className="min-h-[56px] pt-1">
                    <Toast
                      isVisible={toastState.visible}
                      type={toastState.type}
                      message={toastState.message}
                      onClose={() => setToastState((prev) => ({ ...prev, visible: false }))}
                    />
                  </div>
                </div>
              </Grid>
            </ComponentDocCard>
          </section>
        )}

        {/* =====================================================================
            PHẦN 4: ssrc/components/ui/effects (2 COMPONENTS)
        ===================================================================== */}
        {showPart("part4") && (
          <section className="space-y-6">
            <div className="bg-secondary/60 border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-primary">
                  PHẦN 4 / 5 · THƯ MỤC: ssrc/components/ui/effects
                </span>
                <h2 className="text-[24px] md:text-[28px] font-extrabold text-foreground mt-0.5">
                  4. Nhóm Hiệu Ứng Tương Tác — Effects (2 Components)
                </h2>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Đã được kiểm định và nâng cấp cơ chế quản lý hạt (particle lifecycle): hỗ trợ bấm liên hoàn (spam click) mượt mà, không ngắt quãng và tự dọn sạch DOM.
                </p>
              </div>
              <Badge variant="default">2 Effects Components</Badge>
            </div>

            <ComponentDocCard
              index="4.1"
              name="Confetti (Pháo hoa) & FloatingHearts (Thả tim bay)"
              path="ssrc/components/ui/effects/Confetti.tsx · FloatingHearts.tsx"
              type="interactive"
              purpose="Confetti tung hoa giấy ăn mừng khi cả nhóm Match quán ăn hoặc hoàn tất chia tiền; FloatingHearts tạo hiệu ứng tim bay lên khi bấm yêu thích quán."
              howToTest="Hãy bấm LIÊN TỤC (spam click) vào cả 2 nút bên dưới để kiểm chứng: các đợt pháo hoa và trái tim xếp chồng mượt mà, không bị cắt ngang hay đơ máy."
              usageCode='<Confetti trigger={confettiCount} /> | <FloatingHearts trigger={heartCount} count={5} />'
            >
              <Grid cols={1} mdCols={2} gap={6}>
                <div className="p-6 rounded-2xl bg-muted/50 border border-border flex flex-col items-center text-center gap-4">
                  <div className="text-4xl">🎉</div>
                  <div>
                    <h4 className="font-bold text-[16px] text-foreground">
                      Confetti (Đã kích hoạt: {confettiTrigger} lần)
                    </h4>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      Bấm liên tiếp nhiều lần để bắn bồi thêm các đợt pháo hoa mới mà không làm biến mất đợt đang rơi.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => setConfettiTrigger((c) => c + 1)}
                  >
                    🎉 Bấm tung hoa giấy (Spam Click Test)
                  </Button>
                </div>

                <div className="p-6 rounded-2xl bg-muted/50 border border-border flex flex-col items-center text-center gap-4">
                  <div className="relative inline-flex items-center justify-center mt-2">
                    <Button
                      size="lg"
                      variant="danger"
                      onClick={() => setHeartTrigger((c) => c + 1)}
                    >
                      ❤️ Bấm thả tim liên hoàn ({heartTrigger})
                    </Button>
                    <FloatingHearts trigger={heartTrigger} count={heartBatchCount} />
                  </div>

                  <div className="w-full max-w-xs">
                    <Slider
                      label="Số lượng tim mỗi lần bấm"
                      min={1}
                      max={10}
                      value={heartBatchCount}
                      onChange={setHeartBatchCount}
                      formatValue={(v) => `${v} tim / click`}
                    />
                  </div>
                </div>
              </Grid>
            </ComponentDocCard>
          </section>
        )}

        {/* =====================================================================
            PHẦN 5: ssrc/components/layout (8 COMPONENTS)
        ===================================================================== */}
        {showPart("part5") && (
          <section className="space-y-6">
            <div className="bg-secondary/60 border border-border rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-primary">
                  PHẦN 5 / 5 · THƯ MỤC: ssrc/components/layout
                </span>
                <h2 className="text-[24px] md:text-[28px] font-extrabold text-foreground mt-0.5">
                  5. Nhóm Bố Cục & Khung Trang — Dumb Layouts (8 Components)
                </h2>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Bộ khung bố cục 100% Dumb Component rút trích từ các màn hình tham khảo trong <code>/src</code>, sẵn sàng lắp ghép mọi trang của ứng dụng.
                </p>
              </div>
              <Badge variant="success">8 Layout Components</Badge>
            </div>

            {/* 5.1 Stack, Grid, PageContainer, PageHeader, PageSection, SplitView */}
            <ComponentDocCard
              index="5.1"
              name="PageContainer · PageHeader · PageSection · SplitView · Grid · Stack"
              path="ssrc/components/layout/PageContainer.tsx · PageHeader.tsx · PageSection.tsx · SplitView.tsx"
              type="layout"
              purpose="Chuẩn hóa khung bao trang, tiêu đề trang (overline + title + action), các khối nội dung (surface / flat / dark) và bố cục chia 2 cột responsive."
              howToTest="Bấm chuyển đổi 3 tỷ lệ chia cột của SplitView ('sidebar-left', 'equal', 'sidebar-right') để xem bố cục tự động thích ứng."
              usageCode='<PageContainer><PageHeader ... /><SplitView ratio="sidebar-left" left={...} right={...} /></PageContainer>'
            >
              <Stack gap={4}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] font-bold text-muted-foreground">
                    Thử đổi tỷ lệ <code>SplitView</code>:
                  </span>
                  <SegmentedControl
                    layoutId="split-ratio-demo"
                    className="w-full sm:w-[420px]"
                    options={[
                      { label: "sidebar-left (Lobby)", value: "sidebar-left" },
                      { label: "equal (50 / 50)", value: "equal" },
                      { label: "sidebar-right (Billing)", value: "sidebar-right" },
                    ]}
                    value={splitRatio}
                    onChange={(v) => setSplitRatio(v as "equal" | "sidebar-left" | "sidebar-right")}
                  />
                </div>

                <PageContainer className="rounded-3xl border border-border">
                  <PageHeader
                    overline="Ví dụ bố cục trang thực tế"
                    title="Phòng ăn trưa #HNAG28"
                    subtitle="Kết hợp PageContainer + PageHeader + SplitView + PageSection"
                    action={<Button size="sm">Bắt đầu quẹt</Button>}
                  />

                  <SplitView
                    ratio={splitRatio}
                    left={
                      <PageSection
                        variant="dark"
                        title="Khối Dark Variant"
                        subtitle="Dùng cho thẻ Mã phòng hoặc Radar ghép hội"
                      >
                        <Stack gap={3}>
                          <CopyableCode code="HNAG28" />
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="default">🍲 Lẩu nướng</Badge>
                            <Badge variant="default">📍 ≤ 2 km</Badge>
                          </div>
                        </Stack>
                      </PageSection>
                    }
                    right={
                      <PageSection
                        variant="surface"
                        title="Khối Surface Variant"
                        subtitle="Dùng cho danh sách thành viên hoặc lịch sử giao dịch"
                        action={<Badge variant="success" dot>3/4 sẵn sàng</Badge>}
                      >
                        <Stack gap={3}>
                          <ListItem
                            title="Linh Anh"
                            subtitle="Host · Đã sẵn sàng"
                            avatarColor="bg-purple-500"
                            isReady={true}
                          />
                          <Divider />
                          <ListItem
                            title="Nam Minh"
                            subtitle="Thành viên · Đã sẵn sàng"
                            avatarColor="bg-blue-500"
                            isReady={true}
                          />
                        </Stack>
                      </PageSection>
                    }
                  />
                </PageContainer>
              </Stack>
            </ComponentDocCard>

            {/* 5.2 MainLayout */}
            <ComponentDocCard
              index="5.2"
              name="MainLayout (Khung ứng dụng chính: Desktop Sidebar + Mobile BottomNav)"
              path="ssrc/components/layout/MainLayout.tsx"
              type="layout"
              purpose="Khung điều hướng tổng của ứng dụng sau khi đăng nhập. Tự động hiển thị Sidebar bên trái trên màn hình lớn và thanh BottomNav ở màn hình di động."
              howToTest="Bấm vào các mục menu bên trái (hoặc thu nhỏ trình duyệt để thấy thanh điều hướng dưới đáy) để chuyển đổi nội dung trang bên trong."
              usageCode='<MainLayout navItems={items} activeKey={tab} onSelectNav={setTab} userProfile={...}>{children}</MainLayout>'
            >
              <MainLayout
                embedded
                navItems={DEMO_NAV_ITEMS}
                activeKey={activeNav}
                onSelectNav={setActiveNav}
                sidebarPromo={
                  <div className="bg-[#3a2c26] text-white rounded-2xl p-4">
                    <h4 className="font-bold text-[14px] mb-1">Kéo hội đi ăn 🍜</h4>
                    <p className="text-[12px] text-white/70">
                      Mời bạn bè online và chốt quán trong vài phút.
                    </p>
                  </div>
                }
                userProfile={{
                  name: "Linh Anh",
                  subtitle: "Tín đồ ăn ngon",
                  color: "bg-purple-500",
                }}
                onLogout={() => alert("Đã bấm nút Đăng xuất trên MainLayout!")}
              >
                <PageContainer>
                  <PageHeader
                    overline="Kiểm thử điều hướng MainLayout"
                    title={`Màn hình: ${DEMO_NAV_ITEMS.find((i) => i.key === activeNav)?.label}`}
                    subtitle="MainLayout nhận danh sách navItems qua props, hoàn toàn tách biệt khỏi router cứng."
                  />
                  <Grid cols={1} mdCols={3} gap={4}>
                    <StatCard title="Mình nợ" value="185.000đ" description="2 khoản chờ chuyển" variant="danger" />
                    <StatCard title="Được nhận" value="342.000đ" description="3 người chưa hoàn tất" variant="default" />
                    <StatCard title="Chi tháng này" value="2.480.000đ" description="↓ 8% so với tháng trước" variant="dark" />
                  </Grid>
                </PageContainer>
              </MainLayout>
            </ComponentDocCard>

            {/* 5.3 AuthLayout */}
            <ComponentDocCard
              index="5.3"
              name="AuthLayout (Khung trang Đăng nhập / Đăng ký / OTP)"
              path="ssrc/components/layout/AuthLayout.tsx"
              type="layout"
              purpose="Khung thẻ căn giữa màn hình kèm logo thương hiệu, tiêu đề, phụ đề và khu vực chân trang cho toàn bộ luồng xác thực người dùng."
              howToTest="Điền thử thông tin vào form mẫu đặt bên trong AuthLayout."
              usageCode='<AuthLayout title="Chào mừng trở lại" subtitle="..." footer={...}>{form}</AuthLayout>'
            >
              <AuthLayout
                embedded
                title="Chào mừng trở lại"
                subtitle="Đăng nhập để cùng hội bạn quẹt thẻ chọn quán"
                footer={
                  <span>
                    Chưa có tài khoản?{" "}
                    <span className="font-bold text-primary cursor-pointer hover:underline">
                      Đăng ký ngay
                    </span>
                  </span>
                }
              >
                <Stack gap={4}>
                  <Input label="Email" type="email" defaultValue="linhanh@example.com" required />
                  <PasswordInput label="Mật khẩu" defaultValue="12345678" required />
                  <Button fullWidth size="lg">
                    Đăng nhập
                  </Button>
                </Stack>
              </AuthLayout>
            </ComponentDocCard>
          </section>
        )}
      </main>

      {/* Modal thực tế khi mở từ Phần 3 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size={modalSize}
        title={`Hộp thoại Modal (Kích thước: ${modalSize.toUpperCase()})`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false)
                setConfettiTrigger((c) => c + 1)
              }}
            >
              Xác nhận & Bắn pháo hoa 🎉
            </Button>
          </div>
        }
      >
        <Stack gap={3}>
          <p className="text-[14px] text-muted-foreground">
            Modal này được render qua <code>createPortal</code> ra ngoài <code>document.body</code>, tự động khóa cuộn trang nền và lắng nghe phím <b>Escape</b>.
          </p>
          <CopyableCode code="HNAG28" label="Mã mời vào phòng ăn" />
        </Stack>
      </Modal>
    </div>
  )
}
