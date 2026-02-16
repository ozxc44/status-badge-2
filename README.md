# Status Badge 2.0

> **Free forever status monitoring badges** — Serverless, on Cloudflare Workers

Status badges shouldn't cost $15/month. Status Badge 2.0 runs on Cloudflare's free tier.

[![Live Demo](https://img.shields.io/badge/demo-live_success?style=flat-square)](https://ozxc44.github.io/status-badge-2/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What is Status Badge 2.0?

A **serverless status monitoring badge** you can embed in any website:

- 🚀 **One-line embed** — Just add a `<script>` tag
- 💰 **Free forever** — Runs on Cloudflare Workers free tier (100K requests/day)
- 🔒 **Style-safe** — Shadow DOM won't break your site's CSS
- 📊 **Shows** — Uptime percentage + response time
- 📦 **Zero deps** — Pure JavaScript, no bloat

**Perfect for**: API status pages, service health dashboards, uptime monitoring badges.

## Features

- **One-line embed**: `<script src="https://status-badge-2.ozxc44.workers.dev/badge.js?url=YOUR_URL"></script>`
- **Runs on Cloudflare Workers** (100K requests/day free)
- **Shadow DOM** (won't break your site's styles)
- **Response time + uptime percentage**
- **No dependencies**, pure JavaScript

## Live Demo

https://ozxc44.github.io/status-badge-2/

## Quick Start

1. Add the script tag to your page:
```html
<script src="https://status-badge-2.ozxc44.workers.dev/badge.js?url=https://api.example.com/health"></script>
```

2. The badge appears wherever you placed it.

## Architecture

```
User page → <script> badge → Worker → KV cache → Target API
```

**Cache strategy:**
- Fresh (<30s): return immediately
- Stale (>30s): return cached, background refresh
- Missing: synchronous check, cache 60s

## Pricing

**Free tier:**
- ~70 badges @ 1-minute checks
- Genuinely useful for monitoring

**Paid tier (coming soon):**
- More badges
- Faster check intervals
- Custom domains

## Why?

Most status badge services charge $15+/month for what's essentially a periodic ping.

Cloudflare's free tier (100K requests/day) makes this trivial to run for free.

---

## Use Cases

| Use Case | How |
|----------|-----|
| **API Status Page** | Show your API's uptime to users |
| **Service Health Dashboard** | Monitor multiple services in one place |
| **Personal Project Monitoring** | Track side projects without paying SaaS fees |
| **Team Status Board** | Internal service visibility |
| **README Badges** | Show service status in project documentation |

---

## Keywords

status badge, status monitoring, uptime monitoring, Cloudflare Workers, serverless monitoring, free status page, API monitoring, status widget, status indicator, uptime badge, health check, status page, service monitoring

## License

MIT
