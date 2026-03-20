'use client';

import { useEffect, useState } from 'react';
import { getNavTiming, formatBytes } from '../lib/performance';

const COLORS = ['bg-blue-400', 'bg-teal-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];

export default function NavigationTiming() {
  const [timing, setTiming] = useState<ReturnType<typeof getNavTiming>>(null);
  const [resources, setResources] = useState({ total: 0, size: 0 });

  useEffect(() => {
    const collect = () => {
      setTiming(getNavTiming());
      const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      setResources({
        total: res.length,
        size:  res.reduce((s, r) => s + ((r as any).transferSize ?? 0), 0),
      });
    };
    if (document.readyState === 'complete') collect();
    else window.addEventListener('load', collect, { once: true });
  }, []);

  const items = timing
    ? [
        { label: 'DNS',     value: timing.dns },
        { label: 'TCP',     value: timing.tcp },
        { label: 'TTFB',    value: timing.ttfb },
        { label: 'DOM 加载', value: timing.domLoad },
        { label: '总计',     value: timing.total },
      ]
    : [];

  const max = Math.max(...items.map(i => i.value), 1);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">⏱️ 导航计时</h2>

      {!timing ? (
        <p className="text-gray-400 text-sm">等待页面完全加载…</p>
      ) : (
        <div className="space-y-3">
          {items.map(({ label, value }, i) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{label}</span>
                <span className="font-mono font-semibold">{value} ms</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`${COLORS[i]} h-3 rounded-full transition-all duration-700`}
                  style={{ width: `${Math.max((value / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex gap-6 text-sm text-gray-600">
        <div>资源数：<span className="font-bold text-gray-800">{resources.total}</span></div>
        <div>传输大小：<span className="font-bold text-gray-800">{formatBytes(resources.size)}</span></div>
      </div>
    </div>
  );
}
