/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withSentryConfig(nextConfig, {
  org: 'dave-ks',
  project: 'javascript-nextjs',

  // 无 SENTRY_AUTH_TOKEN 时不跑上传 source map 的 webpack 插件
  silent: !process.env.CI,
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,

  widenClientFileUpload: true,

  // 经 Next 转发到 Sentry，减轻广告拦截影响
  tunnelRoute: '/monitoring',

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
