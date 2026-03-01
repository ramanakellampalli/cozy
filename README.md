# Cozy – Property Management PWA

A modern, mobile-first property management Progressive Web App built with Next.js 15, Firebase, and TailwindCSS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| Icons | lucide-react |
| Animations | framer-motion |
| Backend | Firebase (Auth, Firestore, Storage) |
| PWA | next-pwa |
| Linting | ESLint + Prettier |

## Project Structure

```
cozy/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons (192, 512)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout + providers
│   │   ├── globals.css        # CSS variables + Tailwind
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── auth/
│   │   │   └── page.tsx       # Sign in / Sign up (/auth)
│   │   ├── owner/
│   │   │   └── dashboard/
│   │   │       └── page.tsx   # Owner dashboard (/owner/dashboard)
│   │   └── tenant/
│   │       └── home/
│   │           └── page.tsx   # Tenant home (/tenant/home)
│   ├── components/
│   │   ├── AppShell.tsx       # Layout shell (sidebar + bottom nav)
│   │   ├── Sidebar.tsx        # Desktop sidebar nav
│   │   ├── BottomNav.tsx      # Mobile bottom navigation
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx # Auth context + Firebase wiring
│   │   └── ui/                # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── tabs.tsx
│   │       ├── dialog.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── hooks/
│   │   ├── useRequireAuth.ts  # Route protection hook
│   │   └── use-toast.ts       # Toast state hook
│   ├── lib/
│   │   ├── firebase.ts        # Firebase initialization
│   │   └── utils.ts           # cn() utility
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── .env.local.example         # Environment variable template
├── .eslintrc.json
├── .prettierrc
├── next.config.ts             # Next.js + PWA config
├── tailwind.config.ts
└── tsconfig.json
```

## Getting Started

### 1. Prerequisites

- Node.js 18+
- npm 9+ (or pnpm / yarn)
- A Firebase project ([create one here](https://console.firebase.google.com))

### 2. Clone and install

```bash
git clone <your-repo-url>
cd cozy
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Firebase project values. You can find them in:
**Firebase Console → Project Settings → Your Apps → Web App → SDK setup and configuration**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Configure Firebase

In the Firebase Console:

1. **Authentication** → Enable Email/Password sign-in method
2. **Firestore Database** → Create database (start in test mode for development)
3. **Storage** → Create a storage bucket (optional, for file uploads later)

#### Firestore Security Rules (recommended for dev)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Code quality

```bash
# Lint
npm run lint

# Format
npm run format
```

### 7. Build for production

```bash
npm run build
npm run start
```

## Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# (repeat for each env var)
```

### Firebase Hosting (alternative)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # choose "out" as public dir, configure as SPA
npm run build
firebase deploy
```

## Role System

| Role | Default Route | Description |
|------|--------------|-------------|
| `OWNER` | `/owner/dashboard` | Landlords / Property managers |
| `TENANT` | `/tenant/home` | Renters / Tenants |

- Role is selected at signup and stored in Firestore (`users/{uid}.role`)
- `useRequireAuth(role?)` hook handles route protection and redirects
- Owners trying to access tenant routes (and vice versa) are redirected

## PWA Features

- Web App Manifest (`/public/manifest.json`)
- Service Worker via `next-pwa` (auto-generated at build time)
- Service worker is **disabled** in development to avoid caching issues
- Replace placeholder icons in `/public/icons/` with real PNG icons for production

### Generating real icons

Use [realfavicongenerator.net](https://realfavicongenerator.net) or [maskable.app](https://maskable.app) to generate production-quality icons from your logo. Place the `icon-192x192.png` and `icon-512x512.png` files in `/public/icons/`.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ⬜ | Firebase Analytics (optional) |

## License

MIT
