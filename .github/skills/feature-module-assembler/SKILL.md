---
name: feature-module-assembler
description: Xây dựng các hàm xử lý nghiệp vụ, liên kết dữ liệu API/Store và các khối UI hiển thị dữ liệu theo miền trong src/features/, src/hooks/, src/store/ và src/utils/ để cung cấp cho tầng src/pages/ gọi và điều phối.
---

# Skill: `feature-module-assembler`

## 1. Vai trò và mục tiêu

Bạn phụ trách tầng **feature (`src/features/`), hooks (`src/hooks/`), global state (`src/store/`) và utilities (`src/utils/`)** của dự án **Hôm Nay Ăn Gì**.

Theo quy tắc kiến trúc chuẩn trong `FE_SPEC.md` (Mục 3.2), nhiệm vụ của tầng `src/features/*` gồm **2 phần tách bạch**:
1. **Hàm xử lý và lấy dữ liệu (Feature Hooks / Actions):** Kết nối với `src/services/*` và `src/store/*` để lấy dữ liệu hiển thị từ Backend, kiểm tra validation, thực thi quy tắc nghiệp vụ và **đóng gói sẵn các hàm xử lý** (`fetchData`, `login`, `createRoom`, `startSwiping`, `kickMember`, `submitSwipe`, `createExpense`, `markPaid`...) xuất ra cho tầng `src/pages/*` gọi.
2. **UI hiển thị dữ liệu (Feature UI Components):** Lắp ghép các Dumb Components từ `src/components/` để hiển thị dữ liệu theo miền nghiệp vụ (kèm trạng thái `Skeleton`, `EmptyState`, `Alert` và ẩn/hiện theo quyền ngữ cảnh `Host` / `Member` / `Payer` / `Debtor`), đồng thời **phát các sự kiện thao tác nút bấm ra ngoài qua callback props** (`onSubmit`, `onStartClick`, `onKickMember`, `onPayClick`...) để `src/pages/*` bắt sự kiện và gọi hàm xử lý.

Không triển khai toàn bộ dự án trong một lần nếu yêu cầu chỉ là một bước nhỏ. Giữ đúng cấu trúc đã quy chuẩn, thực hiện theo phạm vi nhiệm vụ và không tự ý thay kiến trúc hoặc hợp đồng nghiệp vụ.

## 2. Quy chuẩn ngôn ngữ bắt buộc

- Chỉ định dạng và phản hồi dưới **2 ngôn ngữ duy nhất là Tiếng Việt hoặc Tiếng Anh** cho mọi trao đổi, giải thích, kế hoạch, tiến độ, cảnh báo, kết quả kiểm tra và bàn giao:
  - Mặc định dùng **Tiếng Việt chuẩn, tự nhiên và nhất quán**.
  - Dùng **Tiếng Anh chuẩn, tự nhiên và nhất quán** khi người dùng giao tiếp bằng tiếng Anh hoặc yêu cầu sử dụng tiếng Anh.
- Tuân thủ chính tả và dấu câu của ngôn ngữ đang sử dụng (Tiếng Việt hoặc Tiếng Anh); diễn đạt rõ ràng, tránh câu dịch máy, câu cụt và việc trộn ngôn ngữ không cần thiết.
- Tuyệt đối không sử dụng hoặc tự chuyển sang bất kỳ ngôn ngữ nào khác ngoài Tiếng Việt và Tiếng Anh (như tiếng Mông Cổ, tiếng Nga, tiếng Trung, v.v.) do suy đoán, đầu ra công cụ hay nội dung nguồn.
- Giữ nguyên định danh code, tên file, API field, enum, command và thuật ngữ chuẩn như `React`, `TypeScript`, `Zustand`, `Feature UI`, `Action Hook`, `view model`, `hook`, `selector` khi cần độ chính xác. Giải thích bằng ngôn ngữ đang sử dụng (Tiếng Việt hoặc Tiếng Anh) khi hữu ích.
- Nội dung giao diện chỉ được định dạng bằng Tiếng Việt hoặc Tiếng Anh theo yêu cầu của người dùng hoặc đặc tả. Báo cáo triển khai chỉ dùng Tiếng Việt (hoặc Tiếng Anh khi người dùng sử dụng tiếng Anh).
- Trước khi gửi báo cáo cuối, kiểm tra lại ngôn ngữ của toàn bộ phần văn xuôi để đảm bảo chỉ định dạng dưới Tiếng Việt hoặc Tiếng Anh. Nội dung công cụ bằng ngôn ngữ khác phải được diễn giải lại sang Tiếng Việt (hoặc Tiếng Anh tương ứng).

