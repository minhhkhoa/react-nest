FROM node:20-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Copy package.json trước để cache dependency
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copy toàn bộ source code vào /app
COPY . .

# Build NestJS (dist sẽ nằm trong /app/dist)
RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
