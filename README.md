# 🍽️ Hôm Nay Ăn Gì? (What To Eat Today?)

> Một ứng dụng mạng xã hội ẩm thực thời gian thực (Real-time), giúp các nhóm bạn giải quyết câu hỏi muôn thuở: "Hôm nay ăn gì?" thông qua cơ chế quẹt thẻ (Tinder-like) và tích hợp hệ thống chia tiền (Bill Splitting) thông minh qua mã QR.

---

## 🚀 1. Công Nghệ Sử Dụng (Tech Stack)

### 🎨 Frontend (Web/Mobile Web)
*   **Core:** React.js, TypeScript, Vite.
*   **Styling:** Tailwind CSS.
*   **Animation:** `framer-motion` (Xử lý hiệu ứng quẹt thẻ mượt mà).
*   **Real-time:** `socket.io-client` / `sockjs-client` (Giao tiếp WebSockets).
*   **State Management:** Zustand hoặc Redux Toolkit.

### ⚙️ Backend (API & Realtime Server)
*   **Core:** Java Spring Boot.
*   **Architecture:** MVC (Controller - Service - Repository).
*   **Database Access:** Spring Data JPA (Hibernate).
*   **Real-time:** Spring WebSocket + STOMP (Đồng bộ phòng & quẹt thẻ).
*   **Security:** Spring Security & JWT.
*   **Documentation:** Swagger (Springdoc-openapi).

### 🗄️ Database & Infrastructure
*   **RDBMS:** PostgreSQL (Xử lý dữ liệu quan hệ, hóa đơn, người dùng).
*   **In-Memory / Queue:** Redis (Bắt buộc cho hệ thống Hàng đợi Matchmaking siêu tốc).

---

## 🌟 2. Các Tính Năng Cốt Lõi

1.  **Khám Phá Địa Điểm (Place Discovery):** Lướt xem danh sách quán ăn, lọc theo tọa độ GPS (gần nhất) hoặc theo phân khúc giá.
2.  **Quản Lý Phòng Thời Gian Thực (Room Management):** Tạo phòng, mời bạn bè, đồng bộ trạng thái "Sẵn sàng" của các thành viên qua STOMP WebSockets.
3.  **Cơ Chế Quẹt Thẻ (Tinder-like Swiping):** 
    *   Vuốt trái/phải để chọn quán.
    *   Hiệu ứng realtime (thả tim) khi có người vừa "Like".
    *   Thuật toán Matching: Chốt đơn khi 100% thành viên Like, hoặc fallback chọn quán có lượt Like cao nhất nếu hết thẻ.
4.  **Hệ Thống Chia Tiền (Bill Splitting) & Nhắc Nợ:**
    *   **Cơ chế 1 (Chi tiết):** Chọn món từng người ăn, hệ thống tự chia tiền món chung và cộng dồn.
    *   **Cơ chế 2 (Nhanh):** Nhập tay số tiền từng người, có Smart Validation chống lệch bill.
    *   Tự động tạo mã **VietQR** động để thanh toán nhanh, theo dõi trạng thái `is_paid`.
5.  **Ghép Phòng Ngẫu Nhiên (Tag-based Matchmaking):** Dành cho người đi ăn Solo. Chọn tag tâm trạng (VD: "Thèm bia"), hệ thống đưa vào Redis Queue và tự động ghép nhóm những người cùng sở thích trong bán kính gần.
6.  **Hệ Thống Bạn Bè:** Kết bạn, xem trạng thái Online/Offline, mời trực tiếp vào phòng (One-click Invite).

---

## 🔄 3. Luồng Hoạt Động (Workflows)

Hệ thống được thiết kế với 6 luồng hoạt động chính:
1.  **Account & Social Flow:** Đăng nhập (Guest/Google) -> Cấp quyền GPS -> Kết bạn -> Theo dõi trạng thái Online.
2.  **Personal Flow:** Lướt xem quán ăn -> Quẹt thẻ đi ăn 1 mình -> Quản lý sổ nợ cá nhân.
3.  **Private Group Flow:** Tạo phòng -> Lấy `room_code` / Mời bạn bè -> Ready -> Bắt đầu quẹt.
4.  **Matchmaking Flow:** Khai báo Tag -> Chờ tại Radar (Redis) -> Tự động chốt nhóm 2-4 người -> Vào phòng ẩn.
5.  **Core Swiping Flow:** Quẹt thẻ (có Debounce) -> Broadcast WS STOMP -> Chốt đơn (Match) / Fallback.
6.  **Billing Flow:** Khởi tạo Hóa đơn -> Chọn cơ chế chia tiền -> Gen QR Code -> Bắn thông báo nhắc nợ -> Xác nhận thanh toán.

