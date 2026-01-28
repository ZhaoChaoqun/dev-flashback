# Deployment Guide

This document describes how to deploy Dev Flashback to Azure.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Azure Resource Creation](#azure-resource-creation)
- [Deploy Frontend (Static Web Apps)](#deploy-frontend-static-web-apps)
  - [Option 1: Using Deployment Script (Recommended)](#option-1-using-deployment-script-recommended)
  - [Option 2: Manual Deployment](#option-2-manual-deployment)
  - [Option 3: GitHub Actions Auto Deployment](#option-3-github-actions-auto-deployment)
- [Deploy Render Server (Container Apps)](#deploy-render-server-container-apps)
- [Configure GitHub OAuth (Optional)](#configure-github-oauth-optional)
- [FAQ](#faq)

## Prerequisites

1. **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/)
2. **Azure CLI** - [Installation guide](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Node.js 18+** - [Download](https://nodejs.org/)
4. **Docker** - [Download](https://www.docker.com/products/docker-desktop/) (required for render server)
5. **SWA CLI** - Azure Static Web Apps CLI

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure
az login
```

## Azure Resource Creation

### 1. Create Resource Group

```bash
az group create --name dev-flashback-rg --location eastasia
```

### 2. Register Web Provider (First time only)

```bash
az provider register --namespace Microsoft.Web

# Wait for registration to complete (may take a few minutes)
az provider show --namespace Microsoft.Web --query "registrationState"
```

### 3. Create Static Web App

```bash
az staticwebapp create \
  --name dev-flashback \
  --resource-group dev-flashback-rg \
  --location eastasia \
  --sku Free
```

### 4. Get Deployment Token

```bash
az staticwebapp secrets list \
  --name dev-flashback \
  --resource-group dev-flashback-rg \
  --query "properties.apiKey" -o tsv
```

Save this token for later deployment.

## Deploy Frontend (Static Web Apps)

### Option 1: Using Deployment Script (Recommended)

The project provides a one-click deployment script `scripts/deploy.sh`.

```bash
# Set deployment token (only once)
export AZURE_SWA_TOKEN="your-deployment-token"

# Deploy to production
./scripts/deploy.sh

# Deploy to preview environment
./scripts/deploy.sh preview
```

**Tip:** Add `export AZURE_SWA_TOKEN="..."` to `~/.zshrc` or `~/.bashrc` to avoid entering it each time.

### Option 2: Manual Deployment

```bash
# 1. Build the project
npm run build

# 2. Deploy to Azure
swa deploy ./dist \
  --api-location ./api \
  --api-language node \
  --api-version 18 \
  --env production \
  --deployment-token "your-deployment-token"
```

### Option 3: GitHub Actions Auto Deployment

1. Add a Secret in GitHub repository settings:
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: Your deployment token

2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/dist"
          api_location: "/api"
          skip_app_build: true
```

## Deploy Render Server (Container Apps)

The render server generates videos in the cloud, allowing users to export MP4 videos directly from the web interface.

### Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐
│  Static Web App │────▶│  Container Apps      │
│  (Frontend)     │     │  (Render Server)     │
└─────────────────┘     └──────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  FFmpeg +    │
                        │  Chromium    │
                        └──────────────┘
```

### Using Deployment Script (Recommended)

```bash
# Ensure you're logged in to Azure
az login

# Run deployment script
./scripts/deploy-render-server.sh
```

The script automatically:
1. Builds the render server code
2. Creates Azure Container Registry
3. Builds and pushes Docker image
4. Creates Container Apps environment
5. Deploys Container App

### Manual Deployment

If you prefer manual deployment, follow these steps:

#### 1. Build Render Server

```bash
./scripts/build-render-server.sh
```

#### 2. Create Container Registry

```bash
az acr create \
  --resource-group dev-flashback-rg \
  --name devflashbackacr \
  --sku Basic \
  --admin-enabled true
```

#### 3. Build and Push Docker Image

```bash
cd render-server

# Login to ACR
az acr login --name devflashbackacr

# Build image
docker build -t devflashbackacr.azurecr.io/dev-flashback-render:latest .

# Push image
docker push devflashbackacr.azurecr.io/dev-flashback-render:latest
```

#### 4. Create Container Apps Environment

```bash
az containerapp env create \
  --name dev-flashback-env \
  --resource-group dev-flashback-rg \
  --location eastasia
```

#### 5. Deploy Container App

```bash
# Get ACR password
ACR_PASSWORD=$(az acr credential show --name devflashbackacr --query "passwords[0].value" -o tsv)

az containerapp create \
  --name dev-flashback-render \
  --resource-group dev-flashback-rg \
  --environment dev-flashback-env \
  --image devflashbackacr.azurecr.io/dev-flashback-render:latest \
  --registry-server devflashbackacr.azurecr.io \
  --registry-username devflashbackacr \
  --registry-password "$ACR_PASSWORD" \
  --target-port 8080 \
  --ingress external \
  --cpu 2 \
  --memory 4Gi \
  --min-replicas 0 \
  --max-replicas 3 \
  --env-vars "ALLOWED_ORIGIN=https://brave-wave-05556bb00.6.azurestaticapps.net"
```

### Configure Frontend to Connect to Render Server

After deploying the render server, update the frontend configuration:

```bash
# Get render server URL
RENDER_URL=$(az containerapp show \
  --name dev-flashback-render \
  --resource-group dev-flashback-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo "Render Server URL: https://$RENDER_URL"

# Rebuild frontend with render server URL
VITE_RENDER_API_URL="https://$RENDER_URL" npm run build

# Deploy frontend
./scripts/deploy.sh
```

### Render Server API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/render` | POST | Start render job |
| `/api/render/:jobId` | GET | Query render status |
| `/api/render/:jobId/download` | GET | Download video |

### Pricing

Azure Container Apps charges based on usage:
- **CPU**: ~$0.05/vCPU-second
- **Memory**: ~$0.005/GiB-second
- **Min replicas set to 0**: No charges when idle

Rendering a 35-second video takes about 2-3 minutes, costing approximately $0.07-0.15.

## Configure GitHub OAuth (Optional)

If you want to use GitHub OAuth login:

### 1. Create GitHub OAuth App

1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the information:
   - **Application name:** Dev Flashback
   - **Homepage URL:** `https://your-app.azurestaticapps.net`
   - **Authorization callback URL:** `https://your-app.azurestaticapps.net/callback`

### 2. Configure Azure Environment Variables

```bash
az staticwebapp appsettings set \
  --name dev-flashback \
  --resource-group dev-flashback-rg \
  --setting-names \
  GITHUB_CLIENT_ID="your-client-id" \
  GITHUB_CLIENT_SECRET="your-client-secret" \
  REDIRECT_URI="https://your-app.azurestaticapps.net"
```

## FAQ

### Q: Azure default welcome page shows after deployment

**Cause:** May have deployed to preview environment instead of production.

**Solution:** Ensure you use the `--env production` parameter when deploying.

### Q: MissingSubscriptionRegistration error

**Cause:** Azure subscription hasn't registered the Microsoft.Web provider.

**Solution:**
```bash
az provider register --namespace Microsoft.Web
# Wait a few minutes and retry
```

### Q: API returns 404

**Cause:** Azure Functions API wasn't deployed correctly.

**Solution:** Ensure the deployment command includes `--api-location ./api` parameter.

### Q: OAuth login fails

**Check:**
1. Is the GitHub OAuth App callback URL correct?
2. Are Azure environment variables configured correctly?
3. Ensure HTTPS is used

## Related Links

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [SWA CLI Documentation](https://azure.github.io/static-web-apps-cli/)
- [GitHub OAuth Documentation](https://docs.github.com/apps/oauth-apps)
