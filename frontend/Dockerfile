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
ARG REACT_APP_DOMAIN=khainguyenbee.io.vn
ARG REACT_APP_NAME="Quản lý tổ ong"
ARG REACT_APP_VERSION=2.0.0
ARG REACT_APP_COMPANY_NAME=KhaiNguyenBee

# Set environment variables for build
ENV REACT_APP_DOMAIN=$REACT_APP_DOMAIN
ENV REACT_APP_NAME=$REACT_APP_NAME
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV REACT_APP_COMPANY_NAME=$REACT_APP_COMPANY_NAME

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
