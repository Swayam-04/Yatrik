# 🧭 YATRIK AI 2.0 — Your All-in-one Travel Recommendation & Itinerary Kit

> **Plan Smart • Travel Safe • Explore Together**

YATRIK is a next-generation AI-powered travel ecosystem designed for modern global explorers, solo travelers, and community members. Built with Next.js 15, React 19, Clerk Authentication, Google Maps Platform, Groq AI (Llama 3.3 70B), and PostgreSQL Prisma ORM, YATRIK replaces fragmented travel apps with intelligent itineraries, real-time budget forecasting, Women's Safety Mode, safe route navigation, and community-driven scam alerts.

---

## 🌟 Key Features

### 🔐 Mandatory Clerk Authentication & Security
- **Strict Route & API Protection**: Unauthenticated users can access public pages (Landing, About, Features, Pricing, Contact, Privacy, Terms), while core features require login.
- **Custom Auth Interceptor Modal**: Clicking feature triggers when logged out presents a sleek *"Login Required"* modal with Clerk `Sign In` / `Sign Up` triggers.
- **User Data Isolation**: Database queries for trips, chats, bookmarks, reviews, rewards, and notifications are strictly scoped to the authenticated user ID.
- **Admin Panel Governance**: Dedicated `/admin` governance portal protected with `403 Forbidden` role-based access control.

### 📍 Google Maps Style Global Location Search
- **Worldwide Search**: Search ANY city, village, street, landmark, hotel, restaurant, airport, or attraction globally.
- **Google Places Autocomplete**: Real-time suggestion dropdown with 300ms debouncing, category icons, voice search, and keyboard arrow navigation.
- **Browser Geolocation & World Map Fallback**: Requests location access on mount; if denied, displays a global world map view with a clear overlay prompt.
- **Search History & Pinning**: LocalStorage-persisted recent searches, pinned locations, and favorite places with pin/delete actions.
- **Dynamic Map Updates**: Instantly centers map, zooms in, drops markers, updates weather, calculates safety scores, and fetches nearby places without page refresh.

### 🤖 AI Trip Planner & AI Assistant Chatbot
- **Multi-Day Itineraries**: Hyper-personalized day-by-day travel plans generated in seconds using Groq Llama 3.3 70B.
- **24/7 AI Travel Assistant**: Floating and full-screen AI chat widget providing instant destination advice, local customs, and translation help.

### 🛡️ Women's Safety Mode & Safe Routes
- **Live Safety Index (0–100)**: Real-time safety ratings for destinations and routes.
- **Well-Lit Safe Routing**: Prefers well-lit main corridors, active police posts, and verified safe areas.
- **1-Tap Emergency SOS**: Instant emergency siren alert with live location sharing dispatch.

### 💰 Smart Budget Predictor & YATRIK Rewards
- **Budget Breakdown**: Estimates costs for stays, food, activities, flights, and local transit.
- **YATRIK Passport & Coins**: Earn YATRIK Coins for submitting verified reviews and scam alerts.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React Icons](https://lucide.dev/)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/nextjs`)
- **AI Engine**: [Groq Cloud SDK](https://groq.com/) (`llama-3.3-70b-versatile`)
- **Maps & Geolocation**: Google Maps JavaScript API, Google Places API, Geocoding API, Mapbox Directions
- **Database & ORM**: PostgreSQL, [Prisma ORM v6](https://www.prisma.io/)
- **State & Fetching**: TanStack React Query v5, Axios

---

## 📋 Prerequisites

Make sure you have the following installed on your machine before running the project:

- **Node.js**: `v18.x` or `v20.x` or higher
- **npm** (v9+) or **pnpm** / **yarn**
- **Git**: Latest version
- **PostgreSQL Database**: Local installation or cloud-hosted instance (e.g. Supabase, Neon, Railway)

---

## 🚀 Installation & Setup Guide

Follow these step-by-step instructions to get YATRIK running locally on your machine.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Swayam-04/Yatrik.git
cd Yatrik
```

### Step 2: Install Project Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and fill in your API credentials:

```env
# ===================================================
# YATRIK Environment Configuration
# ===================================================

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Groq Cloud AI Configuration
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Google Maps Platform API Key
GOOGLE_MAPS_API_KEY=AIzaSy...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Mapbox Access Token (Optional)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# OpenWeather API Key (Optional)
OPENWEATHER_API_KEY=...

# PostgreSQL Database (Supabase / Local PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/yatrik?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/yatrik?schema=public"
```

### Step 4: Setup Database & Prisma ORM

Generate the Prisma Client and sync the database schema:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to PostgreSQL database
npm run prisma:push

# (Optional) Seed initial database data
npm run db:seed
```

### Step 5: Run the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to access YATRIK!

---

## 📁 Directory Structure

```text
YATRIK/
├── prisma/
│   ├── schema.prisma      # Prisma PostgreSQL Database Schema
│   └── seed.ts            # Initial Database Seed Script
├── public/                # Static Media & Icons
├── src/
│   ├── app/               # Next.js 15 App Router Routes
│   │   ├── (auth)/        # Clerk Sign-In & Sign-Up Routes
│   │   ├── about/         # Public About Page
│   │   ├── admin/         # Protected Admin Panel
│   │   ├── api/           # Protected Backend API Routes
│   │   │   ├── ai/        # Groq AI Service Routes
│   │   │   ├── external/  # Google Places, Routes, Weather Proxy API
│   │   │   └── trips/     # User Trips CRUD API
│   │   ├── assistant/     # AI Assistant Full View
│   │   ├── budget/        # Smart Budget Predictor
│   │   ├── community/     # Traveler Community & Scam Directory
│   │   ├── dashboard/     # Explorer Main Dashboard
│   │   ├── features/      # Public Features Overview Page
│   │   ├── map/           # Google Safe Map Canvas
│   │   ├── plan/          # AI Trip Planner Page
│   │   ├── profile/       # User Profile & Rewards Passport
│   │   └── safety/        # Women's Safety Mode Center
│   ├── components/        # Reusable UI Components
│   │   ├── ai/            # Floating AI Chatbot
│   │   ├── auth/          # Auth Modal & Auth Context
│   │   ├── google-map/    # Global Search Bar, Google Map Container
│   │   └── layout/        # Navbar & Footer
│   ├── hooks/             # Custom React Hooks (useSearchHistory, etc.)
│   ├── lib/               # Utility functions, Prisma Client, Validations
│   └── middleware.ts      # Clerk Route Protection Middleware
├── .env.example           # Environment Template
├── package.json           # Project Scripts & Dependencies
└── README.md              # Project Documentation
```

---

## 🧪 Build & Production Verification

To compile an optimized production build and verify type validity:

```bash
npm run build
npm run start
```

---

## 📄 License

This project is released under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out [issues](https://github.com/Swayam-04/Yatrik/issues).

---

<p center="text-center">
Crafted with ❤️ for modern global explorers by <strong>YATRIK Team</strong>.
</p>
