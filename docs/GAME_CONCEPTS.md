# GameIQ by DAITIQ — Game Concepts

All original game concepts for the GameIQ daily brain games platform. Tempo and Odd Angle are the launch games. Switchboard and First & Last are documented for potential future addition.

---

## Launch Games

### Tempo
**One sentence:** 5 events — put them in chronological order.

**How it works:** Five cards appear showing historical events, inventions, pop culture moments, or scientific milestones. Drag them into the order you think they happened. Lock in your answer. Scoring: number of cards in the correct position. One daily puzzle. Topics rotate across categories.

**Why it's sticky:** Trivia meets spatial ordering. You often *almost* know — "Was the moon landing before or after Woodstock?" That uncertainty drives daily return. Extremely simple rules — anyone gets it instantly. The friend-challenge variant ("beat my order") writes itself.

**Shareable result:** `Tempo #42 — 4/5 ⬆️⬆️⬆️⬆️⬇️`

**Content scaling:** AI can generate themed event sets. Low manual effort per puzzle.

---

### Odd Angle
**One sentence:** A famous photo, landmark, painting, or object shown from an extreme crop or unusual angle — guess what it is in as few hints as possible.

**How it works:** Start with a very tight crop or strange angle. Each wrong guess (or skip) zooms out slightly, revealing more. 6 levels of zoom. Fewer reveals = higher score. Daily puzzle, everyone gets the same image.

**Why it's sticky:** Visual puzzles hit a different audience than word games. The "zoom out" reveal is inherently satisfying. No direct mainstream competitor. Works with geography, art, everyday objects, nature — infinite content variety.

**Shareable result:** `Odd Angle #42 — 2/6 🔍🔍`

**Content scaling:** Requires manual image curation and cropping (6 crops per puzzle). Highest content burden but most original concept.

---

## Future Games (Backlog)

### Switchboard
**One sentence:** A 4x4 grid of tiles. Each tile has a word. Swap two tiles per move to sort them into 4 rows of 4, where each row shares a secret category — but you don't know the categories.

**How it works:** Like NYT Connections, but spatial. You're physically rearranging a grid instead of selecting groups. Limited swaps (8 max). Each swap commits — no undo. When a row is correct, it locks and reveals the category.

**Shareable result:** `Switchboard #42 — 5/8 swaps 🟩🟩🟩🟩`

**Risk:** Perception overlap with NYT Connections. The swap mechanic is genuinely different but may be seen as derivative.

**Data schema:**
```json
{
  "id": 1,
  "categories": [
    { "name": "Planets", "words": ["Mars", "Venus", "Saturn", "Jupiter"] },
    { "name": "Cards", "words": ["Hearts", "Clubs", "Diamonds", "Spades"] },
    { "name": "Dances", "words": ["Waltz", "Tango", "Salsa", "Foxtrot"] },
    { "name": "Fabrics", "words": ["Silk", "Denim", "Cotton", "Linen"] }
  ]
}
```

---

### First & Last
**One sentence:** Given the first and last letter of 5 words plus a clue for each, fill in the blanks. The catch — the last letter of each word is the first letter of the next.

**How it works:**
```
S_____E  (clue: "what the sun does")  → SUNRISE
E_____T  (clue: "a large animal")     → ELEPHANT
T_____O  (clue: "spinning wind")      → TORNADO
```
The chain constraint means solving one word gives you the start of the next. But if you get one wrong, it cascades. 5 words per puzzle.

**Shareable result:** `First & Last #42 — 4/5 🟩🟩🟩🟩🟥`

**Risk:** Entering a saturated word game market (Wordle, Spelling Bee, Connections, Letterboxed, Waffle).

**Data schema:**
```json
{
  "id": 1,
  "chain": [
    { "word": "SUNRISE", "clue": "What the sun does each morning", "first": "S", "last": "E" },
    { "word": "ELEPHANT", "clue": "Largest land animal", "first": "E", "last": "T" }
  ]
}
```
