#!/bin/bash
# Status Badge 2.0 — Direct API Deployment
# Uses Cloudflare REST API instead of wrangler CLI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "==================================="
echo "Status Badge 2.0 — API Deployment"
echo "==================================="
echo ""

# Check for API token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}Error: CLOUDFLARE_API_TOKEN environment variable not set.${NC}"
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

# Check for account ID
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${YELLOW}Warning: CLOUDFLARE_ACCOUNT_ID not set. Will try to detect.${NC}"

    # Try to get account ID from API
    ACCOUNTS=$(curl -s -X GET \
      "https://api.cloudflare.com/client/v4/accounts" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json")

    ACCOUNT_ID=$(echo "$ACCOUNTS" | jq -r '.result[0].id // empty')

    if [ -n "$ACCOUNT_ID" ] && [ "$ACCOUNT_ID" != "null" ]; then
        echo -e "${GREEN}Detected Account ID: $ACCOUNT_ID${NC}"
        export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
    else
        echo -e "${RED}Error: Could not detect Account ID. Please set CLOUDFLARE_ACCOUNT_ID${NC}"
        exit 1
    fi
fi

echo "Account ID: $CLOUDFLARE_ACCOUNT_ID"
echo ""

# Step 1: Create KV namespace
echo "Creating KV namespace..."
KV_RESPONSE=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"STATUS"}')

KV_ID=$(echo "$KV_RESPONSE" | jq -r '.result.id // empty')

if [ -z "$KV_ID" ] || [ "$KV_ID" = "null" ]; then
    echo -e "${YELLOW}Note: KV namespace might already exist. Checking...${NC}"

    # List existing namespaces
    KV_LIST=$(curl -s -X GET \
      "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

    KV_ID=$(echo "$KV_LIST" | jq -r '.result[] | select(.title=="STATUS") | .id // empty')

    if [ -z "$KV_ID" ] || [ "$KV_ID" = "null" ]; then
        echo -e "${RED}Error: Could not create or find KV namespace${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}KV namespace ID: $KV_ID${NC}"

# Update wrangler.toml with KV ID
sed -i "s/id = \"preview_status_badge_2\"/id = \"$KV_ID\"/g" wrangler.toml
sed -i "s|preview_id = \".*\"|preview_id = \"$KV_ID\"|g" wrangler.toml
echo "Updated wrangler.toml"
echo ""

# Step 2: Bundle the worker script
echo "Bundling worker script..."
WORKER_SCRIPT=$(cat src/index.js src/checker.js src/svg.js src/badge.js)

# Step 3: Deploy worker
echo "Deploying worker..."
DEPLOY_RESPONSE=$(curl -s -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/status-badge-2" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/javascript" \
  --data-binary "$WORKER_SCRIPT")

SUCCESS=$(echo "$DEPLOY_RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}Worker deployed successfully!${NC}"
else
    echo -e "${RED}Deployment failed:${NC}"
    echo "$DEPLOY_RESPONSE"
    exit 1
fi

# Step 4: Bind KV namespace
echo "Binding KV namespace..."
BIND_RESPONSE=$(curl -s -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/scripts/status-badge-2/bindings" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bindings\": [
      {
        \"type\": \"kv_namespace\",
        \"name\": \"STATUS\",
        \"namespace_id\": \"$KV_ID\"
      }
    ]
  }")

echo ""
echo "==================================="
echo -e "${GREEN}Deployment complete!${NC}"
echo "==================================="
echo ""
echo "Worker URL:"
echo "  https://status-badge-2.workers.dev"
echo ""
echo "Test endpoints:"
echo "  curl https://status-badge-2.workers.dev/health"
echo "  curl https://status-badge-2.workers.dev/"
echo ""
