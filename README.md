# Status Badge 2.0

<div align="center">

**Serverless status monitoring badge. Free forever on Cloudflare Workers.**

[![stars](https://img.shields.io/github/stars/ozxc44/status-badge-2?style=social)](https://github.com/ozxc44/status-badge-2/stargazers)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

[Live Demo](https://ozxc44.github.io/status-badge-2/) • [Quick Start](#quick-start) • [API Docs](#api-endpoints) • [Deployment](#deployment)

</div>

---

A drop-in status widget for your website or API. Just add one line of JavaScript, and you get a beautiful, real-time status badge showing:

- ✅ Current status (Online/Offline) with animated pulse
- ⏱️ Response time
- 📊 Uptime percentage (24h)
- 🔗 Quick link to status history

## Why Status Badge 2.0?

- **Zero infrastructure** — Runs on Cloudflare Workers, no servers to manage
- **Free forever** — 100K requests/day on free tier (~70 badges with 1-min checks)
- **One-line embed** — `<script src="..."></script>` and you're done
- **Shadow DOM** — Isolated styles won't break your site
- **Edge-fast** — Global CDN, responses in <50ms
- **No dependencies** — Pure JavaScript, no npm bloat

## Preview

### Light Mode
Shows status indicator, response time, and uptime percentage:

```
┌────────────────────────────────────────────┐
│ ● Online  • 45ms  • 99.9% uptime           │
└────────────────────────────────────────────┘
```

### Dark Mode
Automatically adapts to dark-themed websites:

```
┌────────────────────────────────────────────┐
│ ● Online  • 45ms  • 99.9% uptime           │
└────────────────────────────────────────────┘
```

> **🎨 Try the [Live Demo](https://ozxc44.github.io/status-badge-2/)** to see it in action!

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

## Use Cases

| Scenario | How to Use |
|----------|------------|
| **API Status Page** | Monitor REST/GraphQL endpoints and show status on your docs |
| **SaaS Dashboard** | Let customers see your service status without leaving your app |
| **CI/CD Pipeline** | Show build/deployment status on your README or docs |
| **Microservices** | Monitor multiple services from a single dashboard |
| **Personal Projects** | Keep track of side projects, cron jobs, or scheduled tasks |

## Examples

### Example 1: Monitor a REST API

```javascript
// Create monitor
await fetch('https://your-worker.workers.dev/api/monitors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetUrl: 'https://api.example.com/health',
    name: 'My API'
  })
});

// Returns: { id: 'abc123xy', embedUrl: 'https://...' }
```

### Example 2: Multiple Badges

```html
<!-- Monitor different services -->
<script src="https://your-worker.workers.dev/v1/api-badge.js"></script>
<script src="https://your-worker.workers.dev/v1/db-badge.js"></script>
<script src="https://your-worker.workers.dev/v1/cache-badge.js"></script>
```

### Example 3: Custom Theme

```javascript
// Create with dark theme for dark websites
await fetch('https://your-worker.workers.dev/api/monitors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetUrl: 'https://api.example.com/health',
    name: 'My API',
    theme: 'dark'  // 'default', 'dark', or 'minimal'
  })
});
```

### Example 4: JSON Integration

```javascript
// Get status data for custom display
const response = await fetch('https://your-worker.workers.dev/v1/abc123xy.json');
const data = await response.json();

// {
//   id: "abc123xy",
//   config: { targetUrl: "...", name: "..." },
//   status: { online: true, responseTime: 45, code: 200 },
//   uptime: { percentage: 99.9, period: "24h" }
// }

// Build your own UI
if (data.status.online) {
  document.getElementById('status').textContent = `✓ Online (${data.status.responseTime}ms)`;
} else {
  document.getElementById('status').textContent = `✗ Offline (${data.status.error})`;
}
```

## Troubleshooting

### Badge not showing?
1. Check browser console for errors
2. Verify the worker URL is correct
3. Ensure CORS is enabled (default: enabled)

### Status always offline?
1. Test your target URL: `curl https://your-api.com/health`
2. Check that it returns HTTP 2xx status
3. Verify no auth/CORS issues with the target

### Want faster updates?
The badge caches status for 60 seconds. You can:
- Force a check: `fetch('/v1/ID/check')`
- Reduce cache TTL in the worker code
- Implement server-sent events for real-time updates

## Roadmap

- [ ] Webhook notifications (Slack, Discord, Email)
- [ ] Historical status charts
- [ ] Custom badge styling via URL params
- [ ] Multi-region checks
- [ ] Status page templates
- [ ] Team collaboration features

**Have a request?** [Open an issue](https://github.com/ozxc44/status-badge-2/issues)!

## More from Auto Company

| Project | Description | Stars |
|---------|-------------|-------|
| [badge-generator](https://github.com/ozxc44/badge-generator) | Complete GitHub badge reference | [![stars](https://img.shields.io/github/stars/ozxc44/badge-generator?style=social)](https://github.com/ozxc44/badge-generator/stargazers) |
| [docuapi](https://github.com/ozxc44/docuapi) | API documentation generator | [![stars](https://img.shields.io/github/stars/ozxc44/docuapi?style=social)](https://github.com/ozxc44/docuapi/stargazers) |
| [auto-promoter](https://github.com/ozxc44/auto-promoter) | Auto-promotion CLI tool | [![stars](https://img.shields.io/github/stars/ozxc44/auto-promoter?style=social)](https://github.com/ozxc44/auto-promoter/stargazers) |
| [status-widget](https://github.com/ozxc44/status-widget) | Express-based status page with dashboard | [![stars](https://img.shields.io/github/stars/ozxc44/status-widget?style=social)](https://github.com/ozxc44/status-widget/stargazers) |
| [cron-monitor](https://github.com/ozxc44/cron-monitor) | Cron job monitoring with alerts | [![stars](https://img.shields.io/github/stars/ozxc44/cron-monitor?style=social)](https://github.com/ozxc44/cron-monitor/stargazers) |
| [queue-monitor](https://github.com/ozxc44/queue-monitor-dev) | Bull/BullMQ queue monitoring dashboard | [![stars](https://img.shields.io/github/stars/ozxc44/queue-monitor-dev?style=social)](https://github.com/ozxc44/queue-monitor-dev/stargazers) |

## Contributing

Contributions welcome! Feel free to:
1. Report bugs via [issues](https://github.com/ozxc44/status-badge-2/issues)
2. Suggest features via [discussions](https://github.com/ozxc44/status-badge-2/discussions)
3. Submit pull requests

## License

MIT

## Author

Built by [Auto Company](https://github.com/ozxc44) — an autonomous AI company experimenting with serverless micro-SaaS products.

---

**Note:** This is Status Badge 2.0, a complete rewrite from the Express-based status-widget. Fully serverless, fully edge, forever free.
