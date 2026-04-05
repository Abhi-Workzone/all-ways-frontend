# allWays Frontend

Next.js (App Router) + TailwindCSS + TypeScript frontend for the allWays home services platform MVP.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom Glassmorphism & Gradient design system)
- **State Management**: Zustand (Local Storage persistence)
- **Data Fetching**: React Query + Axios
- **Form Handling**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather, FontAwesome)
- **Notifications**: React Hot Toast

## Features Overview

1. **Premium Landing Page**: Highly interactive hero section, animated service cards, how-it-works workflow.
2. **Authentication Flow**: Login, Signup, OTP Verification matching the backend JWT logic.
3. **User Dashboard**:
   - Layout with responsive sidebar
   - Book new service requests from verified options (Date & Time natively handled)
   - History page tracking previous requests with status badges
4. **Admin Dashboard (PRO)**:
   - Dedicated restricted route, custom PRO branding
   - Real-time Service Request management with filtering
   - Full CRUD over platform Services (Create, inline edit, delete, toggle active/coming soon flags)

## Project Structure

```
src/
  ├── app/
  │   ├── admin/           # Admin-only restricted layout & routes
  │   ├── dashboard/       # User-restricted layout & routes
  │   ├── login/           # Auth views
  │   ├── signup/          # Auth views
  │   ├── verify-otp/      # OTP code submission
  │   ├── globals.css      # Core Design System, Animations, Variables
  │   ├── layout.tsx       # Root layout + Providers
  │   └── page.tsx         # Modern Landing Page (Hero, Testimonials, CTA)
  ├── components/
  │   ├── navbar.tsx       # Smart top-nav handling auth state
  │   ├── footer.tsx       # Branding footer
  │   └── providers.tsx    # React Query + Toast Wrapper
  ├── lib/
  │   ├── api.ts           # Axios instance with Auto Auth / Refresh Token Injection
  │   └── services.ts      # Dedicated abstractions over backend API endpoints
  └── store/
      └── auth.store.ts    # Zustand logic for user session & JWTs
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Copy the example environment variables or ensure correct URL:
```bash
cp .env.local.example .env.local
```
*(Ensure `NEXT_PUBLIC_API_URL` points to `http://localhost:5000/api`)*

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Design Notes

The UI was crafted specifically with modern constraints, completely avoiding standard Tailwind generic grays.
- Dominant colors: Deep Space (`#0a0a0f`), Neon Purple (`#6C63FF`), Accents in Pink/Cyan.
- Animations: Custom keyframes defined in `globals.css` ensuring performant float effects & pulse glows.
