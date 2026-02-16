/**
 * Status Badge 2.0 — Badge JavaScript Generator
 *
 * Generates the embeddable JS widget code that users include on their sites.
 * Uses Shadow DOM for style isolation.
 */

/**
 * Generate the JavaScript widget code for embedding
 *
 * @param {string} id - Badge ID
 * @param {string} baseUrl - Base URL of the service
 * @param {Object} config - Badge configuration
 * @returns {string} JavaScript code
 */
export function generateBadgeJS(id, baseUrl, config) {
  const theme = config.theme || 'default';

  // Return the IIFE that users will embed
  return `(function(){
'use strict';

// Status Badge 2.0 — Embedded Widget
// ID: ${id}
// Theme: ${theme}

const config = {
  id: '${id}',
  api: '${baseUrl}/v1',
  theme: '${theme}',
  refreshInterval: 60000 // 1 minute
};

// Create Shadow DOM container for style isolation
function createBadgeContainer() {
  var container = document.createElement('div');
  container.id = 'status-badge-container-${id}';

  var shadow = container.attachShadow({ mode: 'open' });

  // Inject styles and initial markup
  shadow.innerHTML = '\\
    <style>\
      .badge {\
        display: inline-flex;\
        align-items: center;\
        gap: 8px;\
        padding: 8px 12px;\
        background: ' + (config.theme === 'dark' ? '#1f2937' : '#ffffff') + ';\
        border-radius: 6px;\
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
        font-size: 13px;\
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);\
        transition: all 0.2s ease;\
      }\
      .badge:hover {\
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);\
      }\
      .badge a {\
        text-decoration: none;\
        color: inherit;\
        display: flex;\
        align-items: center;\
        gap: 8px;\
      }\
      .status-dot {\
        width: 10px;\
        height: 10px;\
        border-radius: 50%;\
        background: #22c55e;\
      }\
      .status-dot.online {\
        background: #22c55e;\
        animation: pulse 2s infinite;\
      }\
      .status-dot.offline {\
        background: #ef4444;\
      }\
      .status-dot.unknown {\
        background: #6b7280;\
      }\
      @keyframes pulse {\
        0%, 100% { opacity: 1; }\
        50% { opacity: 0.6; }\
      }\
      .status-text {\
        font-weight: 500;\
      }\
      .response-time {\
        font-size: 12px;\
        opacity: 0.8;\
      }\
      .uptime {\
        font-size: 12px;\
        font-weight: 600;\
        padding: 2px 6px;\
        background: rgba(34, 197, 94, 0.1);\
        border-radius: 4px;\
        color: #22c55e;\
      }\
      .attribution {\
        font-size: 10px;\
        opacity: 0.6;\
        margin-left: 8px;\
        white-space: nowrap;\
      }\
      .loading {\
        opacity: 0.6;\
      }\
    </style>\
    <div class="badge" id="status-badge-${config.id}">\
      <span class="status-text loading">Loading...</span>\
    </div>\
  ';

  return { container, shadow };
}

// Render badge with data
function renderBadge(shadow, data) {
  var badgeEl = shadow.getElementById('status-badge-${config.id}');

  if (!badgeEl) return;

  var isOnline = data.status && data.status.online;
  var isUnknown = data.status === undefined;

  var statusClass = isUnknown ? 'unknown' : (isOnline ? 'online' : 'offline');
  var statusText = isUnknown ? 'Unknown' : (isOnline ? 'Online' : 'Offline');
  var responseTime = data.status && data.status.responseTime ? data.status.responseTime + 'ms' : '';
  var uptime = data.uptime && data.uptime.percentage !== null ? data.uptime.percentage + '%' : '';
  var name = data.config && data.config.name ? data.config.name : 'Service';

  badgeEl.innerHTML = '\\
    <a href="' + config.api + '/' + config.id + '.svg" target="_blank" rel="noopener">\
      <span class="status-dot ' + statusClass + '"></span>\
      <span class="status-text">' + statusText + '</span>\
      ' + (responseTime ? '<span class="response-time">' + responseTime + '</span>' : '') + '\\
      ' + (uptime ? '<span class="uptime">' + uptime + '</span>' : '') + '\\
      <span class="attribution">Monitoring by Status Badge</span>\
    </a>\
  ';
}

// Fetch status from API
async function fetchStatus() {
  try {
    var response = await fetch(config.api + '/' + config.id + '.json');
    if (!response.ok) {
      throw new Error('Status: ' + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error('Status Badge error:', error);
    return {
      status: { online: false, error: true },
      uptime: { percentage: null }
    };
  }
}

// Initialize badge
function init() {
  var script = document.currentScript;
  if (!script) return;

  var _createBadgeContainer = createBadgeContainer();
  var container = _createBadgeContainer.container;
  var shadow = _createBadgeContainer.shadow;

  // Insert badge before the script tag
  script.parentNode.insertBefore(container, script);

  // Initial fetch
  fetchStatus().then(function(data) {
    renderBadge(shadow, data);
  });

  // Set up refresh interval
  setInterval(function() {
    fetchStatus().then(function(data) {
      renderBadge(shadow, data);
    });
  }, config.refreshInterval);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();`;
}

/**
 * Generate minimal JS widget (dot only)
 *
 * @param {string} id - Badge ID
 * @param {string} baseUrl - Base URL
 * @param {Object} config - Configuration
 * @returns {string} JavaScript code
 */
export function generateMinimalBadgeJS(id, baseUrl, config) {
  return `(function(){
var id='${id}', api='${baseUrl}/v1';
var el=document.createElement('div');
el.innerHTML='<span id="sb-'+id+'" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#9ca3af"></span>';
document.currentScript.parentNode.appendChild(el);
function u(){fetch(api+'/'+id+'.json').then(r=>r.json()).then(d=>{
  var s=document.getElementById('sb-'+id);
  if(s)s.style.background=d.status.online?'#22c55e':'#ef4444';
}).catch(()=>{})}
u();setInterval(u,60000);
})();`;
}
