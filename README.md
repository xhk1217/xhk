# ? 2026 新年快乐 Web 项目构建指南

本项目是一个基于 **Vue 3 + Vite + TypeScript** 的现代化前端工程，旨在为你展示如何从零构建一个具备工程化能力的 Web 应用。

---

## ? 快速开始

### 1. 环境准备
确保你已安装 [Node.js](https://nodejs.org/) (推荐 v22.12.0+) 和 [nvm](https://github.com/coreybutler/nvm-windows)。

```bash
node -v # 应显示 v22.12.0 或更高
```

### 2. 安装依赖
按照以下步骤逐步安装：

```bash
# 初始化项目
npm init -y

# 安装核心开发依赖
npm install -D vite @vitejs/plugin-vue typescript vue-tsc

# 安装 Vue 核心
npm install vue

# 安装基础插件
npm install vue-router@4 pinia axios dayjs vue-i18n element-plus

# 安装样式工具 (使用最新的 preset-wind3)
npm install -D sass unocss @unocss/preset-wind3 @unocss/preset-attributify @unocss/preset-web-fonts

# 安装 Vite 增强插件
npm install -D unplugin-vue-components unplugin-icons vite-plugin-svg-icons vite-plugin-mock
```

### 3. 启动开发服务器
```bash
npm run dev
```

---

## ? 目录结构详解

| 目录/文件 | 作用说明 | 存放内容建议 |
| :--- | :--- | :--- |
| **`src/`** | **源代码根目录** | 所有业务代码都在这里 |
| ├─ `assets/` | 静态资源 | 存放图片、全局字体、SVG 图标等 |
| ├─ `components/` | 公共组件 | 可复用的 UI 组件（如按钮、弹窗），由插件自动按需引入 |
| ├─ `composables/` | 组合式函数 | 存放可复用的业务逻辑 (Hooks)，如 `useAuth`, `useTheme` |
| ├─ `layouts/` | 页面布局 | 存放通用的页面外壳组件（如带侧边栏的布局） |
| ├─ `pages/` | 路由页面 | 存放具体的业务页面组件（如 Home.vue, Login.vue） |
| ├─ `router/` | 路由配置 | 定义 URL 路径与页面组件的映射关系 |
| ├─ `services/` | 接口请求 | 存放 Axios 实例封装及具体的 API 请求函数 |
| ├─ `store/` | 状态管理 | 使用 Pinia 管理全局共享数据（如用户信息、主题状态） |
| ├─ `styles/` | 全局样式 | 存放全局 SCSS 变量、重置样式 (reset.css) 等 |
| └─ `types/` | 类型定义 | 存放全局的 TypeScript 接口 (Interface) 和类型 (Type) |
| **`mock/`** | **模拟数据** | 在后端接口未完成时，用于模拟 API 返回数据 |
| **`public/`** | **公共静态资源** | 存放不需要经过构建工具处理的文件（如 favicon.ico） |

---

## ? 核心配置文件说明

| 文件名 | 作用 | 关键点 |
| :--- | :--- | :--- |
| **`vite.config.ts`** | Vite 配置文件 | 配置插件（Vue, UnoCSS, Mock）、路径别名、开发服务器等 |
| **`uno.config.ts`** | UnoCSS 配置文件 | 定义原子化 CSS 的预设（Wind3）、快捷方式和主题变量 |
| **`tsconfig.json`** | TS 主配置文件 | 控制整个项目的 TypeScript 编译规则、路径映射和类型包含 |
| **`tsconfig.node.json`** | TS Node 配置文件 | 专门针对 `vite.config.ts` 等 Node 环境运行文件的 TS 配置 |
| **`package.json`** | 项目元数据 | 管理项目依赖包、运行脚本（dev, build）和版本信息 |
| **`index.html`** | 入口 HTML | 整个单页应用 (SPA) 的挂载点 |

---

## ? 项目亮点
- **极速启动**: 基于 Vite 的原生 ESM 开发服务器。
- **类型安全**: 全程使用 TypeScript 编写，配置了完善性 `tsconfig`。
- **现代样式**: 使用 **UnoCSS + Wind3** 预设，兼容 Tailwind v3 语法，告别臃肿的 CSS。
- **按需加载**: 组件和图标均实现自动按需引入，显著减小打包体积。
- **Mock 集成**: 内置 Mock 服务，实现前后端并行开发。

祝你在 2026 年的代码之旅中：**Bug 零发生，逻辑秒通顺！** ??
