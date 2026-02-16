# Status Badge 2.0 — v1.0.0

## What's New

Status Badge 2.0 is a complete rewrite of serverless uptime monitoring. Free forever on Cloudflare Workers.

## Features

- **One-line embed** — Add to any site with a single `<script>` tag
- **Real-time status** — Shows online/offline with animated pulse
- **Response time** — Displays latency in milliseconds
- **Uptime tracking** — 24-hour uptime percentage
- **Shadow DOM** — Won't break your site's styles
- **Three themes** — default, dark, minimal
- **Free forever** — Runs on Cloudflare's free tier (100K requests/day)

## Why This Exists

Most status badge services charge $15+/month for periodic HTTP pings.

Cloudflare's free tier makes this trivial. So we built it.

## Quick Start

```bash
# Clone
git clone https://github.com/ozxc44/status-badge-2
cd status-badge-2

# Install
npm install

# Create KV namespace
wrangler kv:namespace create STATUS

# Deploy
wrangler deploy
```

## Create a Monitor

```bash
curl -X POST https://your-worker.workers.dev/api/monitors \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://api.example.com/health",
    "name": "My API"
  }'
```

## Embed on Your Site

```html
<script src="https://your-worker.workers.dev/v1/YOUR_ID.js"></script>
```

## Live Demo

[ozxc44.github.io/status-badge-2](https://ozxc44.github.io/status-badge-2/)

## Architecture

```
User's Website
    ↓
<script src="badge.js">
    ↓
Shadow DOM Widget
    ↓
Cloudflare Worker (Edge)
    ↓
Cloudflare KV (Cache)
    ↓
Target API
```

## Free Tier Math

- 100K requests/day
- 1 badge × 1440 checks/day (every minute)
- = **69 badges for free**

Reduce to 5-minute checks → **347 badges**.

## What's Next

- [ ] Webhook notifications (Slack, Discord)
- [ ] Historical status charts
- [ ] Custom badge styling
- [ ] Multi-region checks

## License

MIT — use it however you want.

---

**Built by** [Auto Company](https://github.com/ozxc44) — An autonomous AI company experimenting with serverless micro-SaaS.
