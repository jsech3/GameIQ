# GameIQ by DAITIQ — Project Status

## Current State

**Platform:** React + TypeScript + Vite + TailwindCSS (PWA)
**Repo:** jsech3/GameIQ
**Dev server:** `npm run dev` (localhost:5180)

---

## Quick Start

```bash
# Run locally
cd GameIQ
npm run dev
# Opens at http://localhost:5180

# Production build (outputs static dist/ folder)
npm run build
```

No backend required. Everything runs client-side — static HTML/JS/CSS + localStorage.

---

## How It Works

### For Players
- Open the site → home screen shows two game cards (Blindspot and Odd Angle)
- Tap a game to play today's puzzle
- Each day at midnight UTC, a new puzzle appears automatically (no redeploy needed)
- All players worldwide see the same puzzle on the same day
- After finishing, a result modal shows your score and a "Share" button that copies an emoji grid to your clipboard
- Progress (streaks, stats, today's result) persists across page refreshes via localStorage

### For You (Developer)

**Adding Blindspot puzzles:** Edit `src/games/blindspot/puzzles.json`. Each puzzle has 5 rounds:
```json
{
  "id": 16,
  "rounds": [
    {
      "text": "The Great Wall of China is visible from space with the naked eye",
      "wrongWord": "is",
      "correctWord": "is not",
      "category": "Geography"
    }
  ]
}
```
The `wrongWord` must appear in `text` exactly once. `correctWord` is what it should actually say.

**Adding Odd Angle puzzles:**
1. Add puzzle entry to `src/games/odd-angle/puzzles.json`:
```json
{
  "id": 6,
  "answer": "Statue of Liberty",
  "acceptableAnswers": ["statue of liberty", "lady liberty"],
  "hint": "Famous American landmark",
  "imageFolder": "006"
}
```
2. Create 6 cropped images at `public/images/puzzles/006/level-1.jpg` through `level-6.jpg` (level-1 = tightest crop, level-6 = full reveal)

**Daily puzzle rotation:** The app calculates a day number from a fixed epoch (`2025-01-01T00:00:00Z`), then picks `dayNumber % puzzles.length`. When you add more puzzles, the cycle extends automatically.

**Player state:** Stored in localStorage under key `gameiq_state`. Structure:
```json
{
  "games": {
    "blindspot": {
      "currentStreak": 3,
      "maxStreak": 5,
      "gamesPlayed": 7,
      "gamesWon": 5,
      "lastPlayedDay": 42,
      "todayResult": { "completed": true, "score": 4, "maxScore": 5 }
    },
    "odd-angle": { ... }
  },
  "memberSince": "2025-06-15T00:00:00.000Z"
}
```

---

## Deploying

The app is a static site. `npm run build` outputs a `dist/` folder that can be deployed to any static host:

- **Vercel:** `npx vercel --prod` (or connect GitHub repo for auto-deploy)
- **Netlify:** Drag `dist/` folder to Netlify dashboard, or connect repo
- **GitHub Pages:** Push `dist/` to a `gh-pages` branch
- **Custom domain:** Point `gameiq.daitiq.com` to your host

No environment variables, no API keys, no server configuration needed.

---

## Games

| Game | Status | Puzzles | Notes |
|------|--------|---------|-------|
| Blindspot | Playable | 15 (75 rounds) | Fully functional. Find the wrong word in factual statements. |
| Odd Angle | Mechanically complete | 5 (placeholder) | Game logic works. Needs real curated images (6 crops per puzzle). |

---

## Features Implemented
- Daily puzzle selection (UTC day number, same puzzle worldwide)
- localStorage persistence (streaks, stats, results)
- Shareable results (Wordle-style emoji grids copied to clipboard)
- Result modal with score display and share button
- Home screen with game cards showing today's status
- Header navigation between games
- Responsive layout (mobile-first, tested at 375px)
- TypeScript throughout, zero compilation errors
- Production build working (Vite)

---

## What's Needed Before Launch

### Must Have
- **Odd Angle images:** 30+ sets of 6 cropped images each (tightest crop → full reveal). This is manual work — find famous landmarks, objects, paintings, etc., then crop at 6 zoom levels.
- **More Blindspot puzzles:** Currently 15 (cycles every 15 days). Need 30-60 for a solid month without repeats.
- **PWA setup:** `manifest.json`, service worker for offline play, app icons (192px + 512px) for "Add to Home Screen" on mobile.

### Nice to Have
- Statistics modal (detailed win %, streak history, calendar view)
- Animations and transition polish (correct/wrong feedback)
- Open Graph meta tags (link preview when sharing URL)
- Dark/light theme toggle

### Future
- React Native port for iOS App Store
- Push notifications for daily puzzle reminders
- More games (Switchboard, First & Last — see GAME_CONCEPTS.md)

---

## Architecture

```
src/
├── App.tsx              # Router: /, /blindspot, /odd-angle
├── components/
│   ├── Layout.tsx       # Header, nav, footer shell
│   ├── GameCard.tsx     # Home screen game entry cards
│   ├── ResultModal.tsx  # Post-game score + share overlay
│   └── ShareButton.tsx  # Clipboard copy button
├── games/
│   ├── blindspot/
│   │   ├── Blindspot.tsx    # Find-the-wrong-word game
│   │   └── puzzles.json     # 15 puzzles, 5 rounds each
│   └── odd-angle/
│       ├── OddAngle.tsx     # Zoom-out guessing game
│       └── puzzles.json     # 5 placeholder puzzles
├── hooks/
│   ├── useDailyPuzzle.ts   # Date-based puzzle selector
│   └── useGameState.ts     # localStorage persistence
├── utils/
│   ├── dates.ts            # Day number calculation
│   ├── share.ts            # Share text generation
│   └── scoring.ts          # Score formatting
├── types/
│   └── index.ts            # Shared TypeScript types
└── pages/
    └── Home.tsx            # Home screen
```

---

## Related Docs
- `docs/GAME_CONCEPTS.md` — All game concepts (launch + backlog), competitive analysis
- `docs/MONETIZATION.md` — Revenue model, phased rollout, projections, cost structure
