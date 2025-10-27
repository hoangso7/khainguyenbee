# 🐝 KBee Manager Frontend

React frontend cho hệ thống quản lý tổ ong KBee Manager.

## ✨ Tính năng

- 🏠 **Dashboard**: Quản lý tổ ong với giao diện thân thiện
- 📱 **Responsive**: Tối ưu cho mobile và desktop
- 🎨 **Modern UI**: Material-UI components với theme mật ong
- 🔐 **Authentication**: JWT-based login system
- 📊 **Statistics**: Thống kê tổ ong real-time
- 📄 **Export**: Xuất PDF và QR codes

## 🚀 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool và dev server
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client
- **React Router** - Routing
- **JWT** - Authentication

## 🔧 Development

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt
```bash
cd frontend
npm install
```

### Chạy development
```bash
npm run dev
```

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📁 Cấu trúc

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── api/           # API client
│   ├── utils/         # Utility functions
│   ├── theme/         # MUI theme configuration
│   └── App.jsx        # Main app component
├── public/            # Static assets
└── package.json       # Dependencies
```

## 🔗 API Integration

Frontend kết nối với backend qua REST API:
- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT tokens
- **Endpoints**: `/auth/*`, `/beehives/*`, `/stats`

## 🎨 Theme

Sử dụng Material-UI theme với màu sắc mật ong:
- **Primary**: Amber (#FFC107)
- **Secondary**: Orange (#FF9800)
- **Background**: Cream (#FFF8E1)

## 📱 Responsive Design

- **Mobile**: Tối ưu cho màn hình nhỏ
- **Tablet**: Layout adaptive
- **Desktop**: Full-featured interface

## 🔐 Authentication

- JWT token storage trong localStorage
- Auto-refresh tokens
- Protected routes
- Login/logout functionality

## 🚀 Deployment

Frontend được build thành static files và serve qua nginx trong Docker container.

---

**KBee Manager Frontend** - Giao diện hiện đại cho quản lý tổ ong! 🐝✨