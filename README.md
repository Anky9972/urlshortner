<p align="center">
  <img src="public/images/logo.png" alt="TrimLink Logo" width="80" height="80" />
</p>

<h1 align="center">TrimLink</h1>

<p align="center">
  <strong>Open-source URL shortener with analytics, QR codes, LinkTree builder & more.</strong>
</p>

<p align="center">
  <a href="https://trimlynk.com">Live App</a> &nbsp;·&nbsp;
  <a href="https://github.com/Anky9972/urlshortner/issues">Report Bug</a> &nbsp;·&nbsp;
  <a href="https://github.com/Anky9972/urlshortner/issues">Request Feature</a> &nbsp;·&nbsp;
  <a href="https://trimlynk.com/community">Community</a>
</p>

---

## Overview

TrimLink is a full-stack URL management platform that lets you shorten links, generate QR codes, build link-in-bio pages, and track everything with real-time analytics. Self-hostable, extensible, and free.

## Features

| Category | Highlights |
|----------|-----------|
| **Link Shortening** | Custom slugs, bulk creation, expiry dates, password protection |
| **Analytics** | Click tracking, geo/device/browser stats, referrer data, real-time charts |
| **QR Code Generator** | URL, vCard, Wi-Fi, phone, email — download as PNG/SVG |
| **LinkTree Builder** | Drag-and-drop bio page builder with themes, SEO, and analytics |
| **Teams & Rooms** | Collaborate with teammates, shared dashboards, role-based access |
| **A/B Testing** | Split traffic across link variants, measure conversion |
| **API & Webhooks** | RESTful API with key management, webhook event subscriptions |
| **Retargeting Pixels** | Facebook, Google, TikTok pixel support per link |
| **UTM Builder** | Auto-generate UTM-tagged campaign URLs |
| **Admin Panel** | User management, system metrics, announcements, audit logs |
| **Auth** | Email/password, Google & GitHub OAuth, 2FA, email verification |
| **SEO** | Sitemap, robots.txt, OpenGraph, Twitter Cards, structured data |

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| [React 18](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component library |
| [Framer Motion](https://www.framer.com/motion) | Animations |
| [Recharts](https://recharts.org) | Charts & data visualization |
| [React Router v6](https://reactrouter.com) | Client-side routing |

### Backend
| Tech | Purpose |
|------|---------|
| [Express.js](https://expressjs.com) | HTTP server & API |
| [Prisma](https://www.prisma.io) | ORM & migrations |
| [PostgreSQL](https://www.postgresql.org) | Database |
| [JSON Web Tokens](https://jwt.io) | Authentication |
| [Resend](https://resend.com) | Transactional email |

### Infrastructure
| Tech | Purpose |
|------|---------|
| [Render](https://render.com) | Backend hosting |
| [Netlify](https://www.netlify.com) / [Vercel](https://vercel.com) | Frontend hosting |
| Prisma Migrate | Database migrations |

## Project Structure

```
urlshortner/
├── public/                 # Static assets, manifest, sitemap, robots.txt
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # SQL migrations
├── server/
│   ├── index.cjs           # Express entry point
│   ├── lib/                # Prisma client, email, audit logger
│   ├── middleware/          # Auth, rate limiting, bot detection
│   └── routes/             # API routes (auth, urls, clicks, teams, etc.)
├── src/
│   ├── api/                # Frontend API client modules
│   ├── assets/             # Images & static assets
│   ├── components/         # Reusable UI components
│   │   ├── linktree/       # LinkTree builder & viewer
│   │   ├── room/           # Collaborative rooms
│   │   ├── teams/          # Team management
│   │   ├── notification/   # Notification system
│   │   ├── settings/       # Settings panels
│   │   ├── qr code components/ # QR generator UI
│   │   └── ui/             # shadcn/ui primitives
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # App layout wrapper
│   ├── lib/                # Utility libraries
│   ├── pages/              # Route-level page components
│   └── utils/              # Helper functions
├── package.json            # Frontend dependencies & scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── prisma.config.ts        # Prisma configuration
└── render.yaml             # Render deployment config
```

## Prerequisites

- **Node.js** v22+ (see `.nvmrc` or `engines` field)
- **npm** v10+
- **PostgreSQL** database (local or hosted)
- A modern browser

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Anky9972/urlshortner.git
cd urlshortner
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 3. Set up environment variables

Create a `.env` file in the project root:
```env
# ── Frontend (Vite) ──
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_APP_DOMAIN=trimlynk.com
VITE_APP_URL=https://trimlynk.com
VITE_API_URL=http://localhost:3001

# ── Server ──
PORT=3001
NODE_ENV=development
JWT_SECRET=your-strong-random-secret
FRONTEND_URL=http://localhost:5173

# ── Database ──
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"

# ── OAuth (optional) ──
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ── Email (optional) ──
RESEND_API_KEY=
RESEND_FROM_EMAIL=TrimLink <noreply@yourdomain.com>
```

### 4. Initialize the database
```bash
npx prisma generate
npx prisma migrate deploy
```

### 5. Run the app
```bash
# Both frontend + backend together
npm run dev:all

# Or separately:
npm run dev          # Frontend on :5173
npm run server:dev   # Backend on :3001
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run server` | Start Express server |
| `npm run server:dev` | Start Express with file watching |
| `npm run dev:all` | Run frontend + backend concurrently |
| `npm run lint` | ESLint check |

## API Overview

All endpoints are prefixed with `/api`. Auth endpoints issue JWT tokens.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/urls` | List short links |
| `POST` | `/api/urls` | Create short link |
| `PUT` | `/api/urls/:id` | Update short link |
| `DELETE` | `/api/urls/:id` | Delete short link |
| `GET` | `/api/clicks` | Click analytics |
| `GET/POST/DELETE` | `/api/keys` | API key management |
| `GET/POST` | `/api/teams` | Team management |
| `GET/POST` | `/api/webhooks` | Webhook subscriptions |

Full interactive docs: [trimlynk.com/api-docs](https://trimlynk.com/api-docs)

## Deployment

### Frontend (Netlify / Vercel)
```bash
npm run build
# Deploy the `dist/` folder
```

### Backend (Render)
The repo includes a `render.yaml` for one-click deploy on Render. The server runs from the `server/` directory.

## Contributing

We welcome contributions of all kinds! See the [Community page](https://trimlynk.com/community) for detailed guides.

1. **Fork** the repo
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Commit** with clear messages: `git commit -m "feat: add my feature"`
4. **Push** and open a **Pull Request**

Please report security vulnerabilities privately via email — not through public issues.

## Contact

- **Email**: ankygaur9972@gmail.com
- **GitHub**: [@Anky9972](https://github.com/Anky9972)
- **Twitter / X**: [@anky_vivek](https://x.com/anky_vivek)

## License

This project is open source. See the repository for license details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Anky9972">Anky9972</a>
</p>

