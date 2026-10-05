import { useState } from 'react'
import { Button, Badge, Avatar, Spinner, Card, PlaceCard, ListItem, Tag, Modal, Toast, EmptyState, ProgressBar } from "./components/index.ts";
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#fff8f1] min-h-screen text-[#261b17] font-sans">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-[#eadfd8]">
        {/* Header */}
        <div className="border-b border-[#eadfd8] pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#f05a32]">
            Cấu trúc và ví dụ sử dụng các component UI cơ bản trong React + TypeScript
          </h1>
        </div>
        {/* 1. BUTTON */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#261b17]">1. Button Component</h2>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary">Primary (Chính)</Button>
            <Button variant="secondary">Secondary (Phụ)</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger (Xóa/Hủy)</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center pt-2">
            <Button size="sm">Size SM</Button>
            <Button size="md">Size MD</Button>
            <Button size="lg">Size LG</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center pt-2">
            <Button 
              loading={isLoading} 
              onClick={() => {
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), 2000)
              }}
            >
              {isLoading ? "Đang xử lý..." : "Bấm để test Loading"}
            </Button>
            <Button disabled>Nút Disabled</Button>
          </div>
        </section>
        {/* 2. BADGE */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#261b17]">2. Badge Component</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">⭐ 4.7 / 5.0</Badge>
            <Badge variant="success">Online</Badge>
            <Badge variant="warning">Chờ xác nhận</Badge>
            <Badge variant="error">Còn nợ 185.000đ</Badge>
            <Badge variant="info">Món mới</Badge>
          </div>
        </section>
        {/* 3. AVATAR */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#261b17]">3. Avatar Component</h2>
          <div className="flex flex-wrap gap-6 items-end">
            <div className="text-center">
              <Avatar initials="NM" size="sm" color="bg-blue-500" />
              <p className="text-xs text-gray-500 mt-1">SM</p>
            </div>
            
            <div className="text-center">
              <Avatar initials="TH" size="md" color="bg-pink-500" isOnline />
              <p className="text-xs text-gray-500 mt-1">MD (Online)</p>
            </div>
            
            <div className="text-center">
              <Avatar initials="QD" size="lg" color="bg-emerald-500" isOnline />
              <p className="text-xs text-gray-500 mt-1">LG (Online)</p>
            </div>
            <div className="text-center">
              <Avatar 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                size="lg" 
                isOnline 
              />
              <p className="text-xs text-gray-500 mt-1">Ảnh thật</p>
            </div>
          </div>
        </section>
        {/* 4. SPINNER */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#261b17]">4. Spinner Component</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <div className="bg-[#261b17] p-3 rounded-xl flex items-center gap-2 text-white text-xs">
              <Spinner size="sm" color="white" />
              <span>Đang kết nối WebSocket...</span>
            </div>
          </div>
        </section>

        {/* 5. Card */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">5. Card</h2>
          <Card 
            title="Thông tin phòng" 
            description="Mã phòng: ABC123"
            footer={<div className="flex justify-end"><Button variant="ghost" size="sm">Rời phòng</Button></div>}
          >
            <p className="text-[#756761]">Nội dung bên trong card. Bạn có thể chèn bất kỳ nội dung nào vào đây.</p>
          </Card>
        </section>

        {/* 6. PlaceCard */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">6. PlaceCard</h2>
          <div className="max-w-sm">
            <PlaceCard 
              place={{
                id: "1",
                name: "Lẩu Phan",
                category: "Lẩu",
                price_range: 2,
                image_url: "https://images.unsplash.com/photo-1582295528072-4d1d916cc691?auto=format&fit=crop&q=80&w=600",
                address: "Thái Hà",
                latitude: 0,
                longitude: 0,
                rating: 4.7
              }}
              showActions
              onLike={() => alert("Đã thả tim!")}
              onPass={() => alert("Đã bỏ qua!")}
            />
          </div>
        </section>

        {/* 7. ListItem */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">7. ListItem </h2>
          <div className="bg-white p-4 rounded-2xl border border-[#eadfd8] space-y-4">
            
            {/* Dùng cho mảng Social (Phòng chờ) */}
            <div>
              <p className="text-xs font-bold text-[#756761] uppercase tracking-wider mb-2">Bạn Bè (Friend List)</p>
              <ListItem 
                title="Linh Anh"
                subtitle="Chủ phòng"
                isOnline
                isReady={true}
                avatarColor="bg-purple-500"
              />
              <div className="h-px bg-[#eadfd8] w-full my-2" />
              <ListItem 
                title="Nam Minh"
                subtitle="Đang thèm đồ nướng"
                isOnline
                isReady={false}
                action={<Button size="sm" variant="secondary">Mời</Button>}
              />
            </div>

            {/* Dùng cho mảng Billing (Hóa đơn) */}
            <div className="bg-[#fff8f1] p-3 rounded-xl border border-[#eadfd8]">
              <p className="text-xs font-bold text-[#f05a32] uppercase tracking-wider mb-2">Chia Tiền (Bill Split)</p>
              <ListItem 
                title="Lẩu Phan Thái Hà"
                subtitle="29 tháng 9 · 4 người"
                avatarColor="bg-[#f05a32]"
                avatarInitials="LP"
                action={<span className="font-bold text-[#261b17]">+185.000đ</span>}
              />
              <div className="h-px bg-[#eadfd8] w-full my-2" />
              <ListItem 
                title="Bún chả Hương Liên"
                subtitle="Đã thanh toán · 2 người"
                avatarColor="bg-green-600"
                avatarInitials="BC"
                action={<span className="font-bold text-green-600">Đã xong</span>}
              />
            </div>

          </div>
        </section>

        {/* 8. Tag */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">8. Tag</h2>
          <div className="flex flex-wrap gap-3">
            <Tag label="Lẩu" emoji="🍲" selected />
            <Tag label="Nướng" emoji="🔥" />
            <Tag label="Món Hàn" emoji="🍱" />
            <Tag label="Trà sữa" emoji="🧋" selected />
            <Tag label="Gần đây" />
          </div>
        </section>

        {/* 9. Modal */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">9. Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>Mở Modal Test</Button>
          
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mời bạn bè">
            <div className="space-y-4">
              <p className="text-[#756761] text-[15px]">Bạn có muốn gửi lời mời vào phòng ABC123 tới các bạn bè đang online không?</p>
              <div className="flex gap-3 justify-end pt-4 mt-4 border-t border-[#eadfd8]">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button onClick={() => setIsModalOpen(false)}>Gửi lời mời ngay</Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* 10. Toast */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">10. Toast</h2>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowToast(!showToast)}>
              {showToast ? 'Ẩn Toast' : 'Hiện Toast Notification'}
            </Button>
          </div>
          <div className="h-16 relative">
            <Toast 
              message="Đã copy mã phòng thành công!" 
              type="success" 
              isVisible={showToast} 
              onClose={() => setShowToast(false)} 
              className="absolute top-0 left-0"
            />
          </div>
        </section>

        {/* 11. EmptyState */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">11. EmptyState</h2>
          <EmptyState 
            title="Chưa có bạn bè nào online"
            description="Hãy gửi mã phòng để rủ bạn bè vào quẹt thẻ chọn quán ngay nhé!"
            icon="📭"
            action={<Button>Copy mã phòng</Button>}
          />
        </section>

        {/* 12. ProgressBar */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-[#eadfd8] pb-2">12. ProgressBar</h2>
          <div className="space-y-6">
            <ProgressBar value={75} label="Tiến độ chốt quán (3/4 người đã xong)" />
            <ProgressBar value={100} label="Đã Match!" color="bg-green-500" animated />
          </div>
        </section>

      </div>
    </div>
  )
}

export default App