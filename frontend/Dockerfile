# Base image dùng Node 18 LTS
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file phụ thuộc trước để tăng hiệu quả cache
COPY package*.json ./

# Xoá cache cũ và cài lại toàn bộ package với peer-deps fix + thêm pdf-lib
RUN rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps && \
    npm install pdf-lib

# Sao chép toàn bộ source vào container
COPY . .

# Mở cổng 3000 (React hoặc Vite)
EXPOSE 3000

# Khởi động server ở chế độ dev
CMD ["npm", "run", "dev"]
