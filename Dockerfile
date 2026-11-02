# =========================================
# Stage 1: Build với Node.js 20 (Thay cho Node 18)
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng layer cache
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Khai báo nhận biến môi trường cho Vite khi build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy toàn bộ source và build
COPY . .
RUN npm run build

# =========================================
# Stage 2: Serve với Nginx Alpine
# =========================================
FROM nginx:alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]