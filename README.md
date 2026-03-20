# Next.js 性能监控示例

基于 **Next.js 14（App Router）** 的前端性能演示：采集 **Web Vitals**、导航计时，并集成 **Sentry** 上报与性能追踪。界面使用 **Tailwind CSS**。

## 功能概览

- **Web Vitals**：LCP、FCP、CLS、TTFB、INP（`PerformanceObserver` + 本地面板）
- **性能测试面板**：健康检查、慢任务、Fetch 示例，成功路径会向 Sentry 发送演示事件
- **Sentry**：客户端/服务端初始化、`browserTracing`、可选 Source Map 上传与 `tunnelRoute`（见 `next.config.js`）
- **API**：`GET /api/health`、`POST /api/vitals`（接收 vitals 上报）

## 环境要求

- Node.js 18+
- npm（或 pnpm / yarn）

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

```bash
npm run build   # 生产构建
npm run start   # 生产启动（需先 build）
```

## 环境变量

在项目根目录创建 **`.env.local`**（勿提交仓库）：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry 客户端 DSN（Settings → Client Keys） |

可选：构建时上传 Source Map 需要 **Sentry Auth Token**。仅在本机配置，**不要写入 Git**：

- 使用 **`export SENTRY_AUTH_TOKEN=...`**，或
- 本地文件 **`.env.sentry-build-plugin`**（已在 `.gitignore` 中忽略）

未设置 `SENTRY_AUTH_TOKEN` 时，`next.config.js` 会禁用上传 source map 的 webpack 插件，仍可正常开发与构建。

## 目录结构（节选）

```
app/                 # App Router 页面与 API
components/          # WebVitals 面板、性能仪表盘等
lib/performance.ts   # Web Vitals 采集与 Sentry 上报辅助
sentry.*.config.*    # Sentry 客户端 / 服务端 / Edge 配置
instrumentation*.ts  # Next 运行时初始化钩子
```

## 说明

- **`.next`**、**`node_modules`**、**`.env*.local`**、**`.env.sentry-build-plugin`** 不应提交；详见 `.gitignore`。
- 若曾误提交密钥，请在 Sentry 后台轮换 Token，并从 Git 历史中移除敏感文件后再推送。

## 许可证

私有项目；如需开源请自行补充许可证文件。
