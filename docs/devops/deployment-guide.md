# Status Badge 2.0 — Deployment Guide

## Current State

- Node.js v20.20.0 is available (via nvm)
- Wrangler v4.65.0 is installed
- Project is ready to deploy
- **BLOCKER:** Cloudflare authentication required

## Deployment Options

### Option 1: Wrangler CLI (Recommended)

1. Get Cloudflare API Token:
   - Visit: https://dash.cloudflare.com/profile/api-tokens
   - Create token with permissions:
     - Account > Cloudflare Workers > Edit
     - Account > Workers KV Storage > Edit

2. Set environment variable:
   ```bash
   export CLOUDFLARE_API_TOKEN='your_token_here'
   export CLOUDFLARE_ACCOUNT_ID='your_account_id'
   ```

3. Create KV namespace:
   ```bash
   cd /home/zzy/auto-company/projects/status-badge-2.0
   source ~/.nvm/nvm.sh
   nvm use 20
   npx wrangler kv namespace create STATUS
   ```

4. Update wrangler.toml with the returned KV ID

5. Deploy:
   ```bash
   npx wrangler deploy
   ```

### Option 2: GitHub Actions (Best for CI/CD)

1. Create GitHub repo (push code)

2. Add GitHub Secrets:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN --body 'your_token'
   gh secret set CLOUDFLARE_ACCOUNT_ID --body 'your_account_id'
   ```

3. Push to main branch — deployment happens automatically

### Option 3: Cloudflare Dashboard (Manual)

1. Visit: https://dash.cloudflare.com -> Workers & Pages
2. Create Application -> Worker
3. Paste the code from `/home/zzy/auto-company/projects/status-badge-2.0/src/index.js`
4. Create KV namespace in Workers & Pages -> KV
5. Bind KV namespace to Worker
6. Deploy

## Required Resources

- KV namespace: `STATUS`
- Worker name: `status-badge-2`

## Post-Deployment

Worker will be available at:
```
https://status-badge-2.<subdomain>.workers.dev
```

Test endpoints:
- `/health` — Health check
- `/` — Homepage with API docs
- `/api/monitors` (POST) — Create monitor
