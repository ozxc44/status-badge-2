/**
 * Status Badge 2.0 - Pure Client-Side Version
 * Free forever status monitoring badges
 *
 * Usage: <script src="badge.js?url=YOUR_URL"></script>
 *
 * This is a standalone, zero-dependency status badge that runs entirely in the browser.
 * No server-side components required.
 */

(function() {
  // Get target URL from script src query parameter
  const script = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const scriptSrc = script.src;
  const urlMatch = scriptSrc.match(/[?&]url=([^&]+)/);
  const targetUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : null;

  if (!targetUrl) {
    console.error('Status Badge: url parameter required. Usage: <script src="badge.js?url=YOUR_URL"></script>');
    return;
  }

  // Optional configuration via data attributes
  const config = {
    interval: parseInt(script.getAttribute('data-interval')) || 30000, // Check every 30s
    timeout: parseInt(script.getAttribute('data-timeout')) || 10000, // 10s timeout
    method: script.getAttribute('data-method') || 'HEAD', // HEAD or GET
    showResponseTime: script.getAttribute('data-show-response-time') !== 'false',
    cacheKey: 'status-badge:' + targetUrl,
    cacheTtl: parseInt(script.getAttribute('data-cache')) || 60, // Cache for 60s
  };

  // Simple in-memory cache (shared across all badge instances)
  if (!window.__statusBadgeCache) {
    window.__statusBadgeCache = {};
  }

  /**
   * Check status of target URL
   */
  async function checkStatus() {
    const now = Date.now();
    const cached = window.__statusBadgeCache[config.cacheKey];

    // Return cached result if still fresh
    if (cached && (now - cached.timestamp) < (config.cacheTtl * 1000)) {
      return cached;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const start = performance.now();
      const response = await fetch(targetUrl, {
        method: config.method,
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      const end = performance.now();

      const result = {
        up: response.status >= 200 && response.status < 500,
        status: response.status,
        responseTime: Math.round(end - start),
        timestamp: now,
      };

      // Update cache
      window.__statusBadgeCache[config.cacheKey] = result;

      return result;
    } catch (error) {
      const result = {
        up: false,
        error: error.name === 'AbortError' ? 'timeout' : error.message,
        responseTime: config.timeout,
        timestamp: now,
      };

      // Cache failures too (with shorter TTL)
      window.__statusBadgeCache[config.cacheKey] = result;

      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Create and render the badge
   */
  function createBadge() {
    // Create Shadow DOM container
    const shadow = script.attachShadow({ mode: 'open' });

    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-flex;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
      }
      .wrapper {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 4px;
        background: #f5f5f5;
        border: 1px solid #e0e0e0;
        transition: all 0.2s ease;
      }
      .wrapper:hover {
        background: #eeeeee;
      }
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        flex-shrink: 0;
        transition: background-color 0.3s ease;
      }
      .status-dot.up { background: #10b981; }
      .status-dot.degraded { background: #f59e0b; }
      .status-dot.down { background: #ef4444; }
      .status-dot.checking { background: #9ca3af; }
      .status-text {
        color: #666;
        font-weight: 500;
      }
      .status-text.up { color: #10b981; }
      .status-text.degraded { color: #f59e0b; }
      .status-text.down { color: #ef4444; }
      .response-time {
        margin-left: 8px;
        color: #999;
        font-size: 11px;
        font-variant-numeric: tabular-nums;
      }
      .loading {
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;

    // Create badge elements
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';

    const statusDot = document.createElement('span');
    statusDot.className = 'status-dot checking';

    const statusText = document.createElement('span');
    statusText.className = 'status-text';
    statusText.textContent = 'checking...';

    const responseTime = document.createElement('span');
    responseTime.className = 'response-time';
    responseTime.style.display = config.showResponseTime ? 'inline' : 'none';

    wrapper.appendChild(statusDot);
    wrapper.appendChild(statusText);
    wrapper.appendChild(responseTime);

    shadow.appendChild(style);
    shadow.appendChild(wrapper);

    // Initial check
    updateBadge();

    // Set up periodic checks
    setInterval(updateBadge, config.interval);

    async function updateBadge() {
      statusDot.className = 'status-dot checking loading';
      statusText.textContent = 'checking...';
      statusText.className = 'status-text';
      responseTime.textContent = '';

      const data = await checkStatus();

      if (data.up) {
        statusDot.className = 'status-dot up';
        statusText.textContent = 'operational';
        statusText.className = 'status-text up';
        if (config.showResponseTime) {
          responseTime.style.display = 'inline';
          responseTime.textContent = data.responseTime + 'ms';
        }
      } else {
        statusDot.className = 'status-dot down';
        statusText.textContent = data.error === 'timeout' ? 'timeout' : 'down';
        statusText.className = 'status-text down';
        responseTime.style.display = 'none';
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBadge);
  } else {
    createBadge();
  }
})();
