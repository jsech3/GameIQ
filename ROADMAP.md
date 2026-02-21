# GameIQ — 30/60/90 Day Plan

## Current State (February 2026)

**What's built:**
- 5 games: Pricecheck, Trend, Rank, Crossfire, Versus
- 365 puzzles per game (full year of daily content)
- PWA with offline support and installability
- Animated UI with micro-interactions
- Share functionality for all games
- OG meta tags for social previews
- Deployed at gameiq.daitiq.com (Vercel, auto-deploys from GitHub)
- Offline bulk puzzle generator + optional Claude API weekly refresh

**What's NOT built:**
- No analytics
- No user accounts
- No backend
- No monetization

---

## Days 1–30: Launch & Validate

**Goal:** Get GameIQ live and in front of real people. See if anyone cares.

### Week 1: Deploy & Test
- [ ] Choose a host and deploy (see DEPLOYMENT.md)
- [ ] Set up custom domain `gameiq.daitiq.com`
- [ ] Test all 4 games on mobile (iOS Safari, Android Chrome)
- [ ] Test PWA install on both platforms
- [ ] Fix any bugs found during testing

### Week 2: Analytics & Share
- [ ] Add privacy-friendly analytics (Plausible, Umami, or Cloudflare Web Analytics — all free or cheap)
- [ ] Track: page views, game starts, game completions, share clicks
- [ ] Share the link with friends/family for initial feedback
- [ ] Post in a few communities (Reddit r/webgames, Hacker News Show, Product Hunt, X/Twitter)

### Week 3–4: Observe & Fix
- [ ] Monitor analytics — which games get played most?
- [ ] Collect feedback — what's confusing? What do people like?
- [ ] Fix UX issues (especially Rank drag-and-drop on mobile)
- [ ] Start generating next batch of 30 puzzles per game

### Day 30 Checkpoint
Ask yourself:
- Are people coming back daily?
- Are people sharing scores?
- Which game is most/least popular?
- Is this worth continuing?

---

## Days 31–60: Grow & Improve

**Goal:** Retain daily players and start growing organically.

### Content Pipeline
- [ ] Generate puzzles for days 31–90 (60 more per game)
- [ ] Consider themed weeks (Geography Week, Music Week)
- [ ] Add seasonal puzzles if relevant

### Feature Adds
- [ ] **Streak notifications** — badge or visual reward for 7-day, 30-day streaks
- [ ] **Daily digest page** — show all 4 games' status in one view ("3/4 played today")
- [ ] **Improved results screen** — comparison to other players ("You scored better than 72% of players")
- [ ] **Sound effects** — subtle audio feedback on correct/wrong (with mute toggle)
- [ ] **Dark/light mode toggle** — some people play in daylight

### Growth
- [ ] Add a "Challenge a Friend" share link
- [ ] Create social media accounts (X/Twitter, TikTok) — post daily puzzle teasers
- [ ] Set up an email/newsletter signup for daily reminders (Buttondown, free tier)
- [ ] Consider submitting to app directories and game listing sites

### Technical
- [ ] Add error boundaries so one broken game doesn't crash the app
- [ ] Add a "What's New" changelog modal for returning players
- [ ] Set up a simple CI/CD pipeline (GitHub Actions → auto-deploy on push)

### Day 60 Checkpoint
Ask yourself:
- Are daily active users growing week over week?
- What's the share rate? (People sharing = free marketing)
- Which features do people actually want?
- Is it time to think about revenue?

---

## Days 61–90: Scale or Pivot

**Goal:** Based on data from first 60 days, pick a direction.

### Path A: It's Working — Double Down

If you're seeing growth and retention:

**User Accounts & Backend**
- [ ] Add optional sign-in (Google/Apple via Supabase or Firebase Auth)
- [ ] Sync progress across devices
- [ ] Global leaderboards (daily, weekly, all-time)
- [ ] Friends/following system

