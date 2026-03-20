'use client';

import { useCallback, useEffect, useState } from 'react';
import { captureWebVitals, WebVitalMetric } from '../lib/performance';
import WebVitalsPanel    from '../components/WebVitalsPanel';
import PerformanceDashboard from '../components/PerformanceDashboard';
import NavigationTiming  from '../components/NavigationTiming';
import PerformanceLog    from '../components/PerformanceLog';

export default function Home() {
  const [vitals, setVitals] = useState<Record<string, WebVitalMetric>>({});
  const [logs,   setLogs]   = useState<string[]>([]);

  const addLog = useCallback(
    (msg: string) =>
      setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50)),
    [],
  );

  useEffect(() => {
    const cleanup = captureWebVitals((metric) => {
      setVitals(prev => ({ ...prev, [metric.name]: metric }));
      addLog(`📊 ${metric.name} = ${metric.name === 'CLS' ? metric.value.toFixed(4) : Math.round(metric.value) + 'ms'} (${metric.rating})`);

      // 上报到 API
      fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(() => {});
    });

    addLog('✅ 性能监控已启动');
    return cleanup;
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">🚀 Next.js 性能监控</h1>
          <p className="text-gray-500">实时采集 Web Vitals 与页面加载指标</p>
        </header>

        {/* Web Vitals 全宽 */}
        <div className="mb-6">
          <WebVitalsPanel vitals={vitals} />
        </div>

        {/* 下方两栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PerformanceDashboard addLog={addLog} />
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            <NavigationTiming />
            <PerformanceLog logs={logs} />
          </div>
        </div>
      </div>
    </main>
  );
}
