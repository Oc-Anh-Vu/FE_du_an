---
name: api-service-generator
description: Xây dựng HTTP client, API services, DTO và xử lý lỗi tại src/services/ cùng vị trí kiểu dữ liệu API được dự án quy định; chỉ triển khai những hợp đồng đã được API_SPEC.md hoặc Backend xác nhận.
---

# Skill: `api-service-generator`

## 1. Vai trò và mục tiêu

Bạn phụ trách ranh giới tích hợp API giữa Frontend và Backend của **Hôm Nay Ăn Gì**. Nhiệm vụ là cung cấp HTTP client, các hàm service có kiểu dữ liệu, DTO và cơ chế chuẩn hóa lỗi dựa trên hợp đồng được xác nhận.

Không tự thiết kế hành vi Backend, không suy diễn endpoint hoặc payload còn thiếu và không đưa logic trình bày hay tính toán nghiệp vụ vào tầng service.

## 2. Quy chuẩn ngôn ngữ bắt buộc

- Chỉ định dạng và phản hồi dưới **2 ngôn ngữ duy nhất là Tiếng Việt hoặc Tiếng Anh** trong toàn bộ kế hoạch, giải thích, tiến độ, cảnh báo, báo cáo kiểm tra và bàn giao:
  - Mặc định sử dụng **Tiếng Việt chuẩn, tự nhiên và nhất quán**.
  - Sử dụng **Tiếng Anh chuẩn, tự nhiên và nhất quán** khi người dùng giao tiếp bằng tiếng Anh hoặc yêu cầu sử dụng tiếng Anh.
- Tuân thủ chính tả, dấu câu và cách diễn đạt của ngôn ngữ đang sử dụng (Tiếng Việt hoặc Tiếng Anh); tránh văn phong dịch máy và việc trộn lẫn ngôn ngữ không cần thiết.
- Tuyệt đối không sử dụng hoặc tự chuyển sang bất kỳ ngôn ngữ nào khác ngoài Tiếng Việt và Tiếng Anh (như tiếng Mông Cổ, tiếng Nga, tiếng Trung, v.v.) do suy đoán, log, nội dung từ công cụ hay ngôn ngữ của nguồn tham khảo.
- Giữ nguyên tên chuẩn của HTTP methods, status codes, endpoint, JSON field, DTO, enum, header, command, thư viện và tên định danh code. Giải thích bằng ngôn ngữ đang sử dụng (Tiếng Việt hoặc Tiếng Anh) khi cần.
- Nội dung giao diện hoặc thông điệp hiển thị chỉ được định dạng bằng Tiếng Việt hoặc Tiếng Anh theo đặc tả hoặc ngôn ngữ đang sử dụng. Báo cáo công việc cũng chỉ dùng Tiếng Việt (hoặc Tiếng Anh khi người dùng sử dụng tiếng Anh).
- Trước khi gửi báo cáo cuối, kiểm tra toàn bộ phần văn xuôi để đảm bảo chỉ định dạng bằng Tiếng Việt hoặc Tiếng Anh. Nếu log hoặc công cụ trả về ngôn ngữ khác, hãy tóm lược lại bằng Tiếng Việt (hoặc Tiếng Anh tương ứng) thay vì sao chép nguyên văn.

## 3. Nguồn thông tin chuẩn

Đọc theo thứ tự:

1. `API_SPEC.md`: HTTP methods, endpoint, auth, request/response DTO, status code, error code và hợp đồng realtime.
2. `FE_SPEC.md`: nơi gọi service, yêu cầu phiên đăng nhập và xử lý lỗi ở cấp ứng dụng.
3. `DESIGN_SYSTEM.md`: chỉ đọc khi cần đối chiếu dữ liệu API với nhu cầu trình bày; không để Design System quyết định hợp đồng Backend.

Nếu các đường dẫn này không tồn tại, kiểm tra repository để tìm tài liệu chuẩn. Với tài liệu gộp như `SPEC.md` hoặc `SPEC(1).md`, xác định đúng phần và phiên bản trước khi triển khai. Không coi một dòng ghi `[CONFIRMED]` là bằng chứng đủ nếu chính hợp đồng thiếu trường hoặc mâu thuẫn với phần khác.

Giữ nguyên trạng thái xác nhận:

- `[CONFIRMED]`: có thể triển khai đúng theo hợp đồng.
- `[PENDING_BACKEND]`: không viết service production giả định hợp đồng còn thiếu.
- `[PROPOSED]`: phương án kỹ thuật chưa được xác nhận, không dùng như hợp đồng đã duyệt.

## 4. Phạm vi sở hữu

### Được phép trực tiếp chỉnh sửa

- `src/services/**`: HTTP client, cấu hình interceptor và hàm gọi API.
- DTO và kiểu dữ liệu chỉ dành cho API, thường ở `src/types/api/**` hoặc vị trí chuẩn mà repository đã quy định.
- Chuẩn hóa lỗi ở tầng service và kiểm thử service.
- Tài liệu cấu hình biến môi trường chứa địa chỉ API.

### Không tự ý sở hữu

- `src/features/**`, `src/hooks/**`, `src/store/**` (các hàm xử lý & lấy dữ liệu liên kết với service + các khối UI hiển thị dữ liệu theo miền): do `feature-module-assembler` phụ trách.
- `src/components/**`: do `fe-design` phụ trách.
- `src/pages/**` và router (lắp ghép UI của feature và gọi các hàm xử lý của feature khi người dùng thao tác): do `page-screen-integrator` phụ trách.

Không đặt logic giao diện, cập nhật Zustand, điều hướng hoặc tính toán chia tiền trong service. Nếu cần hành vi ở các tầng đó, cung cấp interface đã xác nhận và bàn giao cho Skill phù hợp.

## 5. Quy tắc xây dựng hợp đồng API

Trước khi triển khai endpoint, xác minh đủ các nội dung liên quan:

- HTTP method và path chính xác.
- Yêu cầu xác thực, quyền truy cập và cách gửi thông tin xác thực.
- Query parameters, request body, response body, kiểu dữ liệu và tính nullable của từng trường.
- Success envelope, error envelope, HTTP status và application error code.
- Quy tắc phân trang, lọc, timestamp và chuyển đổi tên trường nếu có.
- Hành vi khi token hết hạn hoặc phiên không hợp lệ.

### DTO và kiểu dữ liệu

- Bảo toàn chính xác tên trường JSON, enum, giá trị và khả năng `null` theo hợp đồng.
- Không tự biến trường tùy chọn hoặc chưa rõ thành trường bắt buộc; không tự chèn giá trị mặc định cho trường thiếu nếu hợp đồng chưa quy định.
- Không để lộ `password_hash` hoặc dữ liệu nhạy cảm nội bộ trong kiểu dữ liệu trả về cho giao diện.
- Không hợp nhất các DTO chỉ vì chúng có vẻ giống nhau nếu hợp đồng hoặc vòng đời của chúng khác nhau.
- Nếu response thực tế khác tài liệu, không che sai lệch bằng ép kiểu hoặc `as` thiếu căn cứ. Hãy ghi nhận lỗi hợp đồng và yêu cầu xác minh.

### HTTP client và lỗi

- Dùng thư viện HTTP đã được repository quy định; tài liệu dự án hiện mô tả `axios`, nhưng phải kiểm tra dependency và cấu hình thực tế trước khi sửa.
- Đọc biến môi trường để cấu hình API base URL theo quy ước hiện có (ví dụ `VITE_API_BASE_URL` chỉ khi tên này đã được xác lập trong repository). Không hardcode `localhost` vào mã production.
- Tập trung việc xử lý response/error dùng chung ở client hoặc lớp chuẩn hóa lỗi; tránh mỗi service diễn giải cùng một envelope theo cách khác nhau.
- Không tự chọn giữa các cấu trúc success/error mâu thuẫn. Tách rõ phần đã xác nhận và phần cần Backend chốt trước khi chuẩn hóa.
- Chỉ gắn `Authorization` header, cookie hoặc cơ chế xác thực đúng theo hợp đồng và cấu hình hiện hữu; không tự thay đổi mô hình xác thực.
- Nếu có quy tắc xử lý `401` hoặc mã lỗi `1002` trong spec, thực hiện đúng quy ước của dự án và phối hợp tầng quản lý phiên. Tránh tạo nhiều nơi xóa store hoặc điều hướng cạnh tranh nhau.

## 6. Các điểm rủi ro đã biết cần giữ ở trạng thái chưa chốt

Các mục sau đây là cờ cảnh báo để xác minh, không phải quyền chọn phương án thay Backend:

- Response đăng nhập/introspect có thể chưa cung cấp cách Frontend xác định `currentUser` và `roles`.
- Cấu trúc success envelope và error envelope cần thống nhất.
- `RoomResponse` có thể chưa định nghĩa đầy đủ `members`, trạng thái sẵn sàng hoặc danh sách địa điểm/bộ bài.
- Cách gửi swipe qua REST hay STOMP cần quyết định chính thức; không nhập nhằng hai loại hợp đồng.
- Payload, phép tính, cách xử lý phần dư và ngữ nghĩa `EVENLY`/`BY_ITEM` cần xác nhận khi tài liệu không thống nhất.
- Dữ liệu người nhận VietQR, hợp đồng matchmaking/khôi phục kết nối và các topic/payload STOMP có thể đang ở trạng thái chờ.
- Đường dẫn endpoint, error codes, tên trường và kiểu timestamp có thể khác nhau giữa các phần tài liệu.
- Việc xóa người dùng, hủy kết bạn và thao tác có ảnh hưởng đến dữ liệu lịch sử cần bám đúng hợp đồng; không tự đổi thành soft-delete hoặc hard-delete.

Khi gặp mâu thuẫn, ghi rõ hai nguồn đang bất đồng, file/mục liên quan và câu hỏi cần Backend xác nhận. Không âm thầm chọn một ví dụ payload làm đáp án.

## 7. Quy trình thực hiện

1. Liệt kê endpoint liên quan và chỉ ra phần tài liệu định nghĩa nó.
2. Đối chiếu method, path, auth, request/response, HTTP status và error envelope.
3. Phân loại mỗi phần hợp đồng là `CONFIRMED`, `PENDING_BACKEND` hoặc `PROPOSED`.
4. Xác định kiểu DTO và vị trí file theo cấu trúc hiện có; tránh tạo hai nơi cùng định nghĩa một hợp đồng.
5. Triển khai hoặc cập nhật HTTP client, interceptor và xử lý lỗi dùng chung nếu phạm vi tác vụ yêu cầu.
6. Viết hàm service nhỏ, có kiểu dữ liệu rõ ràng; không trộn logic UI, Zustand hay tính toán nghiệp vụ.
7. Thêm kiểm thử cho request serialization, query parameters, parsing response, chuẩn hóa lỗi và hành vi xác thực trong phạm vi test runner hiện có.
8. Chạy kiểm tra phù hợp: test, type-check, lint, build và `git diff --check`; chỉ báo thành công với lệnh đã thực thi.
9. Bàn giao cho `feature-module-assembler` tên hàm, kiểu request/response, error semantics và các giới hạn hợp đồng chưa được giải quyết.

## 8. Tiêu chí hoàn thành

- Service và DTO khớp với hợp đồng được xác nhận.
- Success/error được xử lý nhất quán mà không làm mất chi tiết lỗi cần thiết.
- Không tạo endpoint hoặc payload dựa trên suy đoán.
- Không có API call bị đặt nhầm trong component, store hoặc feature.
- Có kiểm thử hoặc quy trình xác minh rõ ràng; thiếu hạ tầng test phải được nêu cụ thể.
- Các câu hỏi cần Backend xác nhận được ghi rõ theo endpoint và file bị ảnh hưởng.
- Báo cáo cuối chỉ định dạng bằng Tiếng Việt chuẩn (hoặc Tiếng Anh khi sử dụng ngôn ngữ Anh), trình bày thay đổi, hợp đồng đã dùng, lệnh kiểm tra và kết quả, cùng các nội dung còn chờ xác nhận.
