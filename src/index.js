/**
 * Status Badge 2.0 — Main Entry Point
 *
 * A serverless status badge service running on Cloudflare Workers.
 * Zero dependencies, pure JavaScript, free tier forever.
 *
 * @version 1.0.0
 * @license MIT
 */

import { checkTarget } from './checker.js';
import { renderSVG } from './svg.js';
import { generateBadgeJS } from './badge.js';

/**
 * Simple URL router
 */
class Router {
  constructor() {
    this.routes = [];
  }

  get(pattern, handler) {
    this.routes.push({ method: 'GET', pattern, handler });
  }

  post(pattern, handler) {
    this.routes.push({ method: 'POST', pattern, handler });
  }

  match(path, method) {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      // Convert pattern to regex (e.g., "/v1/:id.js" to /^\/v1\/([^/]+)\.js$/)
      const patternRegex = route.pattern
        .replace(/:[^/.]+/g, '([^/]+)')
        .replace(/\./g, '\\.');

      const regex = new RegExp(`^${patternRegex}$`);
      const match = path.match(regex);

      if (match) {
        return { handler: route.handler, params: match.slice(1) };
      }
    }

    return null;
  }
}

/**
 * Main fetch handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const router = new Router();

    // Public API endpoints
    router.get('/v1/:id.js', handleBadgeJS);
    router.get('/v1/:id.svg', handleBadgeSVG);
    router.get('/v1/:id.json', handleBadgeJSON);
    router.get('/api/status/:id', handleBadgeJSON); // Alias
    router.get('/v1/:id/check', handleForceCheck);
    router.post('/api/monitors', handleCreateMonitor);

    // Admin/management endpoints
    router.get('/health', handleHealth);
    router.get('/', handleHome);

    // Match route
    const match = router.match(path, method);

    if (match) {
      try {
        const response = await match.handler(
          request,
          env,
          ctx,
          url,
          match.params
        );

        // Add CORS headers to all responses
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([k, v]) => {
          newHeaders.set(k, v);
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        return jsonResponse(
          { error: error.message, status: 'error' },
          500,
          corsHeaders
        );
      }
    }

    // 404
    return jsonResponse(
      { error: 'Not found', status: 'error' },
      404,
      corsHeaders
    );
  },
};

/**
 * Handlers
 */

async function handleBadgeJS(request, env, ctx, url, params) {
  const [id] = params;
  const baseUrl = `${url.protocol}//${url.host}`;

  // Get badge config from KV
  const config = await env.STATUS.get(`badge:${id}`, 'json');

  if (!config) {
    return jsonResponse({ error: 'Badge not found', status: 'error' }, 404);
  }

  // Generate JS widget code
  const jsCode = generateBadgeJS(id, baseUrl, config);

  return new Response(jsCode, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // 5 minutes
    },
  });
}

async function handleBadgeSVG(request, env, ctx, url, params) {
  const [id] = params;

  const data = await getStatusData(id, env, ctx);

  const svg = renderSVG(data);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60', // 1 minute
    },
  });
}

async function handleBadgeJSON(request, env, ctx, url, params) {
  const [id] = params;

  const data = await getStatusData(id, env, ctx);

  if (!data.config) {
    return jsonResponse({ error: 'Badge not found', status: 'error' }, 404);
  }

  return jsonResponse(data);
}

async function handleForceCheck(request, env, ctx, url, params) {
  const [id] = params;

  const config = await env.STATUS.get(`badge:${id}`, 'json');

  if (!config) {
    return jsonResponse({ error: 'Badge not found', status: 'error' }, 404);
  }

  // Force synchronous check
  const status = await checkTarget(config.targetUrl);

  // Update cache
  await env.STATUS.put(`status:${id}`, JSON.stringify(status), {
    expirationTtl: 60,
  });

  // Update history
  await updateHistory(id, env, status);

  return jsonResponse({
    id,
    status,
    timestamp: Date.now(),
  });
}

