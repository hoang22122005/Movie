# 🎬 Movie Stream - Fullstack Movie Streaming Web Application

Chào mừng bạn đến với dự án **Movie Stream**. Đây là một ứng dụng xem phim trực tuyến đầy đủ tính năng, tích hợp hệ thống thanh toán nâng cấp VIP và gợi ý phim thông minh.

## 🛠 Công nghệ sử dụng

- **Backend**: Java Spring Boot, Spring Security (JWT), Hibernate/JPA.
- **Database**: PostgreSQL (Supabase/Local).
- **Frontend**: React (TypeScript, Vite), Tailwind CSS, Lucide Icons, ShadcnUI.
- **Thanh toán**: VNPay Sandbox Integration.
- **AI/ML**: Python (Flask) cho hệ thống gợi ý phim (Recommendation System).

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

Dưới đây là các bước để chạy dự án trên máy cục bộ của bạn.

### 1. Clone dự án

```bash
git clone https://github.com/hoang22122005/Movie.git
cd Movie
```

### 2. Cấu hình Backend (Java Spring Boot)

1.  Di chuyển vào thư mục backend:
    ```bash
    cd movie_backend
    ```
2.  Tạo file `.env` từ file mẫu:
    ```bash
    cp .env.example .env
    ```
3.  Mở file `.env` và điền thông tin cấu hình:
    - **DB_URL/USERNAME/PASSWORD**: Cấu hình database PostgreSQL của bạn.
    - **JWT_SECRET**: Chuỗi ký tự bất kỳ để bảo mật Token.
    - **VNP_TMN_CODE & VNP_HASH_SECRET**: Lấy từ trang quản lý VNPay Sandbox.
    - **GOOGLE_CLIENT_ID**: Cấu hình để sử dụng Login bằng Google.
4.  Khởi chạy Backend (Yêu cầu Java 17+):
    - Dùng IDE (IntelliJ, Eclipse) và chạy file chính: `MovieBackendApplication.java`.
    - Hoặc dùng Maven Wrapper:
      ```bash
      ./mvnw spring-boot:run
      ```

### 3. Cấu hình Frontend (React Vite)

1.  Mở một terminal mới và di chuyển vào thư mục frontend:
    ```bash
    cd front_end/movie_frontend
    ```
2.  Cài đặt các thư viện cần thiết:
    ```bash
    npm install
    ```
3.  Cấu hình môi trường:
    - Tạo file `.env` và thiết lập `VITE_API_BASE_URL=http://localhost:8080/api`
4.  Khởi chạy giao diện:
    ```bash
    npm run dev
    ```
5.  Truy cập địa chỉ: `http://localhost:5173`

### 4. Cấu hình hệ thống Gợi ý (AI - Optional)

1.  Di chuyển vào thư mục AI:
    ```bash
    cd movie-recommender-ai
    ```
2.  Cài đặt môi trường ảo và dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Chạy server Flask:
    ```bash
    python app.py
    ```

---

## 🔑 Tính năng chính

- [x] Đăng nhập/Đăng ký thường & Đăng nhập Google.
- [x] Xem phim chất lượng cao với tích hợp Trailer.
- [x] Hệ thống nâng cấp tài khoản VIP qua VNPay.
- [x] Gợi ý phim thông minh dựa trên sở thích người dùng.
- [x] Quản lý Watchlist và Lịch sử xem phim.
- [x] Đánh giá và bình luận phim.

## 💳 Testing (VNPay Sandbox)

Để thử nghiệm tính năng thanh toán VIP, bạn có thể sử dụng thẻ test của ngân hàng NCB:
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mã OTP**: `123456`

---

## 📬 Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ qua email: `Daodanghoang2005@gmail.com`

**Chúc bạn có những trải nghiệm tuyệt vời với Movie Stream!** 🎥✨
