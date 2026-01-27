# 部署指南

本文档介绍如何将 Dev Flashback 部署到 Azure。

## 目录

- [前置条件](#前置条件)
- [Azure 资源创建](#azure-资源创建)
- [部署前端（Static Web Apps）](#部署前端static-web-apps)
  - [方式一：使用部署脚本（推荐）](#方式一使用部署脚本推荐)
  - [方式二：手动部署](#方式二手动部署)
  - [方式三：GitHub Actions 自动部署](#方式三github-actions-自动部署)
- [部署渲染服务器（Container Apps）](#部署渲染服务器container-apps)
- [配置 GitHub OAuth（可选）](#配置-github-oauth可选)
- [常见问题](#常见问题)

## 前置条件

1. **Azure 账号** - [免费注册](https://azure.microsoft.com/free/)
2. **Azure CLI** - [安装指南](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Node.js 18+** - [下载](https://nodejs.org/)
4. **Docker** - [下载](https://www.docker.com/products/docker-desktop/)（渲染服务器需要）
5. **SWA CLI** - Azure Static Web Apps CLI

```bash
# 安装 SWA CLI
npm install -g @azure/static-web-apps-cli

# 登录 Azure
az login
```

## Azure 资源创建

### 1. 创建资源组

```bash
az group create --name dev-flashback-rg --location eastasia
```

### 2. 注册 Web 服务提供商（首次使用需要）

```bash
az provider register --namespace Microsoft.Web

# 等待注册完成（可能需要几分钟）
az provider show --namespace Microsoft.Web --query "registrationState"
```

### 3. 创建 Static Web App

```bash
az staticwebapp create \
  --name dev-flashback \
  --resource-group dev-flashback-rg \
  --location eastasia \
  --sku Free
```

### 4. 获取部署 Token

```bash
az staticwebapp secrets list \
  --name dev-flashback \
  --resource-group dev-flashback-rg \
  --query "properties.apiKey" -o tsv
```

保存此 Token，后续部署需要使用。

## 部署前端（Static Web Apps）

### 方式一：使用部署脚本（推荐）

项目提供了一键部署脚本 `scripts/deploy.sh`。

```bash
# 设置部署 Token（只需设置一次）
export AZURE_SWA_TOKEN="your-deployment-token"

# 部署到生产环境
./scripts/deploy.sh

# 部署到预览环境
./scripts/deploy.sh preview
```

**提示：** 可将 `export AZURE_SWA_TOKEN="..."` 添加到 `~/.zshrc` 或 `~/.bashrc` 中，避免每次输入。

### 方式二：手动部署

```bash
# 1. 构建项目
npm run build

# 2. 部署到 Azure
swa deploy ./dist \
  --api-location ./api \
  --api-language node \
  --api-version 18 \
  --env production \
  --deployment-token "your-deployment-token"
```

### 方式三：GitHub Actions 自动部署

1. 在 GitHub 仓库设置中添加 Secret：
   - 名称：`AZURE_STATIC_WEB_APPS_API_TOKEN`
   - 值：你的部署 Token

2. 创建 `.github/workflows/deploy.yml`：

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

## 部署渲染服务器（Container Apps）

渲染服务器用于在云端生成视频，部署后用户可以直接在网页上导出 MP4 视频。

### 架构说明

```
┌─────────────────┐     ┌──────────────────────┐
│  Static Web App │────▶│  Container Apps      │
│  (前端)          │     │  (渲染服务器)         │
└─────────────────┘     └──────────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  FFmpeg +    │
                        │  Chromium    │
                        └──────────────┘
```

### 使用部署脚本（推荐）

```bash
# 确保已登录 Azure
az login

# 运行部署脚本
./scripts/deploy-render-server.sh
```

脚本会自动完成以下步骤：
1. 构建渲染服务器代码
2. 创建 Azure Container Registry
3. 构建并推送 Docker 镜像
4. 创建 Container Apps 环境
5. 部署 Container App

### 手动部署

如果需要手动部署，按以下步骤操作：

#### 1. 构建渲染服务器

```bash
./scripts/build-render-server.sh
```

#### 2. 创建 Container Registry

```bash
az acr create \
  --resource-group dev-flashback-rg \
  --name devflashbackacr \
  --sku Basic \
  --admin-enabled true
```

#### 3. 构建并推送 Docker 镜像

```bash
cd render-server

# 登录 ACR
az acr login --name devflashbackacr

# 构建镜像
docker build -t devflashbackacr.azurecr.io/dev-flashback-render:latest .

# 推送镜像
docker push devflashbackacr.azurecr.io/dev-flashback-render:latest
```

#### 4. 创建 Container Apps 环境

```bash
az containerapp env create \
  --name dev-flashback-env \
  --resource-group dev-flashback-rg \
  --location eastasia
```

#### 5. 部署 Container App

```bash
# 获取 ACR 密码
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

### 配置前端连接渲染服务器

部署渲染服务器后，需要更新前端配置：

```bash
# 获取渲染服务器 URL
RENDER_URL=$(az containerapp show \
  --name dev-flashback-render \
  --resource-group dev-flashback-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo "Render Server URL: https://$RENDER_URL"

# 使用渲染服务器 URL 重新构建前端
VITE_RENDER_API_URL="https://$RENDER_URL" npm run build

# 部署前端
./scripts/deploy.sh
```

### 渲染服务器 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/api/render` | POST | 启动渲染任务 |
| `/api/render/:jobId` | GET | 查询渲染状态 |
| `/api/render/:jobId/download` | GET | 下载视频 |

### 费用说明

Azure Container Apps 按使用量计费：
- **CPU**: 约 ¥0.35/vCPU-秒
- **内存**: 约 ¥0.035/GiB-秒
- **最小副本为 0**: 空闲时不产生费用

渲染一个 35 秒的视频大约需要 2-3 分钟，费用约 ¥0.5-1.0。

## 配置 GitHub OAuth（可选）

如果需要使用 GitHub OAuth 登录功能：

### 1. 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name:** Dev Flashback
   - **Homepage URL:** `https://your-app.azurestaticapps.net`
   - **Authorization callback URL:** `https://your-app.azurestaticapps.net/callback`

### 2. 配置 Azure 环境变量

```bash
az staticwebapp appsettings set \
  --name dev-flashback \
  --resource-group dev-flashback-rg \
  --setting-names \
  GITHUB_CLIENT_ID="your-client-id" \
  GITHUB_CLIENT_SECRET="your-client-secret" \
  REDIRECT_URI="https://your-app.azurestaticapps.net"
```

## 常见问题

### Q: 部署后显示 Azure 默认欢迎页面

**原因：** 可能部署到了 preview 环境而非 production 环境。

**解决：** 确保使用 `--env production` 参数部署。

### Q: 出现 MissingSubscriptionRegistration 错误

**原因：** Azure 订阅未注册 Microsoft.Web 服务提供商。

**解决：**
```bash
az provider register --namespace Microsoft.Web
# 等待几分钟后重试
```

### Q: API 返回 404

**原因：** Azure Functions API 未正确部署。

**解决：** 确保部署命令包含 `--api-location ./api` 参数。

### Q: OAuth 登录失败

**检查项：**
1. GitHub OAuth App 的回调 URL 是否正确
2. Azure 环境变量是否配置正确
3. 确保使用 HTTPS

## 相关链接

- [Azure Static Web Apps 文档](https://docs.microsoft.com/azure/static-web-apps/)
- [SWA CLI 文档](https://azure.github.io/static-web-apps-cli/)
- [GitHub OAuth 文档](https://docs.github.com/apps/oauth-apps)