---

## 📂 4. Cấu Trúc Thư Mục

### Frontend (React + TS)
Cấu trúc theo hướng **Feature-based**, giúp dự án dễ dàng mở rộng:
```text
src/
 ┣ 📂 assets/           # Ảnh, icon, Lottie files
 ┣ 📂 components/       # UI Components dùng chung (Button, Avatar, Modal, QRCodeDisplay)
 ┣ 📂 features/         # Logic nghiệp vụ
 ┃ ┣ 📂 auth/           # Đăng nhập, GPS
 ┃ ┣ 📂 social/         # Bạn bè, Invite Popup
 ┃ ┣ 📂 matchmaking/    # Chọn Tag, Radar Queue
 ┃ ┣ 📂 room/           # Lobby, MemberGrid
 ┃ ┣ 📂 swipe/          # SwipeDeck, FramerCard, MatchResult
 ┃ ┗ 📂 billing/        # ItemizedOrder, ManualSplit, DebtWidget
 ┣ 📂 hooks/            # useAuth, useSocket, useGeolocation, useDebounce
 ┣ 📂 pages/            # HomePage, ExplorePage, RoomProcessPage, BillingPage
 ┣ 📂 services/         # apiClient (Axios), socketClient
 ┣ 📂 store/            # userStore, roomStore (Zustand)
 ┗ 📂 utils/            # geoCalculator (Haversine), currencyFormat
```

### Backend (Spring Boot)
Thiết kế theo kiến trúc **Phân lớp (Layered Architecture)**:
```text
src/main/java/com/utt/homnayangi/
 ┣ 📂 config/           # SecurityConfig, WebSocketConfig, RedisConfig, SwaggerConfig
 ┣ 📂 controller/       
 ┃ ┣ 📂 api/            # AuthController, PlaceController, RoomController, BillingController...
 ┃ ┗ 📂 ws/             # RoomSocket, PresenceSocket (Xử lý bản tin STOMP)
 ┣ 📂 service/          # AuthService, RoomService, SwipeMatchService, MatchmakingWorker...
 ┣ 📂 repository/       # JpaRepository (PostgreSQL) + QueueRepository (Redis)
 ┣ 📂 model/            # entity, dto, enums
 ┣ 📂 security/         # JwtTokenProvider, JwtAuthenticationFilter
 ┗ 📂 exception/        # GlobalExceptionHandler
```

---

## 🗄️ 5. Thiết Kế Cơ Sở Dữ Liệu (PostgreSQL)

Hệ thống sử dụng `UUID` cho các khóa chính và bao gồm 12 bảng cốt lõi:
*   **User & Social:** `users`, `friendships`
*   **Matchmaking:** `tags`, `user_tags`
*   **Discovery:** `places` (Tích hợp GPS Latitude/Longitude)
*   **Room & Swiping:** `rooms`, `room_members`, `swipes` (Có cờ chống spam)
*   **Billing (Chia tiền):** `expenses`, `expense_items`, `item_sharers`, `expense_splits`

---

## 🛠️ 6. Hướng Dẫn Cài Đặt (Local Development)

### Yêu cầu môi trường
*   Node.js v18+
*   Java JDK 17+
*   PostgreSQL 14+
*   Redis Server (Đang chạy ở port 6379)

### Setup Backend
1. Clone dự án và mở thư mục backend bằng IntelliJ IDEA.
2. Tạo database `homnayangi` trong PostgreSQL.
3. Cấu hình thông tin DB và Redis trong file `src/main/resources/application.yml`.
4. Chạy file `schema.sql` để khởi tạo các bảng.
5. Chạy ứng dụng Spring Boot. Swagger UI sẽ có tại: `http://localhost:8080/swagger-ui.html`

### Setup Frontend
1. Mở thư mục frontend bằng VS Code.
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Copy file `.env.example` thành `.env` và cấu hình các biến môi trường (API URL, Socket URL).
4. Khởi chạy server dev:
   ```bash
   npm run dev
   ```

---
*Dự án "Hôm Nay Ăn Gì" - Giải pháp công nghệ cho những cái bụng đói.*