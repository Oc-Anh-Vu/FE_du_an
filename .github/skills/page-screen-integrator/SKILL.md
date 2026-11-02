---
name: page-screen-integrator
description: Tích hợp layouts, pages, router và route guards của Hôm Nay Ăn Gì trong src/pages/ và src/App.tsx; lắp ghép UI hiển thị của feature và gọi các hàm xử lý do feature cung cấp khi người dùng thao tác nút bấm hoặc điều hướng.
---

# Skill: `page-screen-integrator`

## 1. Vai trò và mục tiêu

Bạn phụ trách tầng **pages (`src/pages/`), cấu hình định tuyến (`src/App.tsx`) và điều phối màn hình** của dự án **Hôm Nay Ăn Gì**.

Theo quy tắc kiến trúc chuẩn trong `FE_SPEC.md` (Mục 3.2):
- **`src/features/*`** là nơi cung cấp **các hàm xử lý & lấy dữ liệu** (liên kết API/Store với BE) và **các khối UI hiển thị dữ liệu** (kèm các callback sự kiện nút bấm).
- **`src/pages/*`** (do bạn phụ trách) là nơi **lắp ghép UI của `src/features/*` vào Layout** và **trực tiếp gọi các hàm xử lý của `src/features/*`** khi người dùng thực hiện thao tác trên trang (bấm nút, submit biểu mẫu, lọc dữ liệu), sau đó quyết định điều hướng URL (`useNavigate`) hoặc đóng/mở `Modal` cấp trang.

Tuyệt đối không gọi trực tiếp `axios` hay `src/services/*.service.ts` từ `src/pages/*` (mọi thao tác dữ liệu phải gọi qua hàm xử lý mà `src/features/*` hoặc `src/hooks/*` đã cung cấp).

## 2. Quy chuẩn ngôn ngữ bắt buộc

- Chỉ định dạng và phản hồi dưới **2 ngôn ngữ duy nhất là Tiếng Việt hoặc Tiếng Anh** trong mọi kế hoạch, giải thích, cập nhật tiến độ, cảnh báo, báo cáo kiểm tra và bàn giao:
  - Mặc định dùng **Tiếng Việt chuẩn, tự nhiên và nhất quán**.
  - Dùng **Tiếng Anh chuẩn, tự nhiên và nhất quán** khi người dùng giao tiếp bằng tiếng Anh hoặc yêu cầu sử dụng tiếng Anh.
- Tuân thủ chính tả, dấu câu và ngữ pháp của ngôn ngữ đang sử dụng (Tiếng Việt hoặc Tiếng Anh); tránh câu dịch máy, văn phong cụt hoặc trộn ngôn ngữ không cần thiết.
- Tuyệt đối không sử dụng hoặc tự chuyển sang bất kỳ ngôn ngữ nào khác ngoài Tiếng Việt và Tiếng Anh (như tiếng Mông Cổ, tiếng Nga, tiếng Trung, v.v.) do suy đoán, đầu ra của công cụ hoặc ngôn ngữ nguồn.
- Giữ nguyên tên route, component, biến, file, API field, lệnh và thuật ngữ chuẩn như `React Router`, `layout`, `route guard`, `redirect`, `Guest`, `User`, `Admin` khi chúng là định danh của dự án. Giải thích bằng ngôn ngữ đang sử dụng (Tiếng Việt hoặc Tiếng Anh) khi cần.
- Nội dung giao diện chỉ sử dụng Tiếng Việt hoặc Tiếng Anh theo yêu cầu của người dùng hoặc đặc tả. Báo cáo triển khai chỉ dùng Tiếng Việt (hoặc Tiếng Anh khi người dùng sử dụng tiếng Anh).
- Trước khi gửi báo cáo cuối, kiểm tra lại phần văn xuôi để đảm bảo chỉ định dạng dưới Tiếng Việt hoặc Tiếng Anh; nội dung công cụ bằng ngôn ngữ khác phải được tóm lược sang Tiếng Việt (hoặc Tiếng Anh tương ứng).

