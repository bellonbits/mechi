# <img src="public/logo.png" width="40" height="40" align="center" /> Mechi — Premium Dating for Modern Connections

Mechi is a high-fidelity, mobile-first dating application designed with a sleek glassmorphic aesthetic. Built for speed, security, and real-world interactions, Mechi offers a premium experience featuring real-time matching, instant messaging, and seamless M-Pesa payment integration.

![Mechi Preview](https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&auto=format&fit=crop)

## ✨ Features

- **🎯 Goal-Driven Dating**: Specialized matching categories (Serious, Casual, Friends) to find exactly what you're looking for.
- **⚡ Real-Time Conversations**: Instant messaging powered by Supabase Realtime with typing indicators and optimistic UI updates.
- **🛡️ Secure Onboarding**: Multi-step profile setup with image uploads and mandatory verification fields.
- **💎 Premium Experience**: M-Pesa STK Push integration for instant subscription activation, unlocking unlimited swipes and "See Who Likes You."
- **🌑 Cinematic Design**: A deep-purple dark mode with glassmorphic components, vibrant gradients, and smooth Framer Motion animations.
- **📱 Mobile Optimized**: Built with Capacitor for native iOS/Android performance, including notch handling and safe-area compatibility.
- **🔒 Privacy First**: Secure account deletion using PostgreSQL RPCs to permanently wipe all user data on request.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend / Auth**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Mobile**: Capacitor
- **Payments**: Lipana (M-Pesa STK Push)
- **Deployment**: Vercel

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/bellonbits/mechi.git
cd mechi
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root and add your Supabase and Lipana credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_LIPANA_PUBLIC_KEY=your_lipana_public_key
```

### 4. Database Setup
1. Go to your **Supabase SQL Editor**.
2. Run the latest migration script located at `supabase/migrations/20240429000000_complete_schema.sql`.
3. This will create all tables, RLS policies, and real-time triggers.

### 5. Run locally
```bash
npm run dev
```

## 📦 Deployment

### Vercel (Web)
This project is pre-configured for Vercel with a `vercel.json` file for SPA routing.
1. Connect your GitHub repository to Vercel.
2. Add your environment variables in the Vercel dashboard.
3. Deploy!

### Capacitor (Native Mobile)
To build for iOS or Android:
```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios # or android
```

## 🔐 Security & Compliance

Mechi is built with GDPR and CCPA best practices in mind, including:
- **Granular Cookie Consent**: Industry-grade banner for user privacy control.
- **Data Deletion**: Complete profile wipe via the "Delete Account" feature.
- **Legal Infrastructure**: Professional Terms of Service, Privacy Policy, and Data Practice documents included.

## 📄 License

This project is private and proprietary. All rights reserved.

---

<p align="center">Made with ❤️ for modern dating.</p>
