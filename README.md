# Status Badge 2.0

> **Free forever status monitoring badges** — Pure client-side, zero dependencies

Status badges shouldn't cost $15/month. Status Badge 2.0 runs entirely in the browser.

[![Live Demo](https://img.shields.io/badge/demo-live_success?style=flat-square)](https://ozxc44.github.io/status-badge-2/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What is Status Badge 2.0?

A **pure client-side status monitoring badge** you can embed in any website:

- 🚀 **One-line embed** — Just add a `<script>` tag
- 💰 **Free forever** — Runs in the browser, no server costs
- 🔒 **Style-safe** — Shadow DOM won't break your site's CSS
- 📊 **Shows** — Status + response time
- 📦 **Zero deps** — Pure JavaScript, no bloat
- 🌐 **CORS-friendly** — Works with any API that has CORS enabled

**Perfect for**: API status pages, service health dashboards, uptime monitoring badges.

## Quick Start

### Option 1: Use from CDN (Coming Soon)

```html
<script src="https://cdn.jsdelivr.net/npm/status-badge-2/badge.js?url=https://api.example.com/health"></script>
```

### Option 2: Self-Host

1. Download `badge.js` and host it on your site:
```html
<script src="/path/to/badge.js?url=https://api.example.com/health"></script>
```

### Option 3: Cloudflare Worker (Optional)

For centralized caching and CORS proxy, deploy the included Worker:

```bash
npm install
npx wrangler publish
```

Then use:
```html
<script src="https://your-worker.workers.dev/badge.js?url=https://api.example.com/health"></script>
```

## Live Demo

https://ozxc44.github.io/status-badge-2/

## Configuration

Configure via `data-*` attributes:

```html
<script src="badge.js?url=YOUR_URL"
  data-interval="30000"
  data-timeout="10000"
  data-method="HEAD"
  data-show-response-time="true"
  data-cache="60"></script>
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-interval` | `30000` | Check interval in milliseconds |
| `data-timeout` | `10000` | Request timeout in milliseconds |
| `data-method` | `HEAD` | HTTP method (`HEAD` or `GET`) |
| `data-show-response-time` | `true` | Show response time |
| `data-cache` | `60` | Cache duration in seconds |

## Architecture

### Pure Client-Side (Default)

```
User page → <script> badge → Browser fetch → Target API
```

- No server required
- Uses browser cache (in-memory, per tab)
- Requires CORS on target API

### With Cloudflare Worker (Optional)

```
User page → <script> badge → Worker → KV cache → Target API
```

- Centralized caching (shared across users)
- CORS proxy for APIs without CORS
- Deploy using `wrangler publish`

## Use Cases

| Use Case | How |
|----------|-----|
| **API Status Page** | Show your API's uptime to users |
| **Service Health Dashboard** | Monitor multiple services in one place |
| **Personal Project Monitoring** | Track side projects without paying SaaS fees |
| **Team Status Board** | Internal service visibility |
| **README Badges** | Show service status in project documentation |

## Why Client-Side?

Most status badge services charge $15+/month for what's essentially a periodic ping.

Running entirely in the browser means:
- **No server costs** — Host on GitHub Pages, Netlify, or any static CDN
- **No rate limits** — Each visitor checks from their browser
- **Privacy** — Checks come from your users, not a central server
- **Simplicity** — One file, no build process

## CORS Requirements

The pure client-side version requires your target API to have CORS enabled. If your API doesn't support CORS:

1. Enable CORS on your API
2. Use the Cloudflare Worker version (acts as a CORS proxy)
3. Self-host the badge on the same domain as your API

## Keywords

status badge, status monitoring, uptime monitoring, client-side monitoring, free status page, API monitoring, status widget, status indicator, uptime badge, health check, status page, service monitoring, zero-dependency

## License

MIT
