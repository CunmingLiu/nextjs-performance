import * as Sentry from '@sentry/nextjs';

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const getRating = (name: string, value: number): WebVitalMetric['rating'] => {
  if (name === 'CLS') return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
  if (name === 'LCP') return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
  if (name === 'FCP') return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
  if (name === 'TTFB') return value < 600 ? 'good' : value < 1200 ? 'needs-improvement' : 'poor';
  if (name === 'INP') return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
  return 'needs-improvement';
};

// 将 Web Vital 上报到 Sentry
const reportToSentry = (metric: WebVitalMetric) => {
  try {
    Sentry.withScope((scope) => {
      scope.setTag('web.vital', metric.name.toLowerCase());
      scope.setContext('webVital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      });
      Sentry.captureMessage(`Web Vital: ${metric.name}`, 'info');
    });
  } catch { /* Sentry 未初始化时静默忽略 */ }
};

export const captureWebVitals = (cb: (m: WebVitalMetric) => void) => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  const observers: PerformanceObserver[] = [];

  const observe = (type: string, handler: (list: PerformanceObserverEntryList) => void) => {
    try {
      const obs = new PerformanceObserver(handler);
      obs.observe({ type, buffered: true } as PerformanceObserverInit);
      observers.push(obs);
    } catch { /* 浏览器不支持时静默跳过 */ }
  };

  observe('largest-contentful-paint', (list) => {
    const entries = list.getEntries();
    const e = entries.at(-1) as PerformanceEntry | undefined;
    if (!e) return;
    const m: WebVitalMetric = { name: 'LCP', value: e.startTime, rating: getRating('LCP', e.startTime) };
    cb(m); reportToSentry(m);
  });

  observe('layout-shift', (list) => {
    let cls = 0;
    list.getEntries().forEach((e: any) => { if (!e.hadRecentInput) cls += e.value; });
    if (cls > 0) {
      const m: WebVitalMetric = { name: 'CLS', value: cls, rating: getRating('CLS', cls) };
      cb(m); reportToSentry(m);
    }
  });

  observe('paint', (list) => {
    const fcp = list.getEntries().find(e => e.name === 'first-contentful-paint');
    if (fcp) {
      const m: WebVitalMetric = { name: 'FCP', value: fcp.startTime, rating: getRating('FCP', fcp.startTime) };
      cb(m); reportToSentry(m);
    }
  });

  observe('navigation', (list) => {
    const nav = list.getEntries()[0] as PerformanceNavigationTiming;
    if (nav) {
      const ttfb = nav.responseStart - nav.requestStart;
      const m: WebVitalMetric = { name: 'TTFB', value: ttfb, rating: getRating('TTFB', ttfb) };
      cb(m); reportToSentry(m);
    }
  });

  observe('event', (list) => {
    let max = 0;
    list.getEntries().forEach((e: any) => { if (e.duration > max) max = e.duration; });
    if (max > 0) {
      const m: WebVitalMetric = { name: 'INP', value: max, rating: getRating('INP', max) };
      cb(m); reportToSentry(m);
    }
  });

  return () => observers.forEach(o => o.disconnect());
};

export const getNavTiming = () => {
  if (typeof window === 'undefined') return null;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!nav) return null;
  return {
    dns:     +(nav.domainLookupEnd - nav.domainLookupStart).toFixed(1),
    tcp:     +(nav.connectEnd      - nav.connectStart).toFixed(1),
    ttfb:    +(nav.responseStart   - nav.requestStart).toFixed(1),
    domLoad: +(nav.domContentLoadedEventEnd - nav.fetchStart).toFixed(1),
    total:   +(nav.loadEventEnd    - nav.fetchStart).toFixed(1),
  };
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${['B','KB','MB','GB'][i]}`;
};
