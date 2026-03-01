# TrimLink 🔗✂️
## Live Links
- **Vercel**: [TrimLink](https://trimlynk.com)
- **Netlify**: [TrimLink](https://trimlink.netlify.app/)

## Overview
TrimLink is an advanced URL management platform that simplifies link sharing, tracking, and optimization for individuals and businesses. Transform long, complex URLs into clean, memorable links while gaining powerful analytics and customization options.

## 🚀 Features
- **URL Shortening**: Create concise, shareable links instantly
- **Custom URL Creation**: Design personalized, branded short links
- **Advanced Analytics**: Track link performance, clicks, and user engagement
- **Link Tree Builder**: Consolidate multiple links in one profile
- **QR Code Generation**: Convert links to scannable QR codes
- **Secure Authentication**: Protect your links with robust user accounts

## 🛠 Technologies

### Frontend
- **React.js**: Dynamic, responsive user interfaces
- **Tailwind CSS**: Rapid, utility-first styling
- **Framer Motion**: Smooth, interactive animations
- **Shadcn UI**: Modern, accessible component library

### Backend
- **Supabase**: Real-time database and authentication

## 📋 Prerequisites
- **Node.js**: v16+ recommended
- **npm**: v8+ 
- Modern web browser
- GitHub account (for contributions)

## 🔧 Installation & Setup

### Clone Repository
```bash
git clone https://github.com/Anky9972/urlshortner.git
cd urlshortner
```

### Install Dependencies
```bash
npm install
```

### Environment Configuration
1. Copy `.env.example` to `.env` in the project root
2. Fill in your environment variables:
   ```
   # Frontend (Vite)
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   VITE_APP_DOMAIN=trimlynk.com
   VITE_APP_URL=https://trimlynk.com
   VITE_API_URL=http://localhost:3001

   # Server
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=change-me-to-a-strong-random-secret
   FRONTEND_URL=http://localhost:5173

   # Database
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```
### Running the Application
```bash
# Development Server
npm run dev

# Production Build
npm run build

# Run Tests
npm test
```

## 🌐 Deployment
- **Vercel**: Recommended for React applications
- **Netlify**: Alternative hosting platform

## 📊 Project Structure
```
trimlink/
│
├── public/
├── src/
│   ├── components/
│   ├── db/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── utils/
├── tests/
├── .env
├── package.json
└── README.md
```