async function handleCreateMonitor(request, env, ctx, url, params) {
  const body = await request.json();
  const { targetUrl, name, theme = 'default' } = body;

  if (!targetUrl) {
    return jsonResponse({ error: 'targetUrl is required', status: 'error' }, 400);
  }

  // Validate URL
  try {
    new URL(targetUrl);
  } catch {
    return jsonResponse({ error: 'Invalid URL', status: 'error' }, 400);
  }

  // Generate unique ID
  const id = generateId();

  const config = {
    id,
    targetUrl,
    name: name || targetUrl,
    theme,
    createdAt: Date.now(),
    lastCheck: 0,
  };

  // Save config
  await env.STATUS.put(`badge:${id}`, JSON.stringify(config));

  // Initial check
  const status = await checkTarget(targetUrl);
  await env.STATUS.put(`status:${id}`, JSON.stringify(status), {
    expirationTtl: 60,
  });

  return jsonResponse(
    {
      id,
      embedUrl: `${url.origin}/v1/${id}.js`,
      apiUrl: `${url.origin}/api/status/${id}`,
      config,
      initialStatus: status,
    },
    201
  );
}

async function handleHealth(request, env, ctx, url, params) {
  return jsonResponse({
    status: 'ok',
    version: '1.0.0',
    timestamp: Date.now(),
  });
}

async function handleHome(request, env, ctx, url, params) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Badge 2.0</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'SF Mono', 'Consolas', monospace; font-size: 14px; }
    h1 { color: #333; }
    .section { margin: 30px 0; }
    .badge { display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Status Badge 2.0</h1>
  <p>Serverless status monitoring badge. Free forever on Cloudflare Workers.</p>

  <div class="section">
    <h2>Create a Monitor</h2>
    <pre><code>curl -X POST ${url.origin}/api/monitors \\
  -H "Content-Type: application/json" \\
  -d '{"targetUrl": "https://example.com", "name": "Example API"}'</code></pre>
  </div>

  <div class="section">
    <h2>Embed on Your Site</h2>
    <pre><code>&lt;script src="${url.origin}/v1/YOUR_ID.js"&gt;&lt;/script&gt;</code></pre>
  </div>

  <div class="section">
    <h2>API Endpoints</h2>
    <ul>
      <li><code>GET /v1/:id.js</code> — Embeddable JavaScript widget</li>
      <li><code>GET /v1/:id.svg</code> — SVG badge image</li>
      <li><code>GET /v1/:id.json</code> — JSON status data</li>
      <li><code>GET /v1/:id/check</code> — Force status check</li>
      <li><code>POST /api/monitors</code> — Create new monitor</li>
    </ul>
  </div>

  <div class="section">
    <h2>Health Check</h2>
    <pre><code>curl ${url.origin}/health</code></pre>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Helper functions
 */

async function getStatusData(id, env, ctx) {
  // Get config
  const config = await env.STATUS.get(`badge:${id}`, 'json');

  if (!config) {
    return { config: null };
  }

  // Get cached status
  let status = await env.STATUS.get(`status:${id}`, 'json');

  if (!status) {
    // First request: synchronous check
    status = await checkTarget(config.targetUrl);
    await env.STATUS.put(`status:${id}`, JSON.stringify(status), {
      expirationTtl: 60,
    });
  } else {
    // Stale-while-revalidate: check if stale
    const age = Date.now() - status.timestamp;

    if (age > 30000) {
      // 30 seconds stale — trigger background refresh
      ctx.waitUntil(
        (async () => {
          const fresh = await checkTarget(config.targetUrl);
          await env.STATUS.put(`status:${id}`, JSON.stringify(fresh), {
            expirationTtl: 60,
          });
          await updateHistory(id, env, fresh);
        })()
      );
    }
  }

  // Get history
  const historyData = await env.STATUS.get(`history:${id}`, 'json');
  const uptime = calculateUptime(historyData?.data || []);

  return {
    id,
    config,
    status: {
      online: status.isOnline,
      code: status.statusCode,
      responseTime: status.responseTime,
      timestamp: status.timestamp,
      error: status.error,
    },
    uptime: {
      percentage: uptime,
      period: '24h',
    },
    history: historyData?.data || [],
  };
}

async function updateHistory(id, env, status) {
  const historyKey = `history:${id}`;
  const existing = await env.STATUS.get(historyKey, 'json') || { data: [] };

  // Add new data point
  existing.data.push({
    t: status.timestamp,
    s: status.isOnline,
    rt: status.responseTime,
  });

  // Keep only 72 data points (24 hours, one per hour in production)
  // For now, keep 100 points
  if (existing.data.length > 100) {
    existing.data.shift();
  }

  await env.STATUS.put(historyKey, JSON.stringify(existing), {
    expirationTtl: 86400, // 24 hours
  });
}

function calculateUptime(history) {
  if (history.length === 0) return null;

  const onlineCount = history.filter((h) => h.s).length;
  return Math.round((onlineCount / history.length) * 100 * 10) / 10;
}

function generateId() {
  // Simple random ID generator
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}
