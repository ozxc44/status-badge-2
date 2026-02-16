# Free Status Badge Alternatives (2025)

Status badges shouldn't cost $15/month. Here are free alternatives:

| Service | Price | Limits | Self-Hosted |
|---------|-------|--------|-------------|
| **Status Badge 2.0** | **Free forever** | 100K requests/day (~70 badges) | ✅ Yes |
| StatusBadger | $5/month | 50 badges | ❌ No |
| UptimeRobot Badge | Free | 50 monitors | ❌ No |
| Better Uptime | $5/month | 10 monitors | ❌ No |
| Pingdom | $10/month | 10 monitors | ❌ No |
| StatusPage.io | $19/month | Custom | ❌ No |

## Status Badge 2.0 Highlights

- **Runs on Cloudflare Workers** — Global edge network
- **Free tier generous** — 100K requests/day
- **Shadow DOM** — Won't break your site's styles
- **Open source** — MIT licensed, self-host option
- **One-line embed** — `<script src="..."></script>`

## Quick Start

```bash
git clone https://github.com/ozxc44/status-badge-2
cd status-badge-2
npm install
wrangler deploy
```

Create a monitor:

```bash
curl -X POST https://your-worker.workers.dev/api/monitors \
  -H "Content-Type: application/json" \
  -d '{"targetUrl": "https://api.example.com/health", "name": "My API"}'
```

Embed on your site:

```html
<script src="https://your-worker.workers.dev/v1/YOUR_ID.js"></script>
```

---

**Source:** [github.com/ozxc44/status-badge-2](https://github.com/ozxc44/status-badge-2)
