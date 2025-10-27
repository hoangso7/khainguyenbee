# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_DOMAIN=khainguyenbee.io.vn
ARG VITE_APP_NAME="Quản lý tổ ong"
ARG VITE_VERSION=2.0.0
ARG VITE_COMPANY_NAME=KhaiNguyenBee
ARG VITE_API_URL=http://localhost:8000/api

# Set environment variables for build
ENV VITE_DOMAIN=$VITE_DOMAIN
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_VERSION=$VITE_VERSION
ENV VITE_COMPANY_NAME=$VITE_COMPANY_NAME
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
