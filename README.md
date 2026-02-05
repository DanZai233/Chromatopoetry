# 灵韵配色 (Chromatopoetry)

> 一款AI驱动的色彩美学应用，支持多种大模型供应商

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDanZai233%2Fchromatopoetry)
[![Docker](https://img.shields.io/badge/docker-blue?logo=docker&logoColor=white)](https://www.docker.com/)

**[功能特性](#-功能特性)** • **[快速开始](#-快速开始)** • **[Vercel部署](#-vercel部署)** • **[Docker部署](#-docker部署)** • **[模型配置](#-模型配置)**

</div>

---

## ✨ 功能特性

- 🎨 **灵感生成** - 通过文字描述生成富有诗意的配色方案
- 🖼️ **图片提取** - 从图片中智能提取色彩，捕捉瞬间的色彩灵魂
- 🌐 **多模型支持** - 支持多种AI模型供应商：
  - Gemini (Google)
  - OpenAI
  - DeepSeek
  - OpenRouter
  - 火山引擎
- 🎭 **实时预览** - 多种风格的网站预览（诗意、电商、博客、作品集、仪表板）
- ⚡ **Vercel部署** - 一键部署到Vercel，自动CDN加速
- 🐳 **Docker部署** - 一键部署，开箱即用
- 🔒 **本地存储** - API密钥安全存储在浏览器本地

---

## 🚀 快速开始

### 本地运行

**前置条件：** Node.js 18+ 

1. 克隆仓库：
   ```bash
   git clone https://github.com/DanZai233/chromatopoetry.git
   cd chromatopoetry
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 `http://localhost:5173`

5. 在应用中点击右上角⚙️设置按钮，配置您的AI模型和API密钥

---

## ⚡ Vercel部署

### 一键部署（最简单）

点击下方按钮，将项目一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDanZai233%2Fchromatopoetry)

### 手动部署

1. **Fork 仓库**
   - 点击页面右上角的 Fork 按钮
   - 将仓库 Fork 到您的 GitHub 账号

2. **部署到 Vercel**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New Project"
   - 选择您 Fork 的 `chromatopoetry` 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Vite（会自动识别）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Environment Variables**（可选）：
     - `API_KEY`: 默认API密钥（用户也可以在前端配置）
   - 点击 "Deploy"

4. **等待部署完成**
   - Vercel 会自动构建和部署
   - 部署完成后，您将获得一个 `.vercel.app` 域名

5. **配置自定义域名**（可选）
   - 在项目设置中添加自定义域名

### 环境变量配置

在 Vercel 项目设置中添加以下环境变量（可选）：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `API_KEY` | 默认API密钥 | `sk-xxxxx` |

> **注意**：用户也可以直接在应用的前端界面中配置API密钥，无需设置环境变量。

### 常见问题

**Q: 部署后无法访问？**  
A: 检查 Vercel 部署日志，确保构建成功。首次部署可能需要1-2分钟。

**Q: 如何更新项目？**  
A: 推送代码到 GitHub 后，Vercel 会自动重新部署。

**Q: 如何配置自定义域名？**  
A: 在 Vercel 项目设置 → Domains → Add Domain。

**Q: API密钥安全吗？**  
A: API密钥存储在浏览器的 localStorage 中，不会上传到服务器。但请注意：
- 不要在公共设备上保存密钥
- 定期更换 API 密钥
- 不要将包含密钥的浏览器数据分享给他人
- 建议使用限额较低的 API 密钥以降低风险

---

## 🐳 Docker部署

### 使用Docker Compose（推荐）

1. 克隆仓库并进入目录：
   ```bash
   git clone https://github.com/DanZai233/chromatopoetry.git
   cd chromatopoetry
   ```

2. 创建 `.env` 文件（可选）：
   ```bash
   cp .env.example .env
   ```
   编辑 `.env` 文件，设置默认API密钥：
   ```
   API_KEY=your_api_key_here
   ```

3. 使用Docker Compose启动：
   ```bash
   docker-compose up -d
   ```

4. 访问 `http://localhost:5173`

5. 停止服务：
   ```bash
   docker-compose down
   ```

### 使用Docker命令

1. 构建镜像：
   ```bash
   docker build -t chromatopoetry .
   ```

2. 运行容器：
   ```bash
   docker run -d -p 5173:5173 --name chromatopoetry chromatopoetry
   ```

3. 查看日志：
   ```bash
   docker logs -f chromatopoetry
   ```

---

## ⚙️ 模型配置

### 支持的模型供应商

| 供应商 | 模型示例 | 说明 |
|--------|----------|------|
| **Gemini** | `gemini-3-flash-preview` | Google官方模型，默认选择 |
| **OpenAI** | `gpt-4o-mini` | OpenAI GPT系列 |
| **DeepSeek** | `deepseek-chat` | DeepSeek开源模型 |
| **OpenRouter** | `anthropic/claude-3.5-sonnet` | 聚合多种模型 |
| **火山引擎** | `ep-20250215134427-k4s9k` | 字节跳动豆包模型，需使用Endpoint ID |

### 配置步骤

1. 打开应用，点击右上角的⚙️设置按钮
2. 选择您偏好的模型供应商
3. 输入对应的API密钥
4. （可选）自定义Base URL和模型名称
5. 点击"保存配置"

**⚠️ 火山引擎用户注意：**
- 应用支持两种API模式：OpenAI 兼容接口和原生 API
- API密钥格式：`AccessKeyID;AccessKeySecret`
- 配置面板中可以选择API模式，并会显示详细的配置说明
- OpenAI 兼容模式：使用 Endpoint ID
- 原生 API 模式：使用原生模型名称（如 `doubao-pro-32k`）

配置完成后，您可以：
- 通过"生成"页面使用文字描述创建配色
- 通过"提取"页面上传图片提取色彩
- 在"探索"页面查看预设的精美配色方案

---

## 📝 API密钥获取

### Gemini
- 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
- 创建API密钥

### OpenAI
- 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
- 创建API密钥

### DeepSeek
- 访问 [DeepSeek Platform](https://platform.deepseek.com/)
- 注册并获取API密钥

### OpenRouter
- 访问 [OpenRouter](https://openrouter.ai/keys)
- 创建API密钥

### 火山引擎
- 访问 [火山引擎控制台](https://console.volcengine.com/ark)
- 在访问管理中获取API密钥，格式为 `AccessKeyID;AccessKeySecret`
- **API密钥** 填写 `AccessKeyID;AccessKeySecret` 格式
- **Base URL** 保持默认：`https://ark.cn-beijing.volces.com/api/v3`

本应用支持火山引擎的两种API模式，可在设置中选择：

**1. OpenAI 兼容接口模式（推荐新手）**
- 模型名称填写 Endpoint ID（如：`ep-20250215134427-k4s9k`）
- 需要创建推理接入点（Endpoint）
- 使用标准的 OpenAI SDK

**2. 原生 API 模式（推荐进阶用户）**
- 模型名称填写原生模型名称（如：`doubao-pro-32k`）
- 无需创建 Endpoint，直接使用模型
- 支持图片输入，更完整的原生功能
- 使用火山引擎 Responses API

> 💡 **建议**：如果您刚开始使用，建议选择 **OpenAI 兼容接口**；如果您需要更完整的功能，可以选择 **原生 API**。

---

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI组件**: Tailwind CSS
- **图标库**: Lucide React
- **AI SDK**: 
  - @google/genai (Gemini)
  - openai (OpenAI兼容接口)
- **容器化**: Docker + Docker Compose
- **部署平台**: Vercel

---

## 📦 项目结构

```
chromatopoetry/
├── .github/             # GitHub Actions工作流
│   └── workflows/
│       └── deploy-vercel.yml
├── components/          # React组件
│   ├── Navigation.tsx   # 导航栏
│   ├── PaletteCard.tsx # 配色卡片
│   ├── PreviewModal.tsx# 预览模态框
│   └── Settings.tsx    # 设置面板
├── services/           # API服务层
│   ├── aiService.ts    # AI模型服务
│   └── geminiService.ts# Gemini兼容服务（待移除）
├── App.tsx            # 主应用组件
├── types.ts           # TypeScript类型定义
├── constants.ts       # 常量定义
├── Dockerfile         # Docker镜像构建文件
├── docker-compose.yml # Docker Compose配置
├── vercel.json        # Vercel配置文件
├── .vercelignore      # Vercel部署忽略文件
├── .env.example       # 环境变量示例
└── package.json       # 项目依赖
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

详细贡献指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 许可证

本项目采用 MIT 许可证。

---

## 🙏 致谢

- 感谢所有提供AI模型的供应商
- 设计灵感来自东方传统美学

---

<div align="center">

Made with ❤️ by Chromatopoetry Team

</div>
