/**
 * Status Badge 2.0 — SVG Badge Renderer
 *
 * Generates inline SVG badges for status display.
 */

/**
 * Theme definitions
 */
const THEMES = {
  default: {
    bg: '#ffffff',
    text: '#374151',
    border: '#e5e7eb',
    online: '#22c55e',
    offline: '#ef4444',
    unknown: '#6b7280',
  },
  dark: {
    bg: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    online: '#22c55e',
    offline: '#ef4444',
    unknown: '#6b7280',
  },
  minimal: {
    bg: 'transparent',
    text: '#374151',
    border: 'transparent',
    online: '#22c55e',
    offline: '#ef4444',
    unknown: '#9ca3af',
  },
};

/**
 * Render SVG badge from status data
 *
 * @param {Object} data - Status data object
 * @param {string} theme - Theme name (default: 'default')
 * @returns {string} SVG markup
 */
export function renderSVG(data, theme = 'default') {
  const colors = THEMES[theme] || THEMES.default;

  const isOnline = data.status?.online ?? true;
  const responseTime = data.status?.responseTime ?? 0;
  const uptime = data.uptime?.percentage ?? null;
  const name = data.config?.name || 'Status';

  const statusColor = isOnline ? colors.online : colors.offline;
  const statusText = isOnline ? 'Online' : 'Offline';

  // Calculate width based on content
  const baseWidth = 200;
  const extraWidth = uptime ? 30 : 0;

  return `<svg width="${baseWidth + extraWidth}" height="40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name}: ${statusText}">
  <!-- Background -->
  <rect width="${baseWidth + extraWidth}" height="40" fill="${colors.bg}" rx="6"/>

  <!-- Status dot with pulse animation when online -->
  <circle cx="20" cy="20" r="6" fill="${statusColor}">
    ${isOnline ? '<animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>' : ''}
  </circle>

  <!-- Status text -->
  <text x="35" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="${colors.text}">
    ${statusText}
  </text>

  <!-- Response time -->
  ${responseTime > 0 ? `
  <text x="95" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="${colors.text}" opacity="0.8">
    ${responseTime}ms
  </text>
  ` : ''}

  <!-- Uptime percentage -->
  ${uptime !== null ? `
  <text x="${baseWidth + extraWidth - 35}" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="${statusColor}">
    ${uptime}%
  </text>
  ` : ''}

  <!-- Border -->
  ${colors.border !== 'transparent' ? `
  <rect width="${baseWidth + extraWidth - 1}" height="39" x="0.5" y="0.5" fill="none" stroke="${colors.border}" rx="6"/>
  ` : ''}
</svg>`;
}

/**
 * Render minimal dot badge (small circle only)
 *
 * @param {boolean} isOnline - Online status
 * @param {string} theme - Theme name
 * @returns {string} SVG markup
 */
export function renderDotBadge(isOnline, theme = 'default') {
  const colors = THEMES[theme] || THEMES.default;
  const color = isOnline ? colors.online : colors.offline;

  return `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${isOnline ? 'Online' : 'Offline'}">
  <circle cx="8" cy="8" r="6" fill="${color}">
    ${isOnline ? '<animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>' : ''}
  </circle>
</svg>`;
}
