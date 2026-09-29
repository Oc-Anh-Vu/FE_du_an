# GIỚI THIỆU DỰ ÁN
Tên dự án: "Hôm nay ăn gì"
Mô tả: Ứng dụng hỗ trợ nhóm bạn quyết định địa điểm ăn uống thông qua cơ chế "quẹt thẻ" (Tinder-like) và quản lý chia tiền, nhắc nợ sau bữa ăn.

# 1. TECH STACK (CÔNG NGHỆ SỬ DỤNG)
AI bắt buộc phải tuân thủ nghiêm ngặt các công nghệ sau khi viết code:

## Frontend (React + TypeScript)
- **Core:** React, TypeScript, Vite.
- **UI/Styling:** Tailwind CSS.
- **Animation:** framer-motion (đặc biệt cho hiệu ứng quẹt thẻ).
- **Realtime:** SockJS + STOMP và Zustand

## Backend (Java Spring Boot)
- **Core:** Java Spring Boot.
- **Kiến trúc:** Phân lớp chuẩn (Controller - Service - Repository).
- **Database Access:** Spring Data JPA (Hibernate).
- **Realtime:** Spring WebSocket kết hợp STOMP.
- **Security:** Spring Security, JWT (JwtTokenProvider).

## Database & Caching
- **RDBMS:** PostgreSQL (Hỗ trợ PostGIS/Haversine để tính khoảng cách tọa độ).
- **Caching/Queue:** Redis (Bắt buộc dùng cho Hàng đợi ghép phòng ngẫu nhiên - Matchmaking Queue).

---

# 2. CODING CONVENTION & QUY TẮC NGHIỆP VỤ (RULES)

## Quy tắc Frontend
1. **Phân tách Component:** Tách biệt rõ ràng giữa "Dumb Components" (Nút bấm, Modal tái sử dụng) đặt ở thư mục `src/components/` và "Smart Components" (chứa logic nghiệp vụ) đặt ở `src/features/`.
2. **Đóng gói Logic (Custom Hooks):** Mọi logic gọi API, xử lý Socket, tọa độ GPS phải được đưa vào Custom Hooks (vd: `useAuth`, `useSocket`, `useGeolocation`) ở thư mục `src/hooks/`.
3. **Chống Spam (Debounce):** Khi thao tác quẹt thẻ (FramerCard), bắt buộc phải đi qua hook `useDebounce` (~300ms) để tránh spam API.
4. **Quản lý WebSocket:** Chỉ gọi kết nối STOMP duy nhất tại `useSocket.ts`. Lắng nghe (subscribe) và phản hồi thay đổi state (broadcast) để render animation thời gian thực (pháo hoa, thả tim).

## Quy tắc Backend
1. **Kiến trúc phân lớp:** Controller chỉ nhận Request/Response. Mọi logic tính toán (tỷ lệ Like, chia tiền) phải nằm ở Service.
2. **Xử lý Race Condition (Rất Quan Trọng):** Trong luồng "Quẹt thẻ", khi nhiều user quẹt cùng 1 phần nghìn giây, bắt buộc phải dùng cơ chế Khóa (Pessimistic Locking trong Spring Data JPA) hoặc Redis Distributed Lock tại hàm kiểm tra Match để chống sai lệch dữ liệu.
3. **Matchmaking Worker:** Không dùng PostgreSQL để lưu danh sách tìm phòng ngẫu nhiên. Phải dùng Redis trên RAM và có một Background Task liên tục quét Hàng đợi.
4. **Primary Key:** Mọi ID trong Database đều phải dùng định dạng UUID (`uuid-generate_v4()`).

---

# 3. LUỒNG HOẠT ĐỘNG CỐT LÕI (CORE FLOWS)
Khi implement tính năng, AI cần bám sát các luồng sau:
1. **Luồng Quẹt Thẻ (Realtime):** User vuốt thẻ -> Gửi STOMP `/app/room/{room_code}/swipe` -> Backend lưu DB (`swipes`) -> Kiểm tra điều kiện (nếu 100% like) -> Broadcast STOMP báo kết quả (Chưa đủ hoặc Match) -> Frontend render Animation/MatchResult.
2. **Luồng Chia Tiền (Billing):** 
   - Cơ chế 1 (Chi tiết): Nhập menu -> User tự tick món đã ăn -> Hệ thống chia tiền món chung và cộng dồn.
   - Cơ chế 2 (Nhập tay): Nhập tổng bill -> Gõ tiền từng người -> Validate tổng cá nhân = tổng bill mới cho đi tiếp.
3. **Luồng Ghép Phòng (Tag-based):** Chọn tag -> Đẩy vào Redis Queue -> Background Worker quét 2-4 người trùng tag -> Tự tạo phòng & ép vào phòng quẹt thẻ.

---

# 4. CẤU TRÚC THƯ MỤC CHUẨN

## FRONTEND (`hom-nay-an-gi-frontend/`)
```text
src/
 ┣ assets/                 # Ảnh tĩnh, icon, Lottie
 ┣ components/             # Dumb Components (Button.tsx, Avatar.tsx, QRCodeDisplay.tsx...)
 ┣ features/               # SMART COMPONENTS
 ┃ ┣ auth/                 # LoginForm.tsx, LocationPrompt.tsx
 ┃ ┣ social/               # FriendList.tsx, InvitePopup.tsx
 ┃ ┣ matchmaking/          # TagSelector.tsx, RadarQueue.tsx
 ┃ ┣ room/                 # RoomLobby.tsx, MemberGrid.tsx
 ┃ ┣ swipe/                # SwipeDeck.tsx, FramerCard.tsx, MatchResult.tsx
 ┃ ┗ billing/              # ItemizedOrder.tsx, ManualSplit.tsx, DebtWidget.tsx
 ┣ hooks/                  # useAuth.ts, useSocket.ts, useGeolocation.ts, useDebounce.ts
 ┣ pages/                  # HomePage.tsx, ExplorePage.tsx, RoomProcessPage.tsx...
 ┣ services/               # apiClient.ts (Axios), socketClient.ts (STOMP)
 ┣ store/                  # userStore.ts, roomStore.ts
 ┗ utils/                  # geoCalculator.ts, currencyFormat.ts
```

## BACKEND (`hom-nay-an-gi-backend/`)
```text
src/main/java/com/utt/homnayangi/
 ┣ config/                 # SecurityConfig.java, WebSocketConfig.java, RedisConfig.java...
 ┣ controller/
 ┃ ┣ api/                  # AuthController, FriendController, PlaceController...
 ┃ ┗ ws/                   # RoomSocket.java, PresenceSocket.java
 ┣ service/                # AuthService, RoomService, SwipeMatchService, BillingService, MatchmakingWorker...
 ┣ repository/             # UserRepository, PlaceRepository, ExpenseItemRepo...
 ┃ ┗ redis/                # QueueRepository.java
 ┣ model/
 ┃ ┣ entity/               # Map 1-1 với DB
 ┃ ┣ dto/                  # Data Transfer Objects
 ┃ ┗ enums/                # RoomStatus, FriendStatus
 ┣ security/               # JwtTokenProvider, JwtAuthenticationFilter
 ┗ exception/              # GlobalExceptionHandler.java
```

# 5. CẤU TRÚC DATABASE (12 BẢNG)
AI cần tham chiếu các bảng sau khi viết Query hoặc định nghĩa Entity:

1. **users** (id, username, email, password_hash, avatar_url)
2. **friendships** (requester_id, addressee_id, status)
3. **tags** (id, tag_name)
4. **user_tags** (user_id, tag_id, is_temporary)
5. **places** (id, name, category, price_range, latitude, longitude)
6. **rooms** (id, room_code, host_id, status, matched_place_id)
7. **room_members** (room_id, user_id, is_ready)
8. **swipes** (id, room_id, user_id, place_id, is_like)
9. **expenses** (id, room_id, payer_id, total_amount)
10. **expense_items** (id, expense_id, item_name, price)
11. **item_sharers** (item_id, user_id)
12. **expense_splits** (expense_id, user_id, amount_owed, is_paid)
