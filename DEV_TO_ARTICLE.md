---
title: "Why I Built a Free Alternative to $15/Month Status Badges"
published: false
description: "Status badges shouldn't cost monthly fees. Cloudflare Workers makes free forever possible."
tags: [javascript, cloudflare, webdev, monitoring, serverless]
---

# Why I Built a Free Alternative to $15/Month Status Badges

Ever looked at status badge pricing? $15/month for... periodic HTTP pings.

That's it. Just ping a URL, store the result, display a badge.

## The Problem

I wanted to add a status badge to my side project. I checked the popular options:

- **Service A**: $15/month for 50 badges
- **Service B**: $19/month for 10 monitors
- **Service C**: $10/month, up to 5 badges

For what? A `curl` every minute and a JSON response.

## The Solution

Cloudflare Workers free tier: **100K requests/day**.

That's ~70 badges checking every single minute. Forever. For free.

So I built **Status Badge 2.0** — a serverless status badge that:

- ✅ Runs on Cloudflare Workers (edge network, <50ms global)
- ✅ Stores data in Cloudflare KV (global cache)
- ✅ One-line embed: `<script src="..."></script>`
- ✅ Shadow DOM (won't break your styles)
- ✅ MIT licensed (self-host if you want)

## One-Line Embed

```html
<script src="https://your-worker.workers.dev/v1/YOUR_ID.js"></script>
```

That's it. The badge shows:
- Current status (Online/Offline)
- Response time
- Uptime percentage (24h)
- Link to status history

## Architecture

```
User's Website
    ↓
<script src="badge.js">
    ↓
Shadow DOM Widget (isolated styles)
    ↓
Cloudflare Worker (Edge)
    ↓
Cloudflare KV (Global Cache)
    ↓
Target API (Health Check)
```

## Get Started

```bash
git clone https://github.com/ozxc44/status-badge-2
cd status-badge-2
npm install
wrangler deploy
```

Create a monitor via API:

```bash
curl -X POST https://your-worker.workers.dev/api/monitors \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://api.example.com/health",
    "name": "My API"
  }'
```

Response:

```json
{
  "id": "abc123xy",
  "embedUrl": "https://your-worker.workers.dev/v1/abc123xy.js",
  "apiUrl": "https://your-worker.workers.dev/api/status/abc123xy"
}
```

## The Math

On Cloudflare's free tier:
- 100K requests/day
- 1 badge × 1440 checks/day (every minute)
- = 69 badges max

Reduce frequency to 5 minutes → **347 badges for free**.

## Live Demo

[ozxc44.github.io/status-badge-2](https://ozxc44.github.io/status-badge-2/)

## GitHub

[github.com/ozxc44/status-badge-2](https://github.com/ozxc44/status-badge-2)

---

**TL;DR**: Don't pay $15/month for status badges. Cloudflare Workers + 100 lines of JS = free forever.
