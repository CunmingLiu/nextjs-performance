import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    // 自动追踪页面加载、路由跳转、fetch/XHR；INP 等由该集成注册
    Sentry.browserTracingIntegration({ enableInp: true }),
  ],

  // 采集 100% 性能事务（生产环境建议降低到 0.1 ~ 0.3）
  tracesSampleRate: 1.0,

  debug: process.env.NODE_ENV === 'development'
})