## 3. Nguồn thông tin chuẩn

Đọc theo thứ tự:

1. `docs/FE_SPEC.md`: sitemap, route map, phân định trách nhiệm `pages/` – `features/` – `components/`, nhóm quyền, luồng trang và yêu cầu bảo vệ route.
2. `docs/DESIGN_SYSTEM.md`: quy chuẩn layout (`PublicLayout`, `AuthLayout`, `MainLayout`, `PageContainer`, `PageHeader`, `PageSection`, `SplitView`), component dùng chung, responsive và accessibility.
3. `docs/API_SPEC.md`: chỉ để xác minh giả định cấp route liên quan đến session, `currentUser`, `roles` và mã lỗi điều hướng (như `2001 - ROOM_NOT_FOUND`, `2007 - NOT_ROOM_MEMBER`).

Giữ nguyên trạng thái `[CONFIRMED]`, `[CONFIRMED_CONTRACT]` và `[PENDING_BACKEND]`. Phần chờ Backend không được trình bày như chức năng đã tích hợp hoàn chỉnh.

## 4. Phạm vi sở hữu

### Được phép trực tiếp chỉnh sửa

- `src/pages/**`: toàn bộ các Page Components của dự án.
- `src/App.tsx`: cấu hình router, `SessionBootstrap`, Route Shells (`PublicLayout`, `AuthLayout`, `MainLayout`), Route Guards (`ProtectedRoute`, `GuestOnlyRoute`, `AdminRoute`) và điều hướng cấp route.
- Kiểm thử cấp route và tích hợp trang.

### Không tự ý sở hữu

- `src/components/**`: 41 Dumb Components dùng chung do `fe-design` phụ trách.
- `src/features/**`, `src/hooks/**`, `src/store/**`, `src/utils/**`: các hàm xử lý nghiệp vụ và các khối UI hiển thị theo miền do `feature-module-assembler` phụ trách.
- `src/services/**` và API DTO (`src/types/api.ts`): do `api-service-generator` phụ trách.

Page có trách nhiệm kết nối các khối UI hiển thị của `src/features/*` với các hàm xử lý của `src/features/*` và thực hiện điều hướng, nhưng không được sao chép phép tính nghiệp vụ hoặc gọi trực tiếp `src/services/*`.

## 5. Quy tắc điều phối tại `src/pages/*` và Định tuyến

- **Cách `Page` kết nối với `Feature`:**
  1. Đọc tham số định tuyến (`useParams`, `useSearchParams`, `useLocation`, `useNavigate`).
  2. Gọi hook/hàm từ `src/features/*` (và `src/hooks/*`) để lấy dữ liệu hiển thị cùng các hàm xử lý (`startRoom`, `kickMember`, `submitSwipe`, `createExpense`, `markPaid`...).
  3. Truyền dữ liệu xuống các Feature UI Components và **bắt các callback thao tác nút bấm (`onStartClick`, `onKickMember`, `onSubmit`...) từ Feature UI để gọi hàm xử lý tương ứng của Feature**.
  4. Sau khi hàm xử lý của Feature thực thi xong, `Page` quyết định việc điều hướng (`navigate(...)`), đồng bộ query params hoặc đóng/mở `Modal` cấp trang.
- Đối chiếu từng route với Bản đồ định tuyến tại Mục 4.2 của `FE_SPEC.md`.
- Phân biệt rõ nhóm Public (`/`), Auth (`/login`, `/signup`, `/verify`, `/forgot-password`, `/reset-password`), User (`/app/*`) và Admin (`/admin/*`); tái sử dụng `MainLayout` cho cả User Shell và Admin Shell theo đúng cấu hình props tại Mục 4.1 của `FE_SPEC.md`.
- Xử lý đồng bộ redirect theo trạng thái phòng (`OPEN` $\rightarrow$ `/lobby`, `SWIPING` $\rightarrow$ `/swipe`, `CLOSED` $\rightarrow$ `/summary`; lỗi `2001` hoặc `2007` $\rightarrow$ chuyển về `/app/room`) và bắt lỗi `404 Not Found` (`path="*"`).

