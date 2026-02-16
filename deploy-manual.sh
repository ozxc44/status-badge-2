#!/bin/bash
# Status Badge 2.0 — Deployment Script (with API Token Support)
#
# Usage:
#   export CLOUDFLARE_API_TOKEN='your_token_here'
#   export CLOUDFLARE_ACCOUNT_ID='your_account_id'  # Optional
#   ./deploy-manual.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==================================="
echo "Status Badge 2.0 — Deployment"
echo "==================================="
echo ""

# Ensure Node v20
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
    nvm use 20 2>/dev/null || nvm install 20
else
    echo "Error: nvm not found. Please install Node.js v20+"
    exit 1
fi

echo "Node version: $(node --version)"
echo ""

# Check for API token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Error: CLOUDFLARE_API_TOKEN environment variable not set."
    echo ""
    echo "Get your API token from:"
    echo "  https://dash.cloudflare.com/profile/api-tokens"
    echo ""
    echo "Required permissions:"
    echo "  - Account > Cloudflare Workers > Edit"
    echo "  - Account > Workers KV Storage > Edit"
    echo ""
    echo "Then run:"
    echo "  export CLOUDFLARE_API_TOKEN='your_token_here'"
    exit 1
fi

# Configure wrangler with API token
WRANGLER_DIR="$HOME/.config/.wrangler"
mkdir -p "$WRANGLER_DIR"

cat > "$WRANGLER_DIR/auth.json" << AUTH_EOF
{
  "api_token": "${CLOUDFLARE_API_TOKEN}"
}
AUTH_EOF

echo "Wrangler configured with API token"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install --no-save
echo ""

# Create KV namespace
echo "Checking KV namespace..."
KV_OUTPUT=$(npx wrangler kv namespace create STATUS 2>&1 || true)
echo "$KV_OUTPUT"
echo ""

# Extract KV ID
KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+' || echo "")

if [ -n "$KV_ID" ]; then
    echo "Created KV namespace: $KV_ID"
    sed -i "s/id = \"preview_status_badge_2\"/id = \"$KV_ID\"/g" wrangler.toml
    sed -i "s|preview_id = \".*\"|preview_id = \"$KV_ID\"|g" wrangler.toml
    echo "Updated wrangler.toml"
else
    echo "Note: KV namespace might already exist"
fi
echo ""

# Deploy
echo "Deploying to Cloudflare Workers..."
npx wrangler deploy

echo ""
echo "==================================="
echo "Deployment complete!"
echo "==================================="
