# GameIQ by DAITIQ — Project Status

## Current State

**Platform:** React + TypeScript + Vite + TailwindCSS (PWA)
**Repo:** jsech3/GameIQ
**Dev server:** `npm run dev` (localhost:5180)

### Games

| Game | Status | Puzzles | Notes |
|------|--------|---------|-------|
| Blindspot | Playable | 15 (75 rounds) | Fully functional. Find the wrong word in factual statements. |
| Odd Angle | Mechanically complete | 5 (placeholder) | Game logic works. Needs real curated images (6 crops per puzzle). |

### Features Implemented
- Daily puzzle selection (UTC day number, same puzzle worldwide)
- localStorage persistence (streaks, stats, results)
- Shareable results (Wordle-style emoji grids copied to clipboard)
- Result modal with score display and share button
- Home screen with game cards showing today's status
- Header navigation between games
- Responsive layout (mobile-first, tested at 375px)
- TypeScript throughout, zero compilation errors
- Production build working (Vite)

### What's Missing
- **Odd Angle images:** Need 30+ sets of 6 cropped images each (tightest crop → full reveal)
- **PWA setup:** manifest.json, service worker, app icons, offline support
- **More Blindspot puzzles:** Currently 15, need 30-60 for a month of content
- **Statistics modal:** Detailed stats view (win %, streak history, calendar)
- **Animations:** Transition effects, correct/wrong feedback polish
- **Social meta tags:** Open Graph tags for link previews when sharing
- **React Native port:** Future iOS App Store release

### Architecture
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

### Puzzle Data
- **Daily rotation:** `dayNumber % puzzles.length` — cycles through puzzle bank
- **Blindspot schema:** `{ text, wrongWord, correctWord, category }` per round, 5 rounds per puzzle
- **Odd Angle schema:** `{ answer, acceptableAnswers, hint, imageFolder }` with 6 zoom levels per puzzle
