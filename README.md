# GameIQ

Daily brain games to keep you sharp. A PWA built with React, TypeScript, and Tailwind CSS.

**Live:** [gameiq.daitiq.com](https://gameiq.daitiq.com)

---

## Games

| Game | Description | Rounds | Scoring |
|------|-------------|--------|---------|
| **Pricecheck** | Guess if the real value is higher or lower | 5/day | 1 pt per correct guess, max 5 |
| **Trend** | Predict where data goes next (up/down/flat) | 5/day | 1 pt per correct prediction, max 5 |
| **Rank** | Order 5 items by a hidden metric | 1/day | 1 pt per item in correct position, max 5 |
| **Crossfire** | One word connects two different clues | 5/day | 1 pt per correct answer, max 5 |
| **Versus** | Pick which of two things wins on a hidden metric | 5/day | 1 pt per correct pick, max 5 |

### Pricecheck
Shown a real-world item with a suggested value. Guess **Higher** or **Lower**. 1 point per correct answer.

### Trend
See partial data on an unlabeled graph. Predict if the hidden data goes **Up**, **Down**, or stays **Flat**. The real data is then revealed.

### Rank
Five items are shown — reorder them by a hidden metric (population, revenue, etc.) using up/down buttons. Points awarded for each item in the correct position.

### Crossfire
Two clues from different domains share one answer word. Type your guess. Case-insensitive, multiple accepted spellings.

### Versus
Two things are compared on a hidden metric (e.g. "Which has more monthly active users?"). Pick the winner. Both values are revealed with a count-up animation. Supports "higher wins" metrics (more users, taller, heavier) and "lower wins" metrics (founded first, closer, colder).

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
│   │   ├── crossfire/             # Crossfire game
│   │   └── versus/                # Versus game
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
- Streaks track consecutive days played per game

---

## Puzzle Generation

### Current content (no setup required)
All 5 games ship with 365 pre-generated puzzles. The site works out of the box with no API keys or external services.

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
node scripts/bulk-generate.mjs versus       # one game

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

### Versus
```json
{
  "id": 1,
  "rounds": [
    {
      "category": "Technology",
      "metric": "Which has more monthly active users?",
      "optionA": { "name": "Netflix", "value": 260, "unit": "million" },
      "optionB": { "name": "Spotify", "value": 626, "unit": "million" },
      "higherWins": true
    }
  ]
}
```

The `higherWins` field controls which option is correct:
- `true` (default): the option with the **higher** value wins (e.g. "more users", "taller", "heavier")
- `false`: the option with the **lower** value wins (e.g. "founded first", "closer to the Sun", "colder")

---

## License

MIT
