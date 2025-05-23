# QAirline Server

QAirline Server là backend API cho hệ thống đặt vé máy bay QAirline, xây dựng với Bun, Hono và Prisma, hướng tới hiệu suất cao, bảo mật và dễ mở rộng.

## Giới thiệu

Hệ thống này cung cấp các chức năng cốt lõi cho một ứng dụng đặt vé máy bay hiện đại:
- Đăng ký, đăng nhập và phân quyền cho khách hàng & admin
- Tìm kiếm chuyến bay, đặt vé, quản lý vé
- Quản lý chuyến bay, máy bay, tin tức, khuyến mãi cho admin
- Xác thực bảo mật bằng JWT, gửi email tự động qua MailerSend
- Kiến trúc RESTful, dễ tích hợp với các hệ thống frontend hoặc mobile

## Công nghệ sử dụng

- **Runtime**: Bun (hiệu suất cao)
- **Framework**: Hono (web framework nhẹ)
- **ORM**: Prisma (làm việc với PostgreSQL)
- **Xác thực**: JWT
- **Email**: MailerSend API

## Cài đặt nhanh

```bash
# Cài dependencies
bun install

# Tạo file .env với các biến:
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
MAILERSEND_API_KEY="your-key"

# Khởi tạo database
bunx prisma migrate dev

# Chạy server
bun dev
```

Server mặc định chạy tại `http://localhost:3000`

## Một số API chính

### Auth
- `POST /auth/customer/register` - Đăng ký khách hàng
- `POST /auth/customer/login` - Đăng nhập khách hàng
- `POST /auth/admin/login` - Đăng nhập admin
- `POST /auth/customer/forgot-password` - Quên mật khẩu

### Customer  
- `POST /customers/flights` - Tìm kiếm chuyến bay
- `GET /customers/tickets/:customer_id` - Xem vé đã đặt
- `POST /customers/tickets` - Đặt vé
- `PUT /customers/tickets/:reservation_id` - Hủy vé

### Admin
- `POST|PUT|GET /admin/flight` - Quản lý chuyến bay
- `POST /admin/aircraft` - Thêm máy bay
- `POST|PUT|DELETE /admin/news` - Quản lý tin tức
- `POST|DELETE /admin/promotion` - Quản lý khuyến mãi



