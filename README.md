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
1. Create `.env` file in project root
2. Add necessary environment variables:
   ```
   VITE_SUPABASE_KEY= your_supabase_anon_key
   VITE_SUPABASE_URL= your_supabase_project_url
   VITE_GA_TRACKING_ID= your_google_analytics_id
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

