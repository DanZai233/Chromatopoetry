# 灵韵配色 (Chromatopoetry)

> 一款AI驱动的色彩美学应用，支持多种大模型供应商

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDanZai233%2Fchromatopoetry)
[![Docker](https://img.shields.io/badge/docker-blue?logo=docker&logoColor=white)](https://www.docker.com/)

**[功能特性](#-功能特性)** • **[快速开始](#-快速开始)** • **[Vercel部署](#-vercel部署)** • **[Docker部署](#-docker部署)** • **[模型配置](#-模型配置)**

</div>

---

![首页](屏幕截图%202026-03-04%20103024.png)

---

## ✨ 功能特性

- 🎨 **灵感生成** - 通过文字描述生成富有诗意的配色方案
- 🖼️ **图片提取** - 从图片中智能提取色彩，捕捉瞬间的色彩灵魂
- 🌐 **多模型支持** - 通过 UniLLM 统一接入 14 家供应商，包括 Gemini、OpenAI、Anthropic、DeepSeek、火山引擎、Kimi、通义、GLM、Grok、Groq、Mistral、SiliconFlow、Ollama 和任意 OpenAI 兼容端点
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

5. 在应用中点击右上角设置按钮，选择 UniLLM 供应商和 API 密钥

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
     - `VITE_UNILLM_PROVIDER`: 默认供应商，例如 `gemini`
     - `VITE_UNILLM_API_KEY`: 默认 API 密钥（用户也可以在前端配置）
     - `VITE_UNILLM_MODEL`: 默认模型名称
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
| `VITE_UNILLM_PROVIDER` | 默认供应商 | `gemini` |
| `VITE_UNILLM_API_KEY` | 默认 API 密钥 | `sk-xxxxx` |
| `VITE_UNILLM_MODEL` | 默认模型 | `gemini-2.5-flash` |
| `VITE_UNILLM_BASE_URL` | 自定义兼容端点 | `https://example.com/v1` |

> **注意**：用户也可以直接在应用的前端界面中配置API密钥，无需设置环境变量。
> `VITE_*` 会进入浏览器构建产物，请只使用受限额约束的密钥。

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
   编辑 `.env` 文件，按需设置默认配置：
   ```
   VITE_UNILLM_PROVIDER=gemini
   VITE_UNILLM_API_KEY=your_api_key_here
   VITE_UNILLM_MODEL=gemini-2.5-flash
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

| 供应商 | 模型示例 | 协议 |
|--------|----------|------|
| **Gemini** | `gemini-2.5-flash` | Gemini |
| **OpenAI** | `gpt-4o-mini` | OpenAI 兼容 |
| **Anthropic** | `claude-sonnet-4-20250514` | Anthropic |
| **DeepSeek** | `deepseek-chat` | OpenAI 兼容 |
| **火山引擎** | `doubao-seed-2-0-pro` 或 Endpoint ID | OpenAI 兼容 |
| **Moonshot / Qwen / Zhipu / xAI / Groq / Mistral / SiliconFlow** | 对应厂商模型名 | OpenAI 兼容 |
| **Ollama** | `llama3.1:8b` | 本地 OpenAI 兼容 |
| **Custom** | 任意模型名 | 任意 OpenAI 兼容端点 |

所有厂商统一通过 [UniLLM SDK](https://github.com/DanZai233/unillm-sdk) 接入，应用只维护一份请求、超时和输出解析逻辑。

### 配置步骤

1. 打开应用，点击右上角的设置按钮
2. 选择模型供应商
3. 输入 API 密钥。Ollama 和部分自建端点可以留空
4. 按需修改 Base URL 和模型名称
5. 点击“保存配置”

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

### Anthropic
- 访问 [Anthropic Console](https://console.anthropic.com/)
- 创建 API 密钥

### Moonshot / Qwen / Zhipu / xAI / Groq / Mistral / SiliconFlow
- 在各厂商控制台创建 API 密钥，并在设置面板中选择对应供应商
- 如需使用 OpenRouter 等聚合服务，请选择 **Custom**，把服务地址填入 Base URL

### 火山引擎
- 访问 [火山引擎控制台](https://console.volcengine.com/ark)
- 在访问管理中获取 API 密钥
- 模型名称可填写 Ark Endpoint ID，或 UniLLM 内置模型名

---

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI组件**: Tailwind CSS
- **图标库**: Lucide React
- **AI SDK**: unillm-sdk/browser（统一适配 14 家模型供应商）
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
│   └── aiService.ts    # UniLLM 统一模型服务
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
