'use client';

import { WebVitalMetric } from '../lib/performance';

const CONFIGS: Record<string, { desc: string; target: string }> = {
  LCP:  { desc: '最大内容绘制', target: '< 2.5s' },
  FCP:  { desc: '首次内容绘制', target: '< 1.8s' },
  CLS:  { desc: '累积布局偏移', target: '< 0.1'  },
  TTFB: { desc: '首字节时间',   target: '< 600ms' },
  INP:  { desc: '交互响应时间', target: '< 200ms' },
};

const RATING_STYLE: Record<string, string> = {
  good:             'border-green-400  bg-green-50   text-green-700',
  'needs-improvement': 'border-yellow-400 bg-yellow-50 text-yellow-700',
  poor:             'border-red-400    bg-red-50     text-red-700',
};

const BADGE: Record<string, string> = {
  good:             'bg-green-100  text-green-800',
  'needs-improvement': 'bg-yellow-100 text-yellow-800',
  poor:             'bg-red-100    text-red-800',
};

const BADGE_LABEL: Record<string, string> = {
  good: '良好', 'needs-improvement': '待改进', poor: '较差',
};

function fmt(name: string, value: number) {
  if (name === 'CLS') return value.toFixed(4);
  return `${Math.round(value)} ms`;
}

interface Props {
  vitals: Record<string, WebVitalMetric>;
}

export default function WebVitalsPanel({ vitals }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">🎯 Web Vitals</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.keys(CONFIGS).map((name) => {
          const metric = vitals[name];
          const rating = metric?.rating ?? 'good';
          const cardStyle = metric ? RATING_STYLE[rating] : 'border-gray-200 bg-gray-50 text-gray-400';
          return (
            <div key={name} className={`border-2 rounded-lg p-3 flex flex-col gap-1 ${cardStyle}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{name}</span>
                {metric && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${BADGE[rating]}`}>
                    {BADGE_LABEL[rating]}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">
                {metric ? fmt(name, metric.value) : '—'}
              </div>
              <div className="text-xs opacity-70">{CONFIGS[name].desc}</div>
              <div className="text-xs opacity-60">目标 {CONFIGS[name].target}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
