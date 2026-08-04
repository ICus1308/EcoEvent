# Kế hoạch kỹ thuật dự án EcoEvent Hub

**Ngôn ngữ:** Tiếng Việt  
**Mục đích:** Tài liệu mô tả kế hoạch kỹ thuật, kiến trúc, lộ trình phát triển và phương án triển khai cho dự án EcoEvent Hub.

---

## 1. Giới thiệu dự án

EcoEvent Hub là nền tảng web hỗ trợ tổ chức sự kiện theo hướng bền vững, kết hợp giữa **AI lập kế hoạch sự kiện**, **chợ thiết bị xanh thuê/mua**, **hệ thống xác thực người dùng**, **ký quỹ an toàn**, **subscription theo gói**, và **kênh chat/hỗ trợ**.

Dự án hướng đến các nhóm người dùng chính:

- Sinh viên và câu lạc bộ tổ chức sự kiện.
- Người dùng cá nhân có nhu cầu thuê/mua thiết bị sự kiện.
- Nhà cung cấp hoặc chủ kho muốn đăng tải vật phẩm.
- Quản trị viên vận hành hệ thống và kiểm soát giao dịch.

Mục tiêu cốt lõi của EcoEvent Hub là giảm lãng phí vật tư dùng một lần, khuyến khích tái sử dụng tài nguyên, đồng thời hỗ trợ người dùng lập kế hoạch sự kiện hiệu quả bằng AI.

---

## 2. Mục tiêu kỹ thuật

Dự án được thiết kế nhằm đạt các mục tiêu sau:

1. **Tự động hóa lập kế hoạch sự kiện** bằng mô hình AI để tối ưu chi phí, thời gian và tác động môi trường.
2. **Xây dựng marketplace P2P** cho phép người dùng đăng ký, thuê, mua và quản lý thiết bị sự kiện.
3. **Đảm bảo an toàn giao dịch** qua cơ chế tài khoản, session, ký quỹ và xác thực vai trò người dùng.
4. **Phân tầng tính năng theo gói dịch vụ** để kiểm soát giới hạn AI, số lượng listing và quyền truy cập chức năng nâng cao.
5. **Tăng khả năng mở rộng** thông qua kiến trúc Next.js, Prisma, PostgreSQL và các module tách biệt.
6. **Tối ưu trải nghiệm người dùng** bằng giao diện hiện đại, responsive, hỗ trợ dark mode và animation.

---

## 3. Tổng quan kiến trúc hệ thống

### 3.1 Công nghệ sử dụng

- **Frontend / Fullstack:** Next.js 16 (App Router)
- **Ngôn ngữ:** TypeScript
- **UI:** React 19, Tailwind CSS 4, shadcn/ui, Lucide React, Framer Motion
- **Cơ sở dữ liệu:** PostgreSQL
- **ORM:** Prisma
- **Xác thực:** Session token, cookie, Bearer token, Supabase SSR
- **Gửi email:** Nodemailer
- **AI:** Google GenAI / Gemini
- **Tiện ích khác:** bcryptjs, zod, date-fns, pg

### 3.2 Mô hình triển khai logic

Hệ thống hiện tại được tổ chức theo các lớp chức năng chính:

- **UI layer:** các trang và component trong `app/` và `components/`
- **Business logic layer:** các hàm tiện ích trong `lib/`
- **Data layer:** schema và seed data trong `prisma/`
- **API layer:** các route server trong `app/api/`
- **Layout & navigation:** `app/layout.tsx`, `components/Header.tsx`, `components/MainLayoutWrapper.tsx`

### 3.3 Luồng vận hành chính

1. Người dùng truy cập trang chủ và xem giới thiệu sản phẩm.
2. Người dùng đăng ký/đăng nhập, xác thực OTP nếu cần.
3. Hệ thống nhận diện session để phân quyền và điều hướng.
4. Người dùng tạo kế hoạch sự kiện bằng AI hoặc duyệt marketplace.
5. Sản phẩm được thêm vào giỏ, checkout trực tiếp hoặc liên hệ chủ đồ.
6. Hệ thống ghi nhận đơn hàng, trạng thái và dữ liệu liên quan vào PostgreSQL.
7. Người dùng có thể chat, gửi tin nhắn hoặc tạo ticket hỗ trợ.

---

## 4. Phân tích cấu trúc code hiện tại

### 4.1 Thư mục gốc

Một số thành phần đáng chú ý của repo:

- `app/` — các route, trang và API của Next.js App Router
- `components/` — UI component tái sử dụng
- `lib/` — logic dùng chung: auth, mailer, prisma, subscription
- `prisma/` — schema và seed dữ liệu
- `public/` — tài nguyên tĩnh

### 4.2 App Router

Thư mục `app/` hiện có các module chính:

- `app/page.tsx` — trang landing page, giới thiệu EcoEvent Hub
- `app/layout.tsx` — layout gốc, fonts, provider, header, chat stack
- `app/globals.css` — hệ thống theme, biến màu, base styles
- `app/(auth)/` — luồng xác thực
- `app/ai-planner/` — chức năng lập kế hoạch AI
- `app/cart/` — giỏ hàng
- `app/checkout/` — thanh toán
- `app/dashboard/` — khu vực quản lý
- `app/messages/` — tin nhắn/hội thoại
- `app/pricing/` — thông tin gói dịch vụ
- `app/settings/` — cài đặt tài khoản
- `app/shop/` — marketplace thiết bị xanh

### 4.3 Component layer

Các component trọng tâm gồm:

- `components/Header.tsx` — thanh điều hướng chính
- `components/AuthProvider.tsx` — cung cấp auth state toàn cục
- `components/MainLayoutWrapper.tsx` — wrapper bố cục chính
- `components/NavbarUserMenu.tsx` — menu người dùng
- `components/ProductActionCard.tsx` — card hành động cho sản phẩm: thêm giỏ, thuê/mua, liên hệ chủ đồ
- `components/chat/*` — UI cho chat nổi và hội thoại
- `components/ui/*` — các primitive component kiểu shadcn

### 4.4 Library layer

Trong `lib/`, các file chính gồm:

- `lib/auth.ts` — xác thực người dùng từ Bearer token, cookie hoặc session DB
- `lib/prisma.ts` — khởi tạo Prisma Client với PostgreSQL adapter
- `lib/mailer.ts` — gửi OTP email và email đặt lại mật khẩu
- `lib/subscription.ts` — kiểm tra gói dịch vụ và giới hạn AI/listing
- `lib/supabase.ts` — tích hợp Supabase

---

## 5. Phân tích domain nghiệp vụ

### 5.1 Xác thực và tài khoản

Hệ thống hỗ trợ nhiều loại trạng thái người dùng và logic xác thực:

- `User` có `role`, `isVerified`, `trustScore`, số lần dùng AI.
- `VerificationCode`, `PendingRegistration`, `PasswordResetRequest` dùng cho OTP và khôi phục mật khẩu.
- `Session` lưu token đăng nhập và thời hạn hiệu lực.

Các vai trò chính:

- `CUSTOMER`
- `VERIFIED_STUDENT`
- `VENDOR`
- `ADMIN`

### 5.2 Marketplace vật phẩm sự kiện

Domain sản phẩm bao gồm:

- `Product`
- `Warehouse`
- `WarehouseInventory`
- `Cart`
- `CartItem`
- `BookingOrder`
- `OrderItem`
- `BookedDate`

Hệ thống đã hỗ trợ:

- bán hoặc cho thuê
- phân kho
- giữ số lượng khả dụng
- đặt cọc thuê
- tính giá thuê theo ngày

### 5.3 AI planning

Model `Event` lưu:

- tên sự kiện
- budget
- guest count
- kết quả AI dạng JSON

Điều này cho phép triển khai các chức năng như:

- gợi ý timeline sự kiện
- đề xuất thiết bị xanh
- ước lượng chi phí
- tính chỉ số tiết kiệm rác thải

### 5.4 Subscription và monetization

Các model:

- `Plan`
- `UserSubscription`
- `SubscriptionPayment`

Các gói chính:

- FREE
- PLUS
- PREMIUM

Các quyền lợi có thể kiểm soát:

- số kế hoạch AI mỗi tháng
- số listing tối đa
- phí nền tảng
- xuất PDF
- top search
- portal quản lý
- analytics

### 5.5 Chat và hỗ trợ

Các model:

- `Conversation`
- `Message`
- `Attachment`
- `SupportTicket`

Hệ thống này phù hợp để triển khai:

- chat giữa người thuê/mua và chủ đồ
- lưu file đính kèm
- hỗ trợ khách hàng
- xử lý tranh chấp cơ bản

---

## 6. Thiết kế dữ liệu

### 6.1 Các bảng lõi

- **User:** tài khoản người dùng và quyền truy cập
- **Session:** phiên đăng nhập
- **Product:** sản phẩm / vật phẩm cho thuê hoặc bán
- **Warehouse:** kho chứa sản phẩm
- **WarehouseInventory:** số lượng theo kho
- **Cart / CartItem:** giỏ hàng
- **BookingOrder / OrderItem:** đơn hàng và chi tiết
- **Event:** kế hoạch sự kiện do AI sinh
- **Plan / UserSubscription / SubscriptionPayment:** subscription
- **Conversation / Message / Attachment:** chat
- **SupportTicket:** ticket hỗ trợ

### 6.2 Nhận xét thiết kế

Thiết kế schema hiện tại thể hiện rõ mô hình nghiệp vụ của một nền tảng thương mại dịch vụ kết hợp AI. Việc tách `WarehouseInventory` giúp hỗ trợ đa kho, còn `BookingOrder` và `OrderItem` giúp quản lý đơn hàng linh hoạt hơn cho cả mua và thuê.

### 6.3 Định hướng cải tiến dữ liệu

Nên bổ sung thêm các cơ chế sau trong giai đoạn tiếp theo:

- audit log cho giao dịch quan trọng
- trạng thái thanh toán chi tiết hơn
- versioning cho kế hoạch AI
- lịch sử thay đổi inventory
- chỉ số trust score có công thức rõ ràng

---

## 7. Kế hoạch triển khai chức năng

### 7.1 Giai đoạn 1: Chuẩn hóa nền tảng

Mục tiêu:

- ổn định cấu trúc project
- chuẩn hóa biến môi trường
- đồng bộ Prisma và PostgreSQL
- chuẩn hóa auth flow

Công việc:

- rà soát `DATABASE_URL`, `SMTP_*`, Supabase keys
- kiểm tra `prisma generate` và migration
- loại bỏ mã thử nghiệm không cần thiết
- thống nhất cơ chế auth giữa cookie, Bearer token và session DB

### 7.2 Giai đoạn 2: Hoàn thiện xác thực và hồ sơ người dùng

Mục tiêu:

- đăng ký / đăng nhập / OTP / reset password hoàn chỉnh
- quản lý vai trò và trạng thái xác thực

Công việc:

- hoàn thiện luồng đăng ký bằng OTP
- tối ưu logic kiểm tra session
- bổ sung trang hồ sơ và cài đặt người dùng
- bảo vệ route theo role

### 7.3 Giai đoạn 3: Marketplace và checkout

Mục tiêu:

- hoàn thiện quy trình thuê/mua
- đồng bộ kho và giỏ hàng

Công việc:

- hoàn thiện `shop`, `product detail`, `cart`, `checkout`
- triển khai reserve/release inventory
- xử lý direct checkout
- đảm bảo không phát sinh race condition

### 7.4 Giai đoạn 4: AI planner

Mục tiêu:

- sinh kế hoạch sự kiện tự động
- tối ưu chi phí và vật tư xanh

Công việc:

- xây API gọi Gemini AI
- chuẩn hóa schema input/output bằng `zod`
- lưu `aiPlanJson` vào database
- hỗ trợ export kế hoạch

### 7.5 Giai đoạn 5: Subscription và giới hạn tính năng

Mục tiêu:

- áp dụng giới hạn theo gói
- chuẩn hóa nâng cấp gói

Công việc:

- hiển thị giá và quyền lợi
- kiểm soát số lần AI sử dụng
- kiểm soát số lượng listing
- liên kết payment với subscription

### 7.6 Giai đoạn 6: Chat, hỗ trợ và trust system

Mục tiêu:

- tạo kênh liên hệ tin cậy giữa người dùng
- hỗ trợ xử lý tranh chấp và hậu mãi

Công việc:

- hoàn thiện `Conversation`, `Message`, `Attachment`
- xây ticket support
- thiết lập badge/score uy tín
- chuẩn bị realtime chat nếu cần

### 7.7 Giai đoạn 7: Kiểm thử, tối ưu và triển khai

Mục tiêu:

- bảo đảm chất lượng trước khi bàn giao

Công việc:

- test API và UI theo luồng chính
- kiểm tra bảo mật OTP, session, upload
- seed dữ liệu demo
- triển khai production lên Vercel + PostgreSQL

---

## 8. Kế hoạch kiểm thử

### 8.1 Kiểm thử chức năng

- đăng ký tài khoản
- xác thực OTP
- đăng nhập / đăng xuất
- tạo kế hoạch AI
- thêm vào giỏ hàng
- checkout trực tiếp
- liên hệ chủ đồ
- thanh toán subscription

### 8.2 Kiểm thử dữ liệu

- ràng buộc unique
- khóa ngoại
- thời hạn session/OTP
- tính đúng số lượng tồn kho
- trạng thái đơn hàng

### 8.3 Kiểm thử giao diện

- responsive desktop/mobile
- dark mode
- khả năng đọc tiếng Việt
- animation không gây lag

### 8.4 Kiểm thử bảo mật

- không lộ OTP trong production logs
- không cho user tự mua sản phẩm của chính mình
- không cho checkout vượt tồn kho
- xác minh phân quyền server-side

---

## 9. Rủi ro và phương án giảm thiểu

### 9.1 Rủi ro về xác thực

**Rủi ro:** nhiều cơ chế auth đồng thời có thể gây lệch trạng thái.  
**Giảm thiểu:** chuẩn hóa thành một pipeline xác thực chính, chỉ giữ fallback khi cần.

### 9.2 Rủi ro về tồn kho và checkout

**Rủi ro:** race condition khi nhiều người đặt cùng một sản phẩm.  
**Giảm thiểu:** dùng transaction, reserve quantity và khóa logic đặt hàng.

### 9.3 Rủi ro về mail/OTP

**Rủi ro:** gửi mail thất bại hoặc để lộ mã OTP trong log.  
**Giảm thiểu:** chỉ log ở môi trường dev, thêm retry và alert.

### 9.4 Rủi ro về AI

**Rủi ro:** output AI không ổn định, khó kiểm soát schema.  
**Giảm thiểu:** validate bằng `zod`, lưu JSON chuẩn hóa và giới hạn đầu vào.

### 9.5 Rủi ro về trải nghiệm người dùng

**Rủi ro:** landing page nhiều thông tin, tính năng chưa hoàn thiện có thể gây hiểu lầm.  
**Giảm thiểu:** đồng bộ nội dung marketing với trạng thái thật của sản phẩm.

---

## 10. Chiến lược triển khai và vận hành

### 10.1 Môi trường phát triển

- Node.js
- Next.js dev server
- PostgreSQL local hoặc cloud
- Prisma migrations

### 10.2 Môi trường production

- Deploy Next.js trên Vercel
- PostgreSQL managed service
- SMTP provider thật cho OTP
- cấu hình biến môi trường an toàn

### 10.3 Quy trình release

1. cập nhật nhánh phát triển
2. chạy lint/test
3. kiểm tra migration
4. seed dữ liệu nếu cần
5. deploy preview
6. xác nhận production

---

## 11. Kết luận

EcoEvent Hub là một dự án có định hướng rõ ràng, kết hợp giữa công nghệ web hiện đại, AI và mô hình kinh tế chia sẻ để giải quyết bài toán tổ chức sự kiện bền vững. Với kiến trúc Next.js + Prisma + PostgreSQL, dự án có nền tảng tốt để tiếp tục mở rộng thành một hệ thống hoàn chỉnh hơn về thương mại, AI và quản trị.

Kế hoạch kỹ thuật đề xuất tập trung vào ba ưu tiên chính: **ổn định nền tảng**, **hoàn thiện nghiệp vụ lõi**, và **mở rộng tính năng thông minh**. Nếu triển khai đúng lộ trình, EcoEvent Hub có thể trở thành một nền tảng thực tế, có giá trị ứng dụng cao trong bối cảnh tổ chức sự kiện xanh và tiết kiệm tài nguyên.
