# =========================================================================
# DOCKERFILE CHO FRONTEND (React / Vite) - MULTI-STAGE BUILD
# Chuẩn hóa sản phẩm khi deploy thực tế & Báo cáo đồ án
# =========================================================================

# --- BƯỚC 1: BUILD MÃ NGUỒN REACT (Stage 1) ---
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build ứng dụng sang các file HTML/JS/CSS tĩnh (thường nằm ở thư mục /app/dist)
RUN npm run build


# --- BƯỚC 2: SERVE BẰNG NGINX (Stage 2 - Production Stage) ---
# Nginx là Web Server xử lý các file tĩnh với hiệu năng tối ưu bậc nhất hiện nay
FROM nginx:1.25-alpine

# Copy toàn bộ file tĩnh đã build từ Stage 1 vào thư mục phục vụ mặc định của Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx riêng để xử lý Route ảo của Single Page Application
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Chạy Nginx ở chế độ background (mặc định)
CMD ["nginx", "-g", "daemon off;"]
