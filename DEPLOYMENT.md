# GameIQ Deployment Guide

## Prerequisites
- Node.js 18+
- npm

---

## Build for Production

```bash
cd /path/to/GameIQ
npm install
npm run build
```

This creates a `dist/` folder with:
- Optimized JS/CSS bundles (~88KB gzipped)
- PWA manifest and service worker
- All static assets (icons, OG image)

GameIQ is a **fully static site** — no backend, no database, no environment variables. Any static hosting works.

---

## Hosting Options

### Option 1: Vercel (Recommended for simplicity)

**Free tier.** Auto-deploys on git push.

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) — it auto-detects Vite.

**Custom domain:** Project Settings > Domains > Add `gameiq.daitiq.com`
**DNS:** CNAME `gameiq` → `cname.vercel-dns.com`

**Note:** Vercel deployments are public. Password protection requires Pro plan ($20/mo).

---

### Option 2: Netlify

**Free tier.** Very similar to Vercel.

1. Go to [netlify.com](https://app.netlify.com)
2. Drag and drop the `dist/` folder, OR connect GitHub repo
3. Build settings: Build command = `npm run build`, Publish directory = `dist`

**Custom domain:** Site Settings > Domain management > Add custom domain
**DNS:** CNAME `gameiq` → `your-site.netlify.app`

---

### Option 3: GitHub Pages

**Free.** Good if code is already on GitHub.

1. Push code to GitHub
2. Install gh-pages: `npm install gh-pages -D`
3. Add to package.json scripts: `"deploy": "npm run build && gh-pages -d dist"`
4. Run `npm run deploy`

**Custom domain:** Add a `CNAME` file to `dist/` with `gameiq.daitiq.com`
**DNS:** CNAME `gameiq` → `yourusername.github.io`

**Note:** GitHub Pages doesn't support SPA routing out of the box. You'll need a `404.html` that redirects to `index.html`.

---

### Option 4: Cloudflare Pages

**Free tier.** Excellent global CDN performance.

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub repo
3. Build settings: Build command = `npm run build`, Output directory = `dist`

**Custom domain:** If your DNS is already on Cloudflare, just add a CNAME record.
**DNS:** CNAME `gameiq` → `your-project.pages.dev`

---

### Option 5: Firebase Hosting

**Free tier** from Google.

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # Set public directory to "dist", configure as SPA
npm run build
firebase deploy
```

**Custom domain:** Firebase console > Hosting > Add custom domain

---

### Option 6: Self-Hosted (VPS / Your Own Server)

Any server that can serve static files works. Examples: DigitalOcean ($4/mo), Linode, AWS Lightsail, Hetzner.

```bash
# On your server
npm run build
# Copy dist/ to your server
scp -r dist/ user@your-server:/var/www/gameiq/

# Nginx config
server {
    listen 80;
    server_name gameiq.daitiq.com;
    root /var/www/gameiq;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Add SSL with Let's Encrypt: `sudo certbot --nginx -d gameiq.daitiq.com`

**DNS:** A record `gameiq` → your server's IP address

---

## Custom Domain (All Hosts)

Regardless of hosting provider, the domain setup is:

1. **In your host's dashboard:** Add `gameiq.daitiq.com` as a custom domain
2. **In your DNS provider (for daitiq.com):** Add a CNAME record:
   ```
   Type:  CNAME
   Name:  gameiq
   Value: [provided by your host]
   TTL:   Auto or 3600
   ```
3. Wait for DNS propagation (usually under 10 minutes, can take up to 48 hours)
4. SSL/HTTPS is typically auto-provisioned by the host

---

## Verify Deployment

After deployment, check:

1. **Site loads:** `https://gameiq.daitiq.com`
2. **All 4 games work:** `/blindspot`, `/trend`, `/rank`, `/crossfire`
3. **PWA installable:** Install prompt appears on mobile
4. **OG image shows:** Share link on Twitter/Slack/iMessage and check preview
5. **Share button works:** Play a game, tap Share, paste clipboard

### OG Image Testing Tools
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [OpenGraph.xyz](https://www.opengraph.xyz/)

---

## Environment Notes

- No environment variables needed
- No backend or database
- All player progress saved in browser localStorage
- Fully static — works on any file server
- Service worker enables offline play after first visit
