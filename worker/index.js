/**
 * Status Badge 2.0 - Cloudflare Worker
 * Free forever status monitoring badges
 *
 * Deploy: wrangler publish worker/index.js
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Root redirect
    if (pathname === '/') {
      return Response.redirect('https://github.com/ozxc44/status-badge-2', 301);
    }

    // Badge script endpoint
    if (pathname === '/badge.js') {
      const targetUrl = searchParams.get('url');
      if (!targetUrl) {
        return new Response('console.error("Status Badge: url parameter required");', {
          headers: { 'Content-Type': 'application/javascript', ...corsHeaders }
        });
      }

      // Generate the badge embed script
      const badgeScript = generateBadgeScript(targetUrl, url.origin);
      return new Response(badgeScript, {
        headers: { 'Content-Type': 'application/javascript', ...corsHeaders }
      });
    }

    // Status check API (for AJAX polling)
    if (pathname === '/status') {
      const targetUrl = searchParams.get('url');
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'url parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const status = await checkStatus(targetUrl, env);
      return new Response(JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 404
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  // Scheduled event for proactive checks (optional)
  async scheduled(event, env, ctx) {
    // Can be used for proactive health checks
    // Not implemented for free tier minimalism
  },
};

/**
 * Generate the badge embed script
 */
function generateBadgeScript(targetUrl, workerOrigin) {
  return `
(function() {
  const targetUrl = ${JSON.stringify(targetUrl)};
  const apiUrl = ${JSON.stringify(workerOrigin)} + '/status?url=' + encodeURIComponent(targetUrl);

  // Create Shadow DOM container
  const host = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function createBadge() {
    const shadow = host.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-flex; align-items: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px;';

    const statusDot = document.createElement('span');
    statusDot.id = 'status-dot';
    statusDot.style.cssText = 'width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; background: #ccc;';

    const statusText = document.createElement('span');
    statusText.id = 'status-text';
    statusText.style.cssText = 'color: #666;';

    const responseTime = document.createElement('span');
    responseTime.id = 'response-time';
    responseTime.style.cssText = 'margin-left: 8px; color: #999; font-size: 11px;';

    wrapper.appendChild(statusDot);
    wrapper.appendChild(statusText);
    wrapper.appendChild(responseTime);
    shadow.appendChild(wrapper);

    fetchStatus();
    setInterval(fetchStatus, 30000); // Check every 30s
  }

  async function fetchStatus() {
    try {
      const start = performance.now();
      const response = await fetch(apiUrl);
      const data = await response.json();
      const end = performance.now();

      const shadow = host.shadowRoot;
      if (!shadow) return;

      const dot = shadow.getElementById('status-dot');
      const text = shadow.getElementById('status-text');
      const time = shadow.getElementById('response-time');

      if (data.up) {
        dot.style.background = data.uptime >= 99 ? '#10b981' : data.uptime >= 95 ? '#f59e0b' : '#ef4444';
        text.textContent = data.uptime.toFixed(1) + '% uptime';
        text.style.color = '#10b981';
        time.textContent = (data.responseTime || Math.round(end - start)) + 'ms';
      } else {
        dot.style.background = '#ef4444';
        text.textContent = 'down';
        text.style.color = '#ef4444';
        time.textContent = '';
      }
    } catch (err) {
      const shadow = host.shadowRoot;
      if (!shadow) return;
      const dot = shadow.getElementById('status-dot');
      const text = shadow.getElementById('status-text');
      dot.style.background = '#ccc';
      text.textContent = 'checking...';
      text.style.color = '#999';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBadge);
  } else {
    createBadge();
  }
})();
  `.trim();
}

/**
 * Check status of target URL with KV caching
 */
async function checkStatus(targetUrl, env) {
  const cacheKey = 'status:' + targetUrl;
  const now = Date.now();

  // Try to get cached status
  if (env.STATUS_CACHE) {
    try {
      const cached = await env.STATUS_CACHE.get(cacheKey, 'json');
      if (cached && cached.timestamp) {
        const age = (now - cached.timestamp) / 1000;
        if (age < 30) {
          return cached; // Fresh cache
        }
        // Stale but usable, return it and refresh in background
        if (age < 60) {
          // Background refresh (fire and forget)
          fetchTarget(targetUrl, env, cacheKey);
          return cached;
        }
      }
    } catch (e) {
      // Cache miss or error, continue to fetch
    }
  }

  // No cache or expired, fetch synchronously
  return await fetchTarget(targetUrl, env, cacheKey);
}

/**
 * Actually fetch the target URL
 */
async function fetchTarget(targetUrl, env, cacheKey) {
  const start = Date.now();

  try {
    const response = await fetch(targetUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    const responseTime = Date.now() - start;
    const up = response.status >= 200 && response.status < 500;

    const result = {
      up,
      status: response.status,
      responseTime,
      uptime: up ? 100 : 0,
      timestamp: Date.now(),
      url: targetUrl,
    };

    // Cache the result
    if (env.STATUS_CACHE) {
      try {
        await env.STATUS_CACHE.put(cacheKey, JSON.stringify(result), {
          expirationTtl: 60, // 1 minute
        });
      } catch (e) {
        // Cache write failed, but that's ok
      }
    }

    return result;
  } catch (error) {
    const responseTime = Date.now() - start;
    const result = {
      up: false,
      error: error.message,
      responseTime,
      uptime: 0,
      timestamp: Date.now(),
      url: targetUrl,
    };

    // Cache failures too (with shorter TTL)
    if (env.STATUS_CACHE) {
      try {
        await env.STATUS_CACHE.put(cacheKey, JSON.stringify(result), {
          expirationTtl: 30,
        });
      } catch (e) {
        // Cache write failed
      }
    }

    return result;
  }
}