## 3. Nguồn thông tin chuẩn

Đọc theo thứ tự:

1. `docs/FE_SPEC.md`: kiến trúc, phân định trách nhiệm `pages/` – `features/` – `components/`, sitemap, luồng nghiệp vụ, phân quyền, state và yêu cầu nghiệm thu.
2. `docs/API_SPEC.md`: hợp đồng endpoint, DTO, mã lỗi (`ErrorCode.java`), trạng thái xác thực và realtime cho feature có liên quan.
3. `docs/DESIGN_SYSTEM.md`: component props/exports và quy chuẩn giao diện.

Ý nghĩa trạng thái phải được giữ nguyên:

- `[CONFIRMED]`: nội dung đã được đặc tả và mã nguồn `BE/` xác nhận.
- `[CONFIRMED_CONTRACT / BLOCKED_BY_SECURITY_CONFIG]`: đã có API trong `BE/` nhưng cần xử lý bắt lỗi `401`/`403` an toàn do `SecurityConfig.java`.
- `[PENDING_BACKEND]`: chưa có trong `BE/` (như hàng đợi Matchmaking Radar và WebSocket/STOMP).

## 4. Phạm vi sở hữu

### Được phép trực tiếp chỉnh sửa

- `src/features/**`: các hàm xử lý/hooks theo miền và các Feature UI Components hiển thị dữ liệu.
- `src/hooks/**`: hooks dùng chung hoặc theo nghiệp vụ (`useAuth`, `useSocket`, `useGeolocation`, `useDebounce`).
- `src/store/**`: Zustand stores (`userStore`, `roomStore`, `billingStore`, `uiStore`), selectors và các chuyển đổi state thuộc phạm vi Client.
- `src/utils/**`: hàm thuần (`cn`, `currencyFormat`, `avatarColor`, `geoCalculator`), phép tính nghiệp vụ đã được xác nhận và ánh xạ DTO sang view model.
- Kiểm thử cấp feature, hooks, stores và utilities.

### Không tự ý sở hữu

- `src/components/**`: 41 Dumb Components dùng chung; phối hợp với `fe-design`.
- `src/services/**` và DTO API (`src/types/api.ts`): phối hợp `api-service-generator`.
- `src/pages/**` và `src/App.tsx` (lắp ghép trang, gọi hàm xử lý của feature khi thao tác nút và điều hướng route): phối hợp `page-screen-integrator`.

Không tạo API call trực tiếp bằng `axios` trong feature nếu đã có service phù hợp. Nếu thiếu service hoặc DTO, yêu cầu `api-service-generator` bổ sung thay vì tạo một đường tích hợp riêng.

## 5. Quy tắc kiến trúc (`Feature` cung cấp hàm & UI hiển thị cho `Pages`)

- **Tách bạch rõ ràng giữa Hàm xử lý và UI hiển thị trong `src/features/*`:**
  1. **Hàm xử lý & lấy dữ liệu:** Đóng gói việc gọi `src/services/*.service.ts`, cập nhật `src/store/*` và kiểm tra dữ liệu thành các hàm/hooks rõ ràng để xuất ra cho `src/pages/*` sử dụng.
  2. **UI hiển thị dữ liệu:** Ghép các Dumb Components từ `src/components/` để hiển thị dữ liệu của miền nghiệp vụ và phát sự kiện thao tác nút bấm qua callback props (`onSubmit`, `onStartClick`, `onKickMember`, `onSelectPlace`, `onMarkPaid`...).
  3. **Không tự ý đóng kín thao tác hoặc tự chuyển trang:** Các UI Component trong `src/features/*` (trừ các Route Guards trong `src/features/auth/`) không tự ý gọi `useNavigate()` hay giấu kín hành động bấm nút bên trong mà phải truyền qua callback để `src/pages/*` gọi hàm xử lý và quyết định điều hướng.
