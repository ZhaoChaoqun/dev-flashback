#!/bin/bash

# Dev Flashback - Azure Static Web Apps Deployment Script
# Usage: ./scripts/deploy.sh [production|preview]
#
# Required environment variable:
#   AZURE_SWA_TOKEN - Azure Static Web Apps deployment token
#
# You can set it in your shell:
#   export AZURE_SWA_TOKEN="your-token-here"
#
# Or pass it inline:
#   AZURE_SWA_TOKEN="your-token" ./scripts/deploy.sh

set -e

# Configuration
ENV="${1:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Dev Flashback - Azure Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check for deployment token
if [ -z "$AZURE_SWA_TOKEN" ]; then
    echo -e "${RED}Error: AZURE_SWA_TOKEN environment variable is not set${NC}"
    echo ""
    echo "Please set your Azure Static Web Apps deployment token:"
    echo "  export AZURE_SWA_TOKEN=\"your-deployment-token\""
    echo ""
    echo "Or pass it inline:"
    echo "  AZURE_SWA_TOKEN=\"your-token\" ./scripts/deploy.sh"
    echo ""
    echo "You can find your token in Azure Portal:"
    echo "  Static Web Apps > your-app > Manage deployment token"
    exit 1
fi

# Step 1: Build
echo -e "${GREEN}[1/2] Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}"
echo ""

# Step 2: Deploy
echo -e "${GREEN}[2/2] Deploying to Azure (${ENV})...${NC}"
swa deploy ./dist \
    --api-location ./api \
    --api-language node \
    --api-version 18 \
    --env "$ENV" \
    --deployment-token "$AZURE_SWA_TOKEN"

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if [ "$ENV" = "production" ]; then
    echo -e "URL: ${YELLOW}https://brave-wave-05556bb00.6.azurestaticapps.net${NC}"
else
    echo -e "URL: ${YELLOW}https://brave-wave-05556bb00-preview.eastasia.6.azurestaticapps.net${NC}"
fi
