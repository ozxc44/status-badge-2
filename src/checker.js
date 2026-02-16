/**
 * Status Badge 2.0 — Target Status Checker
 *
 * Performs HTTP health checks on target URLs with timeout protection.
 */

/**
 * Check if a URL is reachable and measure response time
 *
 * @param {string} targetUrl - The URL to check
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Object>} Status result
 */
export async function checkTarget(targetUrl, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const startTime = Date.now();

  try {
    const response = await fetch(normalizeUrl(targetUrl), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'StatusBadge/2.0',
        'Accept': '*/*',
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    // Consider 2xx and 3xx as online
    // 4xx and 5xx as "online but returning errors" (still count as online for connectivity)
    const isOnline = response.status >= 200 && response.status < 600;

    return {
      isOnline,
      statusCode: response.status,
      responseTime,
      timestamp: Date.now(),
      statusText: response.statusText,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    return {
      isOnline: false,
      statusCode: 0,
      responseTime,
      timestamp: Date.now(),
      error: error.name === 'AbortError' ? 'Timeout' : error.message,
    };
  }
}

/**
 * Normalize URL to ensure it has a protocol
 *
 * @param {string} url - The URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(url) {
  // If no protocol, default to https
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }

  return url;
}