- Chỉ đưa state vào Zustand khi nhiều component hoặc route cần dùng chung. State giao diện tạm thời của biểu mẫu nên nằm cục bộ khi phù hợp.
- Đặt các phép tính thuần vào utilities có kiểu dữ liệu rõ ràng và có thể kiểm thử độc lập.
- Tránh import vòng giữa các feature.
- Quyền hiển thị ở Frontend (`Host`, `Member`, `Payer`, `Debtor`) không thay thế kiểm soát quyền ở Backend.

## 6. Quy tắc nghiệp vụ riêng của dự án

- **Solo Mode** là luồng phía Client; không gọi các endpoint nhóm `/rooms` hoặc `/swipes` trong chế độ này. Chỉ dùng API địa điểm đã được xác nhận.
- Không giả lập thành công cho luồng `[PENDING_BACKEND]` (`RadarQueueView`, `InvitePopup`).
- Đối với các API đã có trong `BE/`:
  - Dùng `GET /api/v1/users/me` để lấy `currentUser` sau khi đăng nhập hoặc introspect token.
  - Dùng `POST /api/v1/rooms/{roomId}/deck` và `GET /api/v1/rooms/{roomId}/deck` để lấy bộ bài của phòng; dùng `RoomResponse.members` để hiển thị danh sách thành viên.
  - Dùng `split.qrCodeUrl` và thông tin `bankBin`, `bankAccountNumber`, `bankAccountName` của `split.payer` cho `VietQRPaymentCard`.
  - Bắt lỗi `401`/`403` an toàn đối với các endpoint bị ảnh hưởng bởi `SecurityConfig.java` (`/api/v1/auth/send-otp`, `/verify-otp`, `/forgot-password`, `/reset-password`, `GET /api/v1/places`, `GET /api/v1/users`).

## 7. Quy trình thực hiện

1. Xác định yêu cầu, feature liên quan, dữ liệu cần hiển thị và danh sách các hàm xử lý cần cung cấp cho `src/pages/*`.
2. Liệt kê phụ thuộc thành `CONFIRMED`, `CONFIRMED_CONTRACT` hoặc `PENDING_BACKEND` kèm nguồn đặc tả.
3. Chốt chữ ký các hàm xử lý (Action Hooks/Handlers) và giao diện `props` (dữ liệu hiển thị + callbacks sự kiện nút bấm) của Feature UI Component.
4. Tái sử dụng 41 Dumb Components hiện có trong `src/components/`.
5. Gọi API thông qua service và DTO đã được `api-service-generator` xác nhận trong các hàm xử lý của feature.
6. Triển khai Zustand stores, hooks, hàm xử lý nghiệp vụ và Feature UI Components.
7. Xử lý đầy đủ các trạng thái hiển thị: loading (`Skeleton`/`Spinner`), success, empty (`EmptyState`), error (`Alert`/`Toast`).
8. Viết hoặc cập nhật kiểm thử cho quy tắc nghiệp vụ, phép tính, state transitions và các nhánh lỗi.
9. Chạy type-check, lint, test và build theo script hiện có; đọc kết quả thực tế.
10. Bàn giao cho `page-screen-integrator` danh sách các **UI Components hiển thị** (kèm callback props) và các **hàm xử lý** để `src/pages/*` gắn vào màn hình.

## 8. Tiêu chí hoàn thành

- Mỗi feature cung cấp rõ ràng: (1) các hàm xử lý & lấy dữ liệu liên kết với BE, và (2) các UI Components hiển thị dữ liệu kèm callback props cho nút bấm.
- Feature UI Components ghép từ 41 Dumb Components thay vì viết lại giao diện dùng chung, và không tự ý điều hướng trang ngoài quyền kiểm soát của `src/pages/*`.
- Không có API call trực tiếp ngoài service layer.
- Hooks, stores, utilities và hàm xử lý có kiểu dữ liệu chặt chẽ và được kiểm thử ở mức phù hợp.
- Không biến luồng `[PENDING_BACKEND]` thành thành công giả.
- Báo cáo cuối chỉ định dạng bằng Tiếng Việt chuẩn (hoặc Tiếng Anh khi sử dụng ngôn ngữ Anh), nêu file đã sửa, hàm xử lý và UI đã triển khai, kết quả kiểm tra và thông tin bàn giao cho `page-screen-integrator`.
