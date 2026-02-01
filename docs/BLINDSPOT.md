# Blindspot — Complete Game Documentation

## What It Is

Blindspot is a daily puzzle game where you read a statement that sounds true — but one word is wrong. Your job is to tap the wrong word. Five rounds per day, one puzzle for everyone worldwide.

**Example:**

> "The Sahara Desert is the largest desert on Earth by total area."

The word "Sahara" is wrong. The Antarctic is actually the largest desert by area. Tap "Sahara," it highlights, and the correction is revealed.

**That's the entire game.** Read, spot the lie, tap. Under 90 seconds to play.

---

## Why It's Different

There are thousands of trivia apps. Blindspot is not a trivia app. Here's the distinction:

**Trivia:** "What is the largest desert on Earth?" → You recall the answer from memory.
**Blindspot:** "The Sahara Desert is the largest desert on Earth." → You read a claim that sounds right, feel confident it's correct, and then have to override that confidence to find the error.

The cognitive task is fundamentally different:
- Trivia tests **recall** — can you pull the answer from memory?
- Blindspot tests **critical reading** — can you detect when something you "know" is actually wrong?

This is why the puzzle quality matters so much. The statements must sound true. The wrong word must be plausible. If the error is obvious, there's no tension. The game lives and dies on that moment of "wait... is that actually right?"

### No Direct Competitor

After thorough research (documented in `MARKET_ANALYSIS.md`), there is no mainstream app doing this specific mechanic. The closest are:
- **Reverse Trivia** (Google Play) — multiple choice "pick the wrong answer," not find-the-wrong-word. Different mechanic entirely. Negligible traction.
- **General trivia apps** — test recall, not critical reading. Different cognitive task.

Blindspot occupies a genuine white space in the daily puzzle market.

---

## How It Works (Technical)

### Game Flow

```
Player opens /blindspot
  → useDailyPuzzle selects today's puzzle (same for all players worldwide)
  → 5 rounds displayed one at a time
  → Each round: statement appears with tappable words
  → Player taps a word
    → If correct: green highlight, correction revealed, +1 point
    → If wrong: yellow highlight on their pick, red on the actual wrong word, correction revealed
  → Auto-advances to next round after 2 seconds
  → After round 5: result screen with recap + share button
  → Score and streak saved to localStorage
```

### Daily Puzzle Selection

File: `src/utils/dates.ts`

```
Epoch: February 1, 2026 UTC (day 0)
Day number = floor((UTC_today - Epoch) / 86,400,000)
Puzzle index = dayNumber % 60 (total puzzles in bank)
```

Every player in the world gets the same puzzle on the same day. The puzzle bank cycles every 60 days. Adding more puzzles extends the cycle automatically — no code changes needed, just append to `puzzles.json`.

### State Persistence

File: `src/hooks/useGameState.ts`

All state is stored in `localStorage` under key `gameiq_state`:

```json
{
  "games": {
    "blindspot": {
      "currentStreak": 3,
      "maxStreak": 5,
      "gamesPlayed": 7,
      "gamesWon": 5,
      "lastPlayedDay": 42,
      "todayResult": {
        "score": 4,
        "maxScore": 5,
        "completed": true,
        "details": { "roundResults": [true, true, false, true, true] }
      }
    }
  },
  "memberSince": "2026-02-01T00:00:00.000Z"
}
```

- **Streaks** track consecutive days played. A streak breaks if you miss a day.
- **`completed`** is `true` if score >= 3 (counts as a "win" for stats).
- **`lastPlayedDay`** prevents replaying today's puzzle.
- No account, no backend, no database. Everything is client-side.

### Share Format

File: `src/utils/share.ts`

After completing a puzzle, the player can copy their result:

```
Blindspot #42 — 4/5 🟩🟩🟩🟥🟩
https://gameiq.daitiq.com
```

One tap copies to clipboard. This is the primary growth mechanism — the emoji grid is designed to be shared in group chats, tweets, and stories. Recipients see a result without spoilers and want to try it themselves.

### Word Matching

File: `src/games/blindspot/Blindspot.tsx`

The statement text is split into tappable tokens. Each word is stripped of punctuation before comparison:

```typescript
const cleanWord = word.toLowerCase();
const wrongWord = round.wrongWord.toLowerCase();
const isCorrect = cleanWord === wrongWord;
```

This means the `wrongWord` in `puzzles.json` must appear exactly as a single word in the `text` field. Multi-word wrong words (like "tree nuts") match against the token that contains them.

---

## Puzzle Data

File: `src/games/blindspot/puzzles.json`

**Current bank:** 60 puzzles × 5 rounds = 300 rounds

### Schema