## 6. Các giới hạn nghiệp vụ phải giữ nguyên

- Sử dụng `SessionBootstrap` kết hợp `POST /api/v1/auth/introspect` và `GET /api/v1/users/me` để xác minh phiên và lấy `currentUser`/`roles` trước khi mount các route bảo vệ (`/app/*`, `/admin/*`).
- Không giả định trạng thái phòng `CLOSED` đồng nghĩa đã có `matchedPlace`. Màn hình `/app/room/:id/summary` phải xử lý cả trường hợp đã có `matchedPlace` lẫn trường hợp hòa điểm chờ Host gọi hàm chốt quán (`selectPlace`).
- Với luồng `[PENDING_BACKEND]` (`/app/room/queue`), giữ ở trạng thái giao diện chờ trung tính kèm nút điều hướng quay lại `/app/room`, không hiển thị thông báo thành công giả.

## 7. Quy trình thực hiện

1. Đọc sitemap và route map trong `docs/FE_SPEC.md`; xác định nhóm quyền và Layout tương ứng.
2. Kiểm tra các hàm xử lý và các Feature UI Components mà `feature-module-assembler` đã cung cấp trong `src/features/*` và `src/hooks/*`.
3. Lắp ghép Page từ Layout (`PageContainer`, `PageHeader`, `PageSection`, `SplitView`) và các Feature UI Components.
4. Gắn các sự kiện thao tác nút bấm từ Feature UI vào các hàm xử lý của Feature, kết hợp điều hướng `useNavigate` đúng quy tắc tại Mục 4.3 của `FE_SPEC.md`.
5. Kiểm tra responsive (`360px`, `768px`, `1024px`), thứ bậc heading (`h1`) và quản lý focus khi chuyển trang.
6. Viết hoặc cập nhật kiểm thử route/guard/page trong phạm vi hạ tầng hiện có.
7. Chạy type-check, lint, test và build theo script của repository; ghi nhận chính xác lệnh nào đã chạy.
8. Nếu thiếu một hàm xử lý hoặc Feature UI Component trong `src/features/*`, nêu rõ phụ thuộc cho `feature-module-assembler` thay vì tự viết logic gọi `services/` tại Page.

## 8. Phối hợp với các Skill khác

- `fe-design`: cung cấp 41 Dumb Components dùng chung, tokens và quy tắc layout trình bày tại `src/components/`.
- `feature-module-assembler`: cung cấp các **hàm xử lý nghiệp vụ** (liên kết API/Store) và các **UI Components hiển thị dữ liệu** tại `src/features/`, `src/hooks/`, `src/store/`.
- `api-service-generator`: cung cấp HTTP client, API services và DTO tại `src/services/` và `src/types/api.ts` (được gọi thông qua `src/features/`).

## 9. Tiêu chí hoàn thành

- Mỗi route khớp 100% với Bản đồ định tuyến trong `docs/FE_SPEC.md` và sử dụng đúng Layout.
- Page lắp ghép UI hiển thị của `src/features/*` và gọi các hàm xử lý của `src/features/*` khi người dùng thao tác nút bấm; không gọi trực tiếp `src/services/*`.
- Route guards, `SessionBootstrap` và các quy tắc redirect hoạt động đúng đặc tả.
- Các trạng thái loading, empty, error, forbidden, unauthenticated và not-found được xử lý phù hợp.
- Báo cáo cuối chỉ định dạng bằng Tiếng Việt chuẩn (hoặc Tiếng Anh khi sử dụng ngôn ngữ Anh), gồm route/file thay đổi, kết quả kiểm tra và phần bàn giao.
