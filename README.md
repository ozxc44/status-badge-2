# Status Badge 2.0

> Free forever status monitoring on Cloudflare Workers

Status badges shouldn't cost $15/month. Status Badge 2.0 runs on Cloudflare's free tier.

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

## License

MIT
