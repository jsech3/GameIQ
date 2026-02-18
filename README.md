# GameIQ

Daily brain games to keep you sharp. A PWA built with React, TypeScript, and Tailwind CSS.

**Live:** [gameiq.daitiq.com](https://gameiq.daitiq.com)

---

## Games

| Game | Description | Rounds |
|------|-------------|--------|
| **Blindspot** | Find the wrong word in each statement | 5/day |
| **Trend** | Predict where data goes next (up/down/flat) | 5/day |
| **Rank** | Order 5 items by a hidden metric | 1/day |
| **Crossfire** | One word connects two different clues | 5/day |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Build:** Vite
- **PWA:** vite-plugin-pwa + Workbox
- **Routing:** React Router
- **State:** React hooks + localStorage

---

## Project Structure

```
GameIQ/
├── public/
│   ├── icons/           # PWA icons
│   └── images/          # OG image
├── src/
│   ├── components/      # Shared UI components
│   ├── games/
│   │   ├── blindspot/   # Blindspot game
│   │   ├── trend/       # Trend game
│   │   ├── rank/        # Rank game
│   │   └── crossfire/   # Crossfire game
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── CHANGELOG.md         # Version history
├── DEPLOYMENT.md        # Deploy instructions
└── ROADMAP.md           # Future plans
```

---

## Adding Puzzles

Each game has a `puzzles.json` file. Add new puzzles following the existing schema:

### Blindspot
```json
{
  "id": 4,
  "rounds": [
    {
      "text": "Statement with wrong word",
      "wrongWord": "wrong",
      "correctWord": "correct",
      "category": "Science"
    }
  ]
}
```

### Trend
```json
{
  "id": 6,
  "rounds": [
    {
      "category": "Economics",
      "title": "US GDP Growth (%)",
      "data": [2.1, 2.3, 2.5, 2.4, 2.6],
      "hidden": [2.8, 2.9, 3.0],
      "answer": "up",
      "source": "BEA"
    }
  ]
}
```

### Rank
```json
{
  "id": 11,
  "category": "Sports",
  "question": "Order these teams by championships (most first)",
  "items": [
    { "name": "Team A", "value": 17 },
    { "name": "Team B", "value": 11 }
  ]
}
```

### Crossfire
```json
{
  "id": 6,
  "rounds": [
    {
      "clue1": { "domain": "Music", "hint": "Musical key" },
      "clue2": { "domain": "Security", "hint": "Door opener" },
      "answer": "KEY",
      "acceptedAnswers": ["KEY"]
    }
  ]
}
```

---

## Daily Puzzle System

- Puzzles rotate based on UTC day number
- Day 0 = February 1, 2026
- Same puzzle for all users on the same day
- Progress stored in browser localStorage

---

## License

MIT
