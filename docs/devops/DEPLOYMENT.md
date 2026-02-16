# Status Badge 2.0 — Deployment Instructions

## Current Status

**BLOCKER:** Cloudflare authentication required. WSL environment cannot complete OAuth flow (localhost port mapping issue).

## Infrastructure Status

- Node.js: v20.20.0 (available via nvm)
- Wrangler: v4.65.0 (installed)
- Project: Ready to deploy
- KV namespace: Not created yet

## Deployment Options

### Option A: API Token (Recommended)

1. Get API Token from Cloudflare:
   - Visit: https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Edit" permission for:
     - Cloudflare Workers
     - Workers KV Storage

2. Run deployment script:
   ```bash
   export CLOUDFLARE_API_TOKEN='your_token_here'
   cd /home/zzy/auto-company/projects/status-badge-2.0
   ./deploy-manual.sh
   ```

### Option B: GitHub Actions (Best for CI/CD)

1. Push code to GitHub
2. Add secrets in GitHub repo settings:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Push to main branch — auto-deploys

### Option C: Cloudflare Dashboard (Manual)

1. Visit https://dash.cloudflare.com
2. Go to Workers & Pages
3. Create Worker -> Deploy from Source
4. Upload files or paste code

## Required Actions

1. **Get Cloudflare API Token**
2. **Run deployment script**
3. **Verify deployment at Worker URL**

## Files Created

- `.github/workflows/deploy.yml` — GitHub Actions workflow
- `deploy-manual.sh` — Manual deployment script with API token support
- `docs/devops/deployment-guide.md` — Full deployment guide
