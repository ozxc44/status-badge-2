# Self-Host Status Badge 2.0

Status Badge 2.0 is designed to be **self-hosted on Cloudflare Workers Free Tier** — no monthly fees, unlimited requests.

## Quick Start (5 minutes)

### Option 1: Deploy Your Own Worker

```bash
# 1. Clone the repo
git clone https://github.com/ozxc44/status-badge-2.git
cd status-badge-2/worker

# 2. Install dependencies
npm install

# 3. Deploy to Cloudflare
npx wrangler publish

# 4. Use your custom URL
<script src="https://your-worker.workers.dev/badge.js?url=YOUR_URL"></script>
```

### Option 2: Copy the Worker Code

Copy the code from `worker/index.js` and deploy to any platform:

- **Cloudflare Workers** (recommended, free tier)
- **Vercel Edge Functions**
- **Netlify Edge Functions**
- **AWS Lambda@Edge**
- **Deno Deploy**

## Embed Code

### Basic Usage

```html
<script src="https://ozxc44.github.io/status-badge-2/badge.js?url=https://api.example.com"></script>
```

### With Options

```html
<script src="https://ozxc44.github.io/status-badge-2/badge.js?url=https://api.example.com&theme=dark&label=API"></script>
```

### In React

```jsx
function StatusBadge({ url }) {
  return (
    <div>
      <script
        src={`https://ozxc44.github.io/status-badge-2/badge.js?url=${encodeURIComponent(url)}`}
        async
      ></script>
    </div>
  );
}
```

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `url` | - | **Required**: The URL to monitor |
| `theme` | `light` | `light`, `dark`, or `auto` |
| `label` | `Status` | Custom label text |
| `show-response-time` | `true` | Show/hide response time |
| `refresh-interval` | `60` | Check interval in seconds |

## Cost Breakdown

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Cloudflare Workers | 100,000 requests/day | $5/month for 10M |
| Vercel Edge | 100K requests/month | $20/month |
| Deno Deploy | 100K requests/day | $10/month |

**Status Badge 2.0 costs $0/month on Cloudflare free tier.**

## Troubleshooting

### Badge shows "Unknown"

- Check browser console for CORS errors
- Verify the target URL allows cross-origin requests
- Some APIs block status checks — use a proxy endpoint

### Worker not responding

- Verify Worker is deployed: `wrangler deployments list`
- Check logs: `wrangler tail`
- Ensure `url` parameter is properly encoded

### Want to monitor internal APIs

For private APIs, use the **proxy mode**:

```javascript
// In your Worker
const targetUrl = 'https://internal-api.example.com/health';
const response = await fetch(targetUrl, {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
```

## Advanced: Custom Endpoints

Create your own badge endpoints:

```javascript
// worker/custom-badge.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    const start = Date.now();
    const response = await fetch(target);
    const duration = Date.now() - start;

    return new Response(`
      <status-badge
        status="${response.ok ? 'up' : 'down'}"
        duration="${duration}ms"
        url="${target}"
      ></status-badge>
    `, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
```

## Support

- GitHub Issues: https://github.com/ozxc44/status-badge-2/issues
- Demo: https://ozxc44.github.io/status-badge-2/

---

**No credit card required. No monthly fees. Open source.**
