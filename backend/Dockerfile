# =========================================================================
# DOCKERFILE CHO BACKEND (Express / Node.js)
# Dễ hiểu để báo cáo & Đóng gói triển khai lên Domain
# =========================================================================

# Bước 1: Sử dụng Image Node.js phiên bản Alpine (siêu nhẹ, tối ưu bảo mật và dung lượng)
FROM node:20-alpine

# Bước 2: Tạo thư mục làm việc bên trong Container
WORKDIR /usr/src/app

# Bước 3: Copy package.json và package-lock.json để cài đặt dependencies trước
# Tận dụng cơ chế Cache của Docker giúp build cực nhanh ở những lần sau
COPY package*.json ./

# Bước 4: Chạy lệnh cài đặt các thư viện cần thiết
RUN npm install

# Bước 5: Copy toàn bộ mã nguồn của phần Backend vào Container
COPY . .

# Bước 6: Mở cổng 3000 của Container để nhận request từ bên ngoài
EXPOSE 3000

# Bước 7: Lệnh mặc định khởi chạy Server ở chế độ phát triển
# Khi deploy lên Domain thực tế, ta có thể đổi sang "node src/app.js" để tối ưu hiệu năng
CMD ["npm", "run", "dev"]
