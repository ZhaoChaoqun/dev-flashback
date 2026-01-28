#!/bin/bash

# Deploy render server to Azure Container Apps
# Usage: ./scripts/deploy-render-server.sh
#
# Prerequisites:
# 1. Azure CLI installed and logged in (az login)
# 2. Docker installed and running
#
# Environment variables (optional):
#   AZURE_RESOURCE_GROUP - Resource group name (default: dev-flashback-rg)
#   AZURE_LOCATION - Azure region (default: eastasia)
#   AZURE_ACR_NAME - Container registry name (default: devflashbackacr)
#   AZURE_CONTAINER_APP_NAME - Container app name (default: dev-flashback-render)

set -e

# Configuration
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-dev-flashback-rg}"
LOCATION="${AZURE_LOCATION:-eastasia}"
ACR_NAME="${AZURE_ACR_NAME:-devflashbackacr}"
CONTAINER_APP_NAME="${AZURE_CONTAINER_APP_NAME:-dev-flashback-render}"
CONTAINER_ENV_NAME="dev-flashback-env"
IMAGE_NAME="dev-flashback-render"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Deploy Render Server to Azure${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if logged in to Azure
if ! az account show > /dev/null 2>&1; then
    echo -e "${RED}Error: Not logged in to Azure. Run 'az login' first.${NC}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Step 1: Build render server
echo -e "${GREEN}[1/6] Building render server...${NC}"
"$SCRIPT_DIR/build-render-server.sh"

# Step 2: Create resource group if not exists
echo -e "${GREEN}[2/6] Creating resource group...${NC}"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none 2>/dev/null || true

# Step 3: Create Azure Container Registry if not exists
echo -e "${GREEN}[3/6] Creating container registry...${NC}"
if ! az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    az acr create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$ACR_NAME" \
        --sku Basic \
        --admin-enabled true
fi

# Get ACR credentials
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "loginServer" -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "passwords[0].value" -o tsv)

# Step 4: Build and push Docker image
echo -e "${GREEN}[4/6] Building and pushing Docker image...${NC}"
cd "$PROJECT_ROOT/render-server"

# Login to ACR
az acr login --name "$ACR_NAME"

# Build and push
docker buildx build --platform linux/amd64 -t "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest" --push .

# Step 5: Create Container Apps environment if not exists
echo -e "${GREEN}[5/6] Creating Container Apps environment...${NC}"
if ! az containerapp env show --name "$CONTAINER_ENV_NAME" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    az containerapp env create \
        --name "$CONTAINER_ENV_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION"
fi

# Step 6: Deploy Container App
echo -e "${GREEN}[6/6] Deploying Container App...${NC}"

# Get the frontend URL for CORS
FRONTEND_URL="https://brave-wave-05556bb00.6.azurestaticapps.net"

if az containerapp show --name "$CONTAINER_APP_NAME" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1; then
    # Update existing app
    az containerapp update \
        --name "$CONTAINER_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest" \
        --set-env-vars "ALLOWED_ORIGIN=$FRONTEND_URL"
else
    # Create new app
    az containerapp create \
        --name "$CONTAINER_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --environment "$CONTAINER_ENV_NAME" \
        --image "$ACR_LOGIN_SERVER/$IMAGE_NAME:latest" \
        --registry-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_NAME" \
        --registry-password "$ACR_PASSWORD" \
        --target-port 8080 \
        --ingress external \
        --cpu 2 \
        --memory 4Gi \
        --min-replicas 0 \
        --max-replicas 3 \
        --env-vars "ALLOWED_ORIGIN=$FRONTEND_URL"
fi

# Get the app URL
RENDER_URL=$(az containerapp show --name "$CONTAINER_APP_NAME" --resource-group "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Render Server URL: ${YELLOW}https://$RENDER_URL${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Update your frontend deployment with the render server URL:"
echo -e "   ${YELLOW}VITE_RENDER_API_URL=https://$RENDER_URL${NC}"
echo ""
echo -e "2. Rebuild and redeploy the frontend:"
echo -e "   ${YELLOW}VITE_RENDER_API_URL=https://$RENDER_URL npm run build${NC}"
echo -e "   ${YELLOW}./scripts/deploy.sh${NC}"
