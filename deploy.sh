#!/bin/bash
# Status Badge 2.0 — Deployment Script
# Deploys to Cloudflare Workers

set -e

echo "🚀 Status Badge 2.0 — Deployment"
echo "=================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

# Check if logged in
echo "📋 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in. Run: wrangler login"
    exit 1
fi

# Create KV namespace if it doesn't exist
echo "📦 Ensuring KV namespace exists..."
KV_ID=$(wrangler kv:namespace list 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")

if [ -z "$KV_ID" ]; then
    echo "Creating new KV namespace..."
    KV_OUTPUT=$(wrangler kv:namespace create STATUS)
    KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+' || echo "")
    echo "✅ Created KV namespace: $KV_ID"
else
    echo "✅ KV namespace exists: $KV_ID"
fi

# Update wrangler.toml with the KV ID
if [ -n "$KV_ID" ]; then
    echo "📝 Updating wrangler.toml..."
    # This is a simple sed replacement — you may need to adjust based on your OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/id = \".*\"/id = \"$KV_ID\"/" wrangler.toml
    else
        # Linux
        sed -i "s/id = \".*\"/id = \"$KV_ID\"/" wrangler.toml
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-save

# Deploy
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Visit your worker URL to see the homepage"
echo "  2. Create a monitor with the API"
echo "  3. Embed the badge on your site"