```json
{
  "id": 1,
  "rounds": [
    {
      "text": "The Sahara Desert is the largest desert on Earth by total area.",
      "wrongWord": "Sahara",
      "correctWord": "Antarctic",
      "category": "Geography"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `text` | The statement shown to the player. Must contain `wrongWord` exactly once. |
| `wrongWord` | The incorrect word the player needs to find. Must appear in `text`. |
| `correctWord` | What the word should actually be. Shown after the player taps. |
| `category` | Label shown above the statement (Geography, Biology, History, etc.) |

### Quality Rules

Every puzzle must pass these checks:
1. **`wrongWord` must appear in `text`** — if it doesn't, the player can't tap it
2. **`wrongWord` must differ from `correctWord`** — if they're the same, the statement is true and there's nothing to find
3. **The statement must sound true on first read** — if the error is obvious, the puzzle has no tension
4. **The corrected statement must be factually accurate** — we're teaching real knowledge
5. **One wrong word per statement** — if multiple words could be wrong, the puzzle is ambiguous

### Validation

Run this to check the entire puzzle bank:

```bash
node -e "
const p = require('./src/games/blindspot/puzzles.json');
let issues = 0;
p.forEach(q => q.rounds.forEach((r, i) => {
  if (r.wrongWord === r.correctWord) { console.log('BROKEN P'+q.id+' R'+(i+1)+': same word'); issues++; }
  if (!r.text.includes(r.wrongWord)) { console.log('MISSING P'+q.id+' R'+(i+1)+': wrongWord not in text'); issues++; }
}));
console.log(issues ? issues + ' issues' : 'All ' + p.length + ' puzzles valid');
"
```

### Categories in Current Bank

| Category | Rounds | Examples |
|----------|--------|---------|
| History | 52 | Napoleon's height myth, Salem witch trials, Viking helmets |
| Biology | 48 | Octopus blood color, goldfish memory, polar bear fur |
| Science | 28 | Glass is not a liquid, microwave cooking direction, Coriolis myth |
| Food | 24 | Sushi = rice not fish, peanuts = legumes, fortune cookie origin |
| Geography | 24 | Sahara vs Antarctic, capital of Australia, Canary Islands etymology |
| Nature | 22 | Lemmings, ostriches, daddy longlegs |
| Medicine | 16 | Redhead anesthesia, cracking knuckles, sugar hyperactivity |
| General Knowledge | 14 | Spiders in sleep, five-second rule, bubble wrap origin |
| Language | 12 | Octopus plural, avocado etymology, hashtag name |
| Astronomy | 10 | Venus day length, far side of Moon, Pluto reclassification |
| Literature | 6 | Frankenstein naming, Elementary my dear Watson |
| Other (Art, Sports, Technology, Physics, etc.) | 44 | Various |

---

## The Value Proposition

### For Players

1. **Under 90 seconds.** No commitment, no tutorial, no account creation. Open → play → done.
2. **You learn something real every day.** Every wrong answer teaches a fact. "I didn't know the Antarctic was a desert." That educational payoff is the emotional hook.
3. **Everyone plays the same puzzle.** Social comparison ("I got 4/5, you got 3") without head-to-head competition.
4. **The share format creates conversation.** "Blindspot #42 — 5/5 🟩🟩🟩🟩🟩" in a group chat makes people ask "what is that?" — the same dynamic that grew Wordle.
5. **Streaks create habit.** Loss aversion keeps people coming back daily. Once you have a 30-day streak, missing a day feels painful.

### For the Business

1. **Zero server costs.** Static site, no backend, no database, no API calls. Hosting is free on Vercel/Netlify.
2. **Content scales with AI.** GPT can generate candidate puzzles in bulk. A human reviews and curates (15-30 minutes per batch of 10 puzzles). Cost per puzzle: ~$0.
3. **No competitor to displace.** You're not fighting Wordle or Connections for attention. You're offering something those players can't get anywhere else.
4. **Daily format = daily traffic.** Unlike games people binge and abandon, daily puzzles create predictable, recurring engagement.
5. **Shareable results = free marketing.** Every share is a micro-ad. The growth loop is: play → share result → friend asks what it is → friend plays → friend shares. Zero ad spend.

### What Makes Blindspot Specifically Sticky

The "myth busting" angle is the secret weapon. Most of the puzzles challenge things people believe are true:
- "Camels store water in their humps" (it's fat)
- "Goldfish have a 3-second memory" (it's months)
- "Dogs see in black and white" (they see blues and yellows)
- "You only use 10% of your brain" (you use virtually all of it)
- "Swallowed gum takes 7 years to digest" (a few days)

When someone gets one wrong, they don't feel dumb — they feel surprised. "I've believed that my whole life!" That surprise is what they share with friends. It's inherently social content even as a solo game.

---

## Adding New Puzzles

1. Open `src/games/blindspot/puzzles.json`
2. Add a new puzzle object at the end of the array with the next sequential `id`
3. Each puzzle needs exactly 5 rounds
4. Follow the quality rules above (wrong word in text, different from correct word, sounds true)
5. Run the validation script
6. Commit and deploy — the cycle automatically extends

**Good puzzle sources:**
- Common misconceptions lists (Wikipedia has an excellent one)
- "Things everyone gets wrong" articles
- Commonly confused facts (Edison vs Bell, Sahara vs Antarctic)
- Misattributed quotes
- Food origin myths
- Animal myth debunking

**What to avoid:**
- Obscure facts nobody would have an opinion about
- Errors that are obviously wrong on first read
- Ambiguous corrections where the "right" answer is debatable
- Multiple possible wrong words in a single statement
