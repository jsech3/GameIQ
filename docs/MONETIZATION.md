# GameIQ by DAITIQ — Monetization Plan

## Revenue Model Comparison

| Model | Pros | Cons | Examples |
|-------|------|------|----------|
| Freemium + Ads | Low friction, large user base | Ads degrade UX, low per-user revenue | Most mobile games |
| Subscription | Recurring revenue, clean UX | High churn, hard to justify for casual games | NYT Games ($6.99/mo), Elevate ($14.99/mo) |
| One-time purchase | Simple, no ongoing commitment | Low ceiling, no recurring revenue | Wordle (pre-acquisition) |
| Hybrid (free + premium tier) | Best of both worlds | Complexity in what to gate | Duolingo, NYT |

**Recommended: Hybrid freemium with optional subscription**

---

## Tier Structure

### Free Tier
- 1 game per day (player chooses which)
- Full gameplay experience (no nerfed mechanics)
- Basic streak tracking
- Share results

### GameIQ+ (Subscription)
**Price:** $2.99/month or $19.99/year

- All games every day (currently 2, scaling to 4+)
- Full statistics dashboard (win %, streak history, calendar view)
- Ad-free experience
- Historical puzzle archive (replay past puzzles)
- Streak shields (1 per week — protect streak on missed days)
- Early access to new games

### Why $2.99/month
- NYT Games is $6.99/mo but has 10+ games and massive brand
- Elevate is $14.99/mo but positions as "brain training"
- $2.99 is impulse-buy territory — low enough that streak protection alone justifies it
- $19.99/year (~$1.67/mo) rewards annual commitment and reduces churn

---

## Phase 1: Pre-Monetization (Launch → 10K DAU)

**Goal:** Build audience. Everything is free.

- All games unlocked daily
- Focus on shareability (Wordle-style emoji grids)
- SEO: gameiq.daitiq.com with daily puzzle landing pages
- Social: Encourage sharing on Twitter/X, iMessage, group chats
- Track: DAU, retention (Day 1, Day 7, Day 30), share rate

**Key metric to unlock Phase 2:** 10,000 daily active users with >30% Day-7 retention

---

## Phase 2: Introduce Ads (10K → 50K DAU)

**Goal:** Generate first revenue without alienating users.

- Interstitial ad between games (not mid-game — never interrupt gameplay)
- Banner ad on home screen only
- No ads during active puzzle play
- Estimated CPM: $5-15 (casual games, US audience)
- At 25K DAU, 2 impressions/user/day: ~$250-750/month

**Key metric to unlock Phase 3:** Consistent 50K DAU

---

## Phase 3: Subscription Launch (50K+ DAU)

**Goal:** Convert engaged users to paying subscribers.

- Introduce GameIQ+ tier
- Gate: limit free users to 1 game/day (they've been playing all games free, so this creates the squeeze)
- Offer 7-day free trial for GameIQ+
- Target 3-5% conversion rate on active users
- At 50K DAU, 3% conversion = 1,500 subscribers = ~$4,500/month

---

## Phase 4: iOS App Store (100K+ DAU web)

**Goal:** Capture mobile-native audience and App Store discovery.

- React Native port of PWA
- Same subscription via Apple IAP ($2.99/mo, Apple takes 30% → net $2.09)
- Push notifications for daily puzzle reminders (huge for retention)
- App Store optimization: "daily brain games" keyword cluster
- Apple takes 30% Year 1, 15% Year 2+ (Small Business Program)

---

## Revenue Projections (Conservative)

| Milestone | DAU | Subscribers | Monthly Revenue |
|-----------|-----|-------------|-----------------|
| Month 3 | 5K | 0 (free) | $0 |
| Month 6 | 25K | 0 (ads only) | $500 |
| Month 12 | 50K | 1,500 | $5,000 |
| Month 18 | 100K | 5,000 | $15,000 |
| Month 24 | 200K | 12,000 | $40,000 |

These are conservative estimates. NYT Games has 1M+ subscribers at $6.99/mo. The daily puzzle format has proven product-market fit.

---

## Alternative Revenue Streams

### Brand Partnerships
- Sponsored puzzle categories ("Today's Blindspot brought to you by National Geographic")
- Non-intrusive, content-aligned sponsorships
- Viable at 100K+ DAU

### Merchandise
- "I play GameIQ" style merch (low priority, brand-building only)

### Licensing
- License the game engine/format to media companies (like Wordle → NYT)
- Exit opportunity if the product gains traction

### Corporate/Education
- Sell bulk licenses to schools, corporate training programs
- "Keep your team sharp" positioning
- Custom puzzle packs for corporate events

---

## Cost Structure

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Hosting (Vercel/Netlify) | $0-20 | Static site, free tier covers launch |
| Domain | ~$1 | gameiq.daitiq.com (subdomain, free) |
| Apple Developer Account | $8.25 | $99/year, needed for iOS |
| Content creation | $0-500 | Manual initially, AI-assisted later |
| **Total pre-revenue** | **< $30/month** | |

The cost structure is extremely lean because:
- No backend servers (static JSON + localStorage)
- No user accounts or databases (no auth infrastructure)
- No real-time multiplayer (no WebSocket servers)
- Images are the only significant asset (Odd Angle)

---

## Growth Levers

1. **Shareability:** Emoji result grids are the #1 growth driver. Every share is free marketing.
2. **Daily habit:** One puzzle per day = built-in retention mechanic.
3. **Streaks:** Loss aversion keeps players coming back. Streak shields (paid) monetize this.
4. **New games:** Each new game is a content event that re-engages lapsed users.
5. **SEO:** Daily puzzle pages can rank for "daily brain game", "daily trivia", etc.
6. **App Store discovery:** "brain games" and "daily puzzle" are high-volume search terms.

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| Low initial traffic | Focus on shareability; seed in relevant communities (Reddit r/wordle, Twitter puzzle community) |
| Content burnout (running out of puzzles) | AI generation pipeline for Blindspot; community submissions for Odd Angle images |
| Competitor copies the format | First-mover advantage; build brand loyalty through quality and consistency |
| Apple rejects PWA features | Plan for native React Native port from the start |
| Subscription fatigue | Keep free tier genuinely fun; subscription adds convenience, not core gameplay |
