import { useState } from 'react'
import { Button, Badge, Avatar, Spinner } from "./components/index.ts";
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
      </div>
    </div>
  )
}

export default App