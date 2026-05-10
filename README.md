# TicketRush - Online Ticket Booking Platform

TicketRush là đồ án INT3306 (Phát triển ứng dụng web - Spring 2026), mô phỏng hệ thống bán vé sự kiện chịu tải cao với các tính năng đặt ghế realtime, tránh chấp dữ liệu an toàn, và Virtual Queue.

## 1) Tổng quan dự án

Mục tiêu của TicketRush là xử lý tình huống flash-sale: nhiều người dùng cùng đặt một số ghế giới hạn trong thời gian ngắn mà vẫn đảm bảo:

- Không bán trùng ghế (database transaction + row locking)
- Cập nhật trạng thái ghế realtime (Socket.IO)
- Tự động nhả ghế hết hạn giữ chỗ (cron/background job)
- Chịu tải tốt hơn bằng phòng chờ ảo (Virtual Queue với Redis)

## 2) Chức năng nghiệp vụ

### Customer
- Đăng ký, đăng nhập, quên mật khẩu, đặt lại mật khẩu
- Xem danh sách sự kiện và chi tiết sự kiện
- Chọn ghế, giữ chỗ, hủy giữ chỗ, checkout
- Xem vé đã mua (QR code)
- Cập nhật hồ sơ cá nhân

### Admin
- Tạo/sửa/xóa sự kiện
- Cấu hình zone ghế (hàng, cột, giá)
- Theo dõi dashboard thống kê doanh thu và tỉ lệ lấp đầy

## 3) Yêu cầu kỹ thuật đã áp dụng (mapping với đề bài)

- **Sơ đồ ghế trực quan:** frontend render seat map theo zone/row/seat.
- **Realtime update:** sử dụng Socket.IO để broadcast `seat_updated`, `seat_sold_realtime`, `queue_position`, `queue_passed`.
- **Concurrency control:** xử lý giữ ghế bằng transaction và row-level lock (`FOR UPDATE`) ở backend.
- **Vòng đời ghế/vé:** `AVAILABLE -> LOCKED -> SOLD` (và có cơ chế release ghế hết hạn giữ chỗ).
- **Auto release:** cron job quét lock hết hạn định kỳ.
- **Virtual Queue:** giới hạn số user active và xếp hàng bằng Redis.

## 4) Kiến trúc hệ thống

### Backend (Node.js + Express + Prisma + PostgreSQL + Redis + Socket.IO)
- Kiểu tổ chức: `routes -> controllers -> services -> repositories`
- Các module chính:
  - Auth/Access
  - Event
  - Booking
  - Dashboard
  - User Profile

### Frontend (React + Vite)
- `react-router-dom` cho routing
- `ProtectedRoute` cho route cần đăng nhập/admin
- Kết nối API qua Axios
- Kết nối realtime qua `socket.io-client`

## 5) Cấu trúc thư mục

```text
Ticket-Rush-Web/
|- Backend/
|  |- prisma/
|  |- src/
|  |  |- routes/
|  |  |- controllers/
|  |  |- services/
|  |  |- repositories/
|  |  |- middleware/
|  |  |- sockets/
|  |  |- config/
|  |  \- utils/
|  \- server.js
|- Frontend/
|  |- src/
|  |  |- pages/
|  |  |- components/
|  |  \- lib/
|  \- vite.config.js
\- README.md
````

## 6) Luồng nghiệp vụ chính

### 6.1 Luồng đặt vé end-to-end

1. User đăng nhập và vào trang chi tiết sự kiện.
2. User tham gia queue (`join_queue`) nếu event bật queue.
3. Khi được cấp quyền (`queue_passed`), user chọn ghế.
4. FE gọi API `hold` -> BE lock ghế trong transaction.
5. Trong thời gian hold, user checkout.
6. Checkout thành công -> tạo order/ticket, ghế thành `SOLD`.
7. Nếu hết hạn hold mà chưa checkout -> cron tự động nhả ghế.

### 6.2 Luồng queue ảo

1. User gửi yêu cầu vào queue theo `eventId`.
2. Nếu slot active còn -> cấp token đặt vé ngay.
3. Nếu hết slot -> đưa vào waiting queue (Redis sorted set).
4. Worker xử lý queue định kỳ, đẩy user vào active theo lô.
5. Socket push vị trí mới hoặc thông báo đã được vào đặt vé.

### 6.3 Luồng admin quản trị sự kiện

1. Admin tạo event.
2. Khai báo zones (số hàng, số ghế/hàng, giá).
3. Publish/on-sale.
4. Theo dõi dashboard và doanh thu realtime.

## 7) API chính

Base backend: `http://localhost:3000`

### Access

* `POST /v1/api/signup`
* `POST /v1/api/login`
* `POST /v1/api/forgot-password`
* `POST /v1/api/reset-password/:token`
* `POST /v1/api/refresh-token`
* `GET /v1/api/me`
* `POST /v1/api/logout`

### Event

* `GET /v1/api/event`
* `GET /v1/api/event/:id`
* `POST /v1/api/event/create` (ADMIN)
* `PUT /v1/api/event/update/:id` (ADMIN)
* `DELETE /v1/api/event/delete/:id` (ADMIN)

### Booking

* `POST /v1/api/booking/hold`
* `POST /v1/api/booking/cancel-hold`
* `POST /v1/api/booking/checkout`
* `GET /v1/api/booking/my-tickets`

### Dashboard

* `GET /v1/api/dashboard/stats` (ADMIN)

### User

* `GET /v1/api/users/profile`
* `PUT /v1/api/users/profile`

## 8) Socket events

* Client -> Server:

  * `toggle_seat`
  * `join_queue`
  * `leave_queue`
  * `register_seatmap`
* Server -> Client:

  * `sync_seats`
  * `seat_updated`
  * `seat_sold_realtime`
  * `queue_position`
  * `queue_passed`

## 9) Công nghệ sử dụng

* Frontend: React, Vite, TailwindCSS, Axios, Socket.IO Client, Recharts
* Backend: Node.js, Express, Prisma, PostgreSQL, Redis, Socket.IO, node-cron
* Khác: Cloudinary (upload), JWT, rate limiting

## 10) Hướng dẫn chạy local

### 10.1 Yêu cầu hệ thống

* Node.js 18+ (khuyến nghị Node.js 20+)
* PostgreSQL
* Redis

### 10.2 Cài đặt Backend

```bash
cd Backend
npm install
```

Tạo file `.env` trong `Backend` (tham khảo mẫu bên dưới), sau đó chạy:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 10.3 Cài đặt Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend mặc định: `http://localhost:5173`

## 11) Mẫu biến môi trường

### Backend `.env` (gợi ý)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ticketrush

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=2d

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
MAX_ACTIVE_USERS=50

FRONTEND_URL=http://localhost:5173
FRONTEND_ORIGINS=http://localhost:5173

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_pass

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Frontend `.env` (gợi ý)

```env
VITE_API_URL=http://localhost:3000/v1/api
VITE_SOCKET_URL=http://localhost:3000
```

## 12) Bảo mật và khả năng mở rộng

* Rate limiter cho auth/booking/global để giảm spam
* Token + role middleware để bảo vệ endpoint
* Queue và release lock giúp hệ thống ổn định khi có đột biến truy cập
* Có thể mở rộng bằng:

  * Tách queue worker thành service riêng
  * Thêm cache read-heavy cho event catalog
  * Bổ sung monitor/log tracing
