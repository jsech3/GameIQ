# GameIQ

Daily brain games to keep you sharp. A PWA built with React, TypeScript, and Tailwind CSS.

**Live:** [gameiq.daitiq.com](https://gameiq.daitiq.com)

---

## Games

| Game | Description | Rounds |
|------|-------------|--------|
| **Pricecheck** | Guess if the real value is higher or lower | 5/day |
| **Trend** | Predict where data goes next (up/down/flat) | 5/day |
| **Rank** | Order 5 items by a hidden metric | 1/day |
| **Crossfire** | One word connects two different clues | 5/day |

### Pricecheck
Shown a real-world item with a suggested value. Guess **Higher** or **Lower**. Points are based on how close the shown value is to the actual value (1-5 pts per round). Max score: 25. Win threshold: 15+.

| Margin | Points |
|--------|--------|
| <= 10% | 5 |
| <= 25% | 4 |
| <= 40% | 3 |
| <= 60% | 2 |
| > 60%  | 1 |

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
├── .github/
│   └── workflows/
│       └── generate-puzzles.yml   # Weekly puzzle auto-generation
├── scripts/
│   ├── generate-puzzles.mjs       # Claude API puzzle generator
│   ├── validate-puzzles.mjs       # Puzzle bank validator
│   └── bulk-generate.mjs          # Offline bulk generator (no API needed)
├── public/
│   ├── icons/                     # PWA icons
│   └── images/                    # OG image
├── src/
│   ├── components/                # Shared UI components
│   ├── games/
│   │   ├── pricecheck/            # Pricecheck game
│   │   ├── trend/                 # Trend game
│   │   ├── rank/                  # Rank game
│   │   └── crossfire/             # Crossfire game
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Page components
│   ├── types/                     # TypeScript types
│   └── utils/                     # Utility functions
├── CHANGELOG.md
├── DEPLOYMENT.md
└── ROADMAP.md
```

---

## Daily Puzzle System

- Each game has **365 puzzles** baked in — a full year of unique daily content
- Puzzles rotate based on UTC day number
- Day 0 = February 1, 2026
- Same puzzle for all users on the same day
- Progress stored in browser localStorage

---

## Puzzle Generation

### Current content (no setup required)
All 4 games ship with 365 pre-generated puzzles. The site works out of the box with no API keys or external services.

### Automated weekly refresh (optional)
A GitHub Actions workflow runs every Sunday at 2 AM UTC to generate 30 fresh puzzles per game using the Claude API. To enable it:

1. Go to your GitHub repo **Settings > Secrets and variables > Actions**
2. Add a new secret: `ANTHROPIC_API_KEY` with your Anthropic API key
3. The workflow will run automatically each Sunday, or trigger it manually from the Actions tab

The pipeline:
- Generates 30 new puzzles per game via Claude (Sonnet)
- Validates all puzzle banks for structural correctness
- Runs a production build to catch errors
- Auto-commits if puzzles changed
- Keeps each bank at 365 puzzles (rolling window — oldest trimmed)

### Manual generation

```bash
# Offline bulk generation (no API key needed, uses curated data pools)
node scripts/bulk-generate.mjs              # all games
node scripts/bulk-generate.mjs pricecheck   # one game

# API-powered generation (requires ANTHROPIC_API_KEY env var)
ANTHROPIC_API_KEY=sk-... node scripts/generate-puzzles.mjs
ANTHROPIC_API_KEY=sk-... node scripts/generate-puzzles.mjs trend

# Validate all puzzle banks
node scripts/validate-puzzles.mjs
```

---

## Adding Puzzles Manually

Each game has a `puzzles.json` file. Add new puzzles following the existing schema:

### Pricecheck
```json
{
  "id": 1,
  "rounds": [
    {
      "category": "Rent",
      "item": "Average monthly rent in Manhattan, NY",
      "shownValue": 3200,
      "actualValue": 4500,
      "unit": "$"
    }
  ]
}
```

### Trend
```json
{
  "id": 1,
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
  "id": 1,
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
  "id": 1,
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

## License

MIT
