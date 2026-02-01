# GameIQ — Pick Up From Here

Last updated: February 1, 2026

---

## What's Built

**Blindspot** — fully playable daily puzzle game. 60 puzzles (300 rounds). Read a statement, tap the wrong word, 5 rounds per day. Streaks, stats, shareable emoji results. Zero backend, pure static site.

**Odd Angle** — game logic works but only has 5 placeholder puzzles with colored boxes instead of real images. Not launch-ready.

**Tech stack:** React + TypeScript + Vite + TailwindCSS
**Repo:** github.com/jsech3/GameIQ
**Branch:** main

---

## How to Run

```bash
cd "/Users/jacksechler/Desktop/Jack Sechler/2025/Digital Projects/AI-Projects/GameIQ"
npm run dev
```

Opens at http://localhost:5180. Click "Blindspot" to play.

---

## What's Left Before Launch

### Must Do (launch blockers)

1. **Test Blindspot on your phone.** Open localhost:5180 on mobile (or deploy to Vercel and test the real URL). Check that tapping words works, text is readable, share button copies correctly.

2. **PWA setup.** Add `manifest.json`, service worker, and app icons so it can be "Add to Home Screen" on iPhone. Without this it's just a website, not an app-like experience.

3. **Deploy to a real URL.** Run `npm run build`, deploy the `dist/` folder to Vercel or Netlify, point `gameiq.daitiq.com` to it.

4. **Open Graph meta tags.** When someone shares the URL in iMessage or Twitter, the link preview should show "Blindspot — the daily word puzzle" with a clean image. Without OG tags it shows a blank preview.

### Should Do (before telling anyone about it)

5. **Play through 5-10 puzzles yourself.** Some facts might be wrong or ambiguous. Flag any that feel off. The puzzle bank is just a JSON file — easy to edit.

6. **Add 30 more Blindspot puzzles** to get to 90 (3 months without repeats). Can be done with AI generation + manual review.

7. **Stats modal.** Right now streaks and win % are tracked in localStorage but there's no detailed stats screen. A modal showing streak history, win %, and a calendar would add stickiness.

### Can Wait (post-launch)

8. **Odd Angle images.** Needs 30+ sets of 6 cropped images each. High effort. Don't let this block launching Blindspot.

9. **More games.** Rank File and Suspect are documented as the next social games (see `SOCIAL_GAME_CONCEPTS.md`). These need a real-time backend — different architecture entirely.

10. **React Native iOS port.** Build web audience first, then port.

---

## Key Files

| File | What It Does |
|------|-------------|
| `src/games/blindspot/Blindspot.tsx` | The game component — all gameplay logic |
| `src/games/blindspot/puzzles.json` | 60 puzzles, 300 rounds. Edit this to add/fix puzzles |
| `src/hooks/useDailyPuzzle.ts` | Selects today's puzzle based on UTC date |
| `src/hooks/useGameState.ts` | localStorage persistence for streaks and stats |
| `src/utils/share.ts` | Generates the shareable emoji grid |
| `src/utils/dates.ts` | Day number calculation (epoch: Feb 1, 2026) |
| `src/App.tsx` | Router: `/`, `/blindspot`, `/odd-angle` |
| `src/pages/Home.tsx` | Home screen with game cards |

---

## Key Docs

| Doc | What It Covers |
|-----|---------------|
| `docs/BLINDSPOT.md` | Complete game documentation — how it works, technical details, puzzle schema, how to add puzzles, value proposition |
| `docs/MARKET_ANALYSIS.md` | Honest market research — competitors, retention data, realistic projections, risks |
| `docs/MONETIZATION.md` | Revenue model — free tier, $2.99/mo subscription, phased rollout, cost structure |
| `docs/GAME_CONCEPTS.md` | All game ideas — Blindspot & Odd Angle (launch), Tempo, Switchboard, First & Last (backlog) |
| `docs/SOCIAL_GAME_CONCEPTS.md` | Multiplayer game ideas — Suspect, Rank File, Hot Take, Alibi, Chain Reaction, Flip Side |
| `docs/PROJECT_STATUS.md` | Architecture, features implemented, what's missing |

---

## The Strategy (Short Version)

1. **Launch with Blindspot only.** One game, done well. Don't split focus.
2. **Deploy as a PWA.** Web-first, "Add to Home Screen" on mobile.
3. **Growth = shareability.** The emoji grid (`Blindspot #42 — 4/5 🟩🟩🟩🟥🟩`) is the entire marketing strategy. Seed it in r/puzzles, r/wordle, puzzle Twitter, friend group chats.
4. **Watch Day 7 retention.** If >20% of first-day players come back on day 7, the game has legs. If <5%, the mechanic needs work.
5. **Add social games later** (Rank File, Suspect) only after Blindspot proves people care about the GameIQ brand.
6. **iOS app later.** React Native port once web has traction.

---

## Quick Commands

```bash
# Run dev server
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build

# Validate puzzle bank (checks for broken puzzles)
node -e "const p=require('./src/games/blindspot/puzzles.json');let n=0;p.forEach(q=>q.rounds.forEach((r,i)=>{if(r.wrongWord===r.correctWord){console.log('BROKEN P'+q.id+' R'+(i+1));n++}if(!r.text.includes(r.wrongWord)){console.log('MISSING P'+q.id+' R'+(i+1));n++}}));console.log(n?n+' issues':'All '+p.length+' puzzles valid')"
```