**More Games**
- [ ] Add more games based on what players request
- [ ] Ideas: Timeline (order events), Proximity (which city is closer), Quote (who said it)
- [ ] Each new game = more reasons to visit daily

**Monetization (Non-Intrusive)**
- [ ] Tip jar / Buy Me a Coffee link
- [ ] Optional "GameIQ+" subscription ($2-3/mo):
  - Puzzle archive (replay past days)
  - Extra daily puzzles
  - Custom themes
  - No ads (if you add ads later)
- [ ] Avoid: paywalling core games, forced ads, pay-to-win

**Community**
- [ ] Discord server for daily discussions
- [ ] User-submitted puzzle ideas
- [ ] Weekly puzzle creation contests

---

### Path B: Moderate Interest — Optimize

If you're getting some traction but not explosive growth:

**Focus on Retention**
- [ ] Push notifications (PWA supports this) for daily reminders
- [ ] Email reminders for lapsed players
- [ ] Make sharing more compelling (better share images, competitive framing)

**Reduce Effort**
- [ ] Automate puzzle generation with AI (script that generates and validates puzzles)
- [ ] Set up a 90-day content buffer so you don't have to think about it
- [ ] Minimize maintenance — keep it simple, keep it running

**Experiment**
- [ ] Try different game mechanics to see what sticks
- [ ] A/B test different share formats
- [ ] Cross-promote with other daily game sites

---

### Path C: Low Interest — Repurpose

If engagement is flat after 60 days:

**Reframe the Project**
- [ ] Use it as a portfolio piece — it's a well-built React/TypeScript PWA
- [ ] Write a blog post or case study about building it
- [ ] Open source it — daily game templates are useful to other devs

**Extract Value**
- [ ] The game engine is reusable — white-label it for other brands
- [ ] The puzzle format works for education — pitch to schools/teachers
- [ ] The daily mechanic works for other content — news quizzes, vocabulary, etc.

**Keep It Running**
- [ ] With 30+ days of puzzles and zero backend, it costs nothing to keep live
- [ ] Set it and forget it — it'll cycle through puzzles indefinitely

---

## Content Needs by Timeline

| Timeframe | Puzzles Needed (per game) | Total Rounds |
|-----------|--------------------------|--------------|
| Day 1–30 | 30 (done) | 480 |
| Day 31–60 | 30 more | 480 more |
| Day 61–90 | 30 more | 480 more |
| Day 91–180 | 90 more | 1,440 more |

**Automation idea:** Build a puzzle generation script that uses AI to create and validate puzzles in bulk. Review them manually, then commit. This could produce 30 puzzles in minutes instead of hours.

---

## Key Metrics to Track

| Metric | What It Tells You |
|--------|-------------------|
| Daily Active Users (DAU) | Is anyone showing up? |
| DAU / MAU ratio | Are people coming back daily? (>20% is good for games) |
| Games completed per visit | Are all 5 games engaging? |
| Share rate | Are people marketing for you? |
| PWA install rate | Do people want this on their home screen? |
| D1/D7/D30 retention | How many come back after 1 day, 7 days, 30 days? |
| Streak distribution | How long do people maintain streaks? |

---

## Cost Projections

| Item | Cost |
|------|------|
| Hosting (Vercel/Netlify/Cloudflare free tier) | $0 |
| Domain (if you already own daitiq.com) | $0 |
| Analytics (Plausible Cloud) | $9/mo or self-host free |
| Analytics (Umami Cloud) | Free tier available |
| Analytics (Cloudflare) | $0 |
| Total minimum | **$0/mo** |
| Total with paid analytics | **$9/mo** |

GameIQ can run indefinitely at zero cost. No backend, no database, no server.

---

## Decision Points

**Day 30:** Continue or not? If yes, commit to 60 more days of content.
**Day 60:** Invest in features (accounts, backend) or keep it lean?
**Day 90:** Monetize, scale, or repurpose?

The beauty of this project is that it's zero-cost to maintain. There's no downside to keeping it live even if you move on to other things.
