# Dev Flashback

GitHub 年度总结视频生成器，使用 React + Vite + Remotion 构建。

<div align="center">

https://github.com/user-attachments/assets/7fc16ebf-23ba-40e3-98c1-e5c7a433df27

</div>

## 功能特性

- 通过 GitHub OAuth 一键授权登录
- 使用 GitHub GraphQL API 获取年度统计数据
- 自动生成个性化年度总结视频
- 包含多个精美动画场景：
  - 开场动画
  - 个人资料展示
  - 贡献热力图（带运镜效果）
  - 编程语言统计
  - 热门仓库展示
  - 活跃时段分析
  - 连续贡献记录
  - 年度总结
  - 结尾动画

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 GitHub OAuth（可选）

如果你想使用 OAuth 授权登录，需要先创建 GitHub OAuth App：

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Application name: Dev Flashback
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/callback
4. 创建后复制 Client ID 和 Client Secret
5. 复制 `.env.example` 为 `.env` 并填入配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```
GITHUB_CLIENT_ID=你的Client ID
GITHUB_CLIENT_SECRET=你的Client Secret
REDIRECT_URI=http://localhost:3000
PORT=3001
```

### 3. 启动开发服务器

**使用 OAuth 授权（需要配置 OAuth App）：**
```bash
npm run dev:all
```
这会同时启动前端 (port 3000) 和后端 (port 3001)

**仅使用 Token 方式（无需配置）：**
```bash
npm run dev
```

### 4. Remotion Studio

在 Remotion Studio 中预览和编辑视频：

```bash
npm run remotion:studio
```

### 5. 渲染视频

导出最终视频文件：

```bash
npm run remotion:render
```

## 使用方式

### 方式一：GitHub OAuth 授权（推荐）
1. 点击 "Continue with GitHub" 按钮
2. 授权应用访问你的 GitHub 数据
3. 选择年份，点击生成视频

### 方式二：手动输入 Token
1. 点击 "Enter Token Manually"
2. 输入你的 GitHub Personal Access Token
3. 输入用户名，点击生成视频

### 方式三：Demo 模式
点击 "View Demo Video" 使用示例数据预览效果

## 获取 GitHub Token（手动方式）

1. 访问 [GitHub Token 设置页面](https://github.com/settings/tokens/new?scopes=read:user,repo)
2. 勾选 `read:user` 和 `repo` 权限
3. 生成并复制 Token

## 项目结构

```
dev-flashback/
├── api/                  # Azure Functions (OAuth 后端)
│   ├── auth-github/      # GitHub OAuth 发起
│   └── auth-github-callback/  # OAuth 回调处理
├── docs/                 # 文档
│   └── DEPLOY.md         # 部署指南
├── render-server/        # 视频渲染服务器 (Azure Container Apps)
│   ├── Dockerfile        # Docker 配置
│   ├── server.js         # 渲染 API 服务
│   └── package.json      # 依赖配置
├── scripts/              # 脚本
│   ├── deploy.sh         # 前端部署脚本
│   ├── deploy-render-server.sh  # 渲染服务器部署脚本
│   └── build-render-server.sh   # 渲染服务器构建脚本
├── server/
│   └── index.ts          # 本地开发 OAuth 服务
├── src/
│   ├── remotion/
│   │   ├── scenes/       # 视频场景组件
│   │   ├── transitions/  # 转场效果
│   │   ├── Root.tsx      # Remotion 配置
│   │   └── YearlyReview.tsx  # 主视频组件
│   ├── services/         # GitHub GraphQL API 服务
│   ├── types/            # TypeScript 类型定义
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 入口文件
├── package.json
├── vite.config.ts
└── remotion.config.ts
```

## 技术栈

- React 19
- TypeScript
- Vite
- Remotion
- Express (OAuth 后端)
- GraphQL (graphql-request)

## License

MIT
