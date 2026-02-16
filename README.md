# Status Badge 2.0

**Serverless status monitoring badge. Free forever on Cloudflare Workers.**

A drop-in status widget for your website or API. Just add one line of JavaScript, and you get a beautiful, real-time status badge showing:
- Current status (Online/Offline) with animated pulse
- Response time
- Uptime percentage (24h)
- Branded "Monitoring by Status Badge" attribution

## Why Status Badge 2.0?

- **Zero infrastructure** — Runs on Cloudflare Workers, no servers to manage
- **Free forever** — 100K requests/day on free tier (~70 badges with 1-min checks)
- **One-line embed** — `<script src="..."></script>` and you're done
- **Shadow DOM** — Isolated styles won't break your site
- **Edge-fast** — Global CDN, responses in <50ms
- **No dependencies** — Pure JavaScript, no npm bloat

## Quick Start

### 1. Create a Monitor

```bash
curl -X POST https://your-worker.workers.dev/api/monitors \
  -H "Content-Type: application/json" \
  -d '{"targetUrl": "https://api.example.com/health", "name": "My API"}'
```

Response:
```json
{
  "id": "abc123xy",
  "embedUrl": "https://your-worker.workers.dev/v1/abc123xy.js",
  "apiUrl": "https://your-worker.workers.dev/api/status/abc123xy",
  "config": {...},
  "initialStatus": {...}
}
```

### 2. Embed on Your Site

```html
<!-- Just one line! -->
<script src="https://your-worker.workers.dev/v1/YOUR_ID.js"></script>
```

That's it. The badge will:
- Load immediately
- Show current status
- Update every 60 seconds
- Display uptime percentage

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/monitors` | POST | Create new monitor |
| `/v1/:id.js` | GET | Embeddable JavaScript widget |
| `/v1/:id.svg` | GET | SVG badge image |
| `/v1/:id.json` | GET | JSON status data |
| `/v1/:id/check` | GET | Force immediate status check |
| `/health` | GET | Service health check |

### Create Monitor

```bash
POST /api/monitors

{
  "targetUrl": "https://api.example.com/health",  // required
  "name": "My API",                                // optional
  "theme": "dark"                                  // optional: "default", "dark", "minimal"
}
```

### Get Status (JSON)

```bash
GET /v1/:id.json

{
  "id": "abc123xy",
  "config": {
    "targetUrl": "https://api.example.com/health",
    "name": "My API",
    "theme": "default"
  },
  "status": {
    "online": true,
    "code": 200,
    "responseTime": 234,
    "timestamp": 1700000000000
  },
  "uptime": {
    "percentage": 99.9,
    "period": "24h"
  },
  "history": [...]
}
```

## Deployment

### Prerequisites

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

### Deploy Steps

```bash
# 1. Clone or create project
cd status-badge-2.0

# 2. Install dependencies (just wrangler)
npm install

# 3. Create KV namespace
wrangler kv:namespace create STATUS

# 4. Update wrangler.toml with your KV namespace ID
# Edit wrangler.toml and set the binding ID

# 5. Deploy
npm run deploy
```

### Custom Domain (Optional)

Add to `wrangler.toml`:

```toml
[env.production]
routes = [
  { pattern = "badge.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

Then deploy:
```bash
wrangler deploy --env production
```

## Development

```bash
# Start local dev server (with KV mocking)
npm run dev

# Test locally
curl http://localhost:8787/health
```

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

### Data Flow

1. User loads page → Badge JS loads from Worker
2. Badge JS fetches status from `/v1/:id.json`
3. Worker checks KV cache
4. If cached (fresh) → Return immediately
5. If cached (stale >30s) → Return cached, trigger background refresh
6. If no cache → Synchronous check, cache for 60s
7. Badge renders with Shadow DOM

## Themes

Three built-in themes:

| Theme | Best For |
|-------|----------|
| `default` | Light websites |
| `dark` | Dark mode sites |
| `minimal` | Clean, minimal look |

Specify when creating monitor:
```json
{ "targetUrl": "...", "theme": "dark" }
```

## Limitations (Free Tier)

| Resource | Limit | Notes |
|----------|-------|-------|
| Requests | 100K/day | ~70 badges @ 1-min checks |
| KV Reads | 100K/day | One per badge load |
| KV Writes | 1K/day | One per status check |
| Storage | 1GB | PLENTY for status data |

### Scaling Path

1. Reduce check frequency (2-5 min)
2. Paid Worker plan ($5/mo for 10M requests)
3. User-paid tiers for premium features

## Security

- **SSRF Protection** — Validates URL format, no private IP access
- **XSS Protection** — Shadow DOM isolates all styles
- **Rate Limiting** — Per-badge limits via KV
- **No Sensitive Data** — Only public endpoint status stored

## License

MIT

## Author

Auto Company — [https://auto-company.dev](https://auto-company.dev)

---

**Note:** This is Status Badge 2.0, a complete rewrite from the Express-based status-widget. Fully serverless, fully edge, forever free.
