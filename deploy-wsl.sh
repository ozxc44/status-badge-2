#!/bin/bash
# Status Badge 2.0 — Deployment Helper for WSL
#
# This script helps deploy the project when Cloudflare credentials are available.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==================================="
echo "Status Badge 2.0 — Deployment"
echo "==================================="
echo ""

# Load Node v20
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
    nvm use 20
fi

echo "Node version: $(node --version)"
echo "Wrangler version: $(npx wrangler --version)"
echo ""

# Check for authentication
AUTH_FILE="$HOME/.config/.wrangler/auth.json"

if [ -f "$AUTH_FILE" ]; then
    echo "✅ Found wrangler authentication"
    echo ""
else
    echo "❌ Not authenticated with Cloudflare"
    echo ""
    echo "Choose an authentication method:"
    echo ""
    echo "1. API Token (Recommended for WSL):"
    echo "   export CLOUDFLARE_API_TOKEN='your_token_here'"
    echo "   ./deploy-api.sh"
    echo ""
    echo "2. GitHub Actions:"
    echo "   - Push code to GitHub"
    echo "   - Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID as secrets"
    echo "   - Push to trigger deployment"
    echo ""
    echo "3. Cloudflare Dashboard:"
    echo "   - Visit https://dash.cloudflare.com"
    echo "   - Go to Workers & Pages -> Create Worker"
    echo "   - Copy code from src/ directory"
    echo ""
    exit 1
fi

# Create KV namespace
echo "Creating KV namespace..."
npx wrangler kv namespace create STATUS || echo "KV namespace might already exist"
echo ""

# Deploy
echo "Deploying to Cloudflare Workers..."
npx wrangler deploy

echo ""
echo "==================================="
echo "Deployment complete!"
echo "==================================="
