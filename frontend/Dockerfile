# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Projeyi kopyala ve build et
COPY . .

# Vite build-time env var (docker-compose'dan --build-arg ile geçirilir)
ARG VITE_API_URL=http://localhost:8000/api/
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production Stage (Nginx ile servis et)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
