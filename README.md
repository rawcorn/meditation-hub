# Meditation Hub 🌌

[![Next.js 16](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-orange?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **A modern, distraction-free collective meditation sanctuary and mindfulness progressive web application.**  
> Built with Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, and native browser Web Audio API procedural sound synthesis.

---

## 🧭 Live Demo & Preview

- **Production / Live Web App**: [meditationhub.online](https://meditationhub.online)
- **Repository**: [github.com/rawcorn/meditation-hub](https://github.com/rawcorn/meditation-hub)

---

## 🌟 Key Highlights & Features

- **🌸 Intentions Sanctuary**: Real-time searchable and categorized feed of community intentions with supportive interactions and dedicated prayer/meditation counts.
- **🎧 Zero-Dependency Procedural Audio Engine**: Built on the native browser **Web Audio API**. Generates warm harmonic drone chords, pink noise breath swells, and resonant Tibetan singing bowl harmonics dynamically with mathematical oscillator algorithms — zero external audio assets or bandwidth overhead.
- **🧘 Multi-Ring Breathing Halo**: Fluid SVG/CSS canvas animation synchronized with natural respiratory cadence guides (*Inhale gently*, *Hold softly*, *Exhale slowly*, *Rest in stillness*).
- **⏱️ Accurate Meditation Engine**: Custom elapsed-time calculation engine that accurately measures duration without clock drift or background tab throttling, supporting 5m, 15m, 30m, and freeform sessions.
- **🌍 Timezone-Aware Collective Encounters**: Real-time synchronized worldwide group gatherings automatically localized into the participant's regional device timezone.
- **🌐 Full Bilingual Internationalization (i18n)**: Instant runtime English (`en`) and Spanish (`es`) locale toggling across all screens, modals, tooltips, and dynamic notices without layout shifts.
- **📊 Non-Gamified Personal Practice**: Clean, mindful personal metrics dashboard highlighting monthly presence marks and cumulative mindful minutes without addictive streaks or gamification pressure.
- **📲 Progressive Web App (PWA)**: Installable directly on iOS, Android, macOS, and Windows with offline-ready service worker caching and native standalone window experience.
- **💾 Dual Resilient Data Layer**: Works immediately in client-side storage for local offline resilience, backed by full PostgreSQL/Supabase schema definitions (`supabase/schema.sql`).

---

## 🏛️ Architecture & Technical Decisions

### 1. Web Audio API vs Static Audio Files
Rather than loading heavyweight `.mp3` or `.wav` ambient loops over the network (which introduce network latency, decoding stalls, and looping seams), the app uses a custom procedural audio synthesizer via native browser audio nodes:
- Multi-oscillator additive harmonic drone generators (fundamental + subtle octave harmonics).
- Procedural pink/biquad filtered noise modulation for organic breath cues.
- Exponential decay curves simulating the acoustic physics of physical singing bowls.

### 2. Timezone-Resilient Event Synchronization
Collective meditation sessions are stored in ISO 8601 UTC formats. The client dynamically parses and converts schedules via native `Intl.DateTimeFormat`, displaying relative countdowns and local times regardless of geographical user distribution.

### 3. Lightweight Context-Based i18n
Instead of introducing bloated external i18n libraries, localization is managed via a strongly typed, zero-overhead React Context (`LanguageContext`) coupled with granular dictionary lookups (`src/locales/en.ts` and `src/locales/es.ts`), ensuring instantaneous language switches and compile-time type safety.

---

## 📂 Project Structure

```bash
meditation-hub/
├── public/                  # Static assets, PWA icons, manifest.json, audio samples
├── src/
│   ├── app/                 # Next.js 16 App Router pages & root layout
│   │   ├── globals.css      # Tailwind CSS v4 styling & dark mode palette
│   │   ├── layout.tsx       # Root layout, metadata & context providers
│   │   └── page.tsx         # Main entry point & sanctuary views
│   ├── components/          # Modular UI components
│   │   ├── BreathingHalo.tsx      # SVG animated meditative breath guide
│   │   ├── ContactModal.tsx       # User feedback & support modal
│   │   ├── CreateIntentionModal.tsx # Intention creation with photo presets
│   │   ├── EditProfileModal.tsx   # User profile customization
│   │   ├── EncountersCalendar.tsx # Global group sessions calendar
│   │   ├── IntentionsFeed.tsx     # Filterable community intentions wall
│   │   ├── MeditationRoom.tsx     # Fullscreen immersive meditation view
│   │   ├── MyPractice.tsx         # Practice statistics & attendance log
│   │   ├── Navbar.tsx             # Navigation header & locale switchers
│   │   ├── Journal.tsx            # Reflections & supportive community notes
│   │   └── AudioDisclaimerModal.tsx # Attribution & copyright transparency
│   ├── context/             # Global React state management
│   │   ├── LanguageContext.tsx    # Strongly typed i18n engine (EN / ES)
│   │   └── MeditationContext.tsx  # Global session state & preferences
│   ├── locales/             # Internationalization dictionaries
│   │   ├── en.ts            # English translations
│   │   ├── es.ts            # Spanish translations
│   │   └── index.ts         # Locale types & exports
│   ├── services/            # Audio synthesis & data interfaces
│   │   └── audioService.ts  # Web Audio API engine & ambient controllers
│   └── types/               # TypeScript models & application contracts
├── supabase/
│   └── schema.sql           # Production PostgreSQL schema, RLS policies & tables
├── .env.example             # Documented environment variables template
├── package.json             # Dependencies & scripts
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 🛠️ Tech Stack & Tooling

| Domain | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Iconography** | [Lucide React](https://lucide.dev/) |
| **Audio Processing** | Browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (Procedural Synthesis) |
| **State Management** | React Context + Custom Hooks |
| **Database & Backend** | [Supabase](https://supabase.com/) / PostgreSQL |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.18.0
- **npm** or **pnpm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/rawcorn/meditation-hub.git
cd meditation-hub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file:
```bash
cp .env.example .env.local
```
Configure your Supabase credentials in `.env.local` (optional for local mock mode):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy Practices

- **Zero Invasive Tracking**: No third-party ad trackers, invasive analytics cookies, or behavioral telemetry.
- **Content Security**: Sanitized user inputs and clean client-side validation for intention submissions.
- **Database Safety**: Full Row Level Security (RLS) policies configured in Supabase PostgreSQL schema.

---

## 🌿 Ethics & Mindfulness Philosophy

Meditation Hub is designed as a peaceful, contemplative mindfulness space. It does not provide clinical healthcare advice, medical diagnosis, or curative claims. All mindfulness practices are intended solely for personal wellbeing and community fellowship.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the file for details.

---

<p align="center">
  Crafted with intention for mindful moments worldwide. 🌌
</p>
