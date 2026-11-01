# Coherence Hub 🌌

**A Collective Meditation Web Application & Sanctuary**

Coherence Hub is a peaceful digital space where people can share intentions for loved ones or themselves, support other members through meditation, and participate in collective meditation sessions.

---

## ✨ Features

- **Intentions Sanctuary**: Vertically scrolling intention cards, categorized filtering, and instant search.
- **Collective Encounters Calendar**: View scheduled group meditation sessions automatically adapted to your local timezone worldwide.
- **Distraction-Free Meditation Space**:
  - Multi-ring animated breathing halo with organic rhythm and guidance (*Inhale gently*, *Breathe naturally*, *Exhale slowly*, *Rest in this moment*).
  - Accurate meditation timer (5m, 15m, 30m, open-ended) that ignores pause time and tab switches.
  - Built-in procedural ambient sound synthesizer (warm harmonic drone, pink noise breath, singing bowl chimes) via the Web Audio API without external audio files.
  - Distinct entry modes: **"Enter Group Meditation"** (for synchronous gatherings) vs. **"Meditate Solo"** (anytime).
- **Creator Journal & Community Updates**: Post reflections, updates, and leave kind words of support.
- **My Practice Dashboard**: Minimal personal space tracking accumulated meditation time and monthly calendar presence markers without competitive streaks or gamification.
- **Create Intention with Photo Upload**: Upload your own photo or choose serene symbolic artwork presets, with a custom 14-day interactive date/time selector.
- **Dual Data Layer**: Works out-of-the-box with browser client storage and has full PostgreSQL/Supabase schema ready in `supabase/schema.sql`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library**: React 19
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide Icons
- **Audio Engine**: Web Audio API (procedural synthesis)
- **Database Architecture**: PostgreSQL / Supabase Schema ready (`supabase/schema.sql`)

---

## 🌿 Ethics & Philosophy

Coherence Hub is intended purely as a meditation and contemplative wellbeing practice. It does not offer medical advice, clinical diagnosis, or claim physical health cures.
