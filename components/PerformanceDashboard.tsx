'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  addLog: (msg: string) => void;
}

type Status = '' | 'loading' | 'success' | 'error';

function ResultBox({ text, status }: { text: string; status: Status }) {
  if (!text) return null;
  const style = status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';
  return <div className={`mt-2 p-2 rounded text-sm ${style}`}>{text}</div>;
}

export default function PerformanceDashboard({ addLog }: Props) {
  const [health, setHealth] = useState({ text: '', status: '' as Status });
  const [slow,   setSlow]   = useState({ text: '', status: '' as Status });
  const [data,   setData]   = useState({ text: '', status: '' as Status });

  const checkHealth = async () => {
    setHealth({ text: '检查中…', status: 'loading' });
    try {
      const res  = await fetch('/api/health');
      const json = await res.json();
      const msg  = `✓ 服务正常，运行 ${json.uptime}s`;
      setHealth({ text: msg, status: 'success' });
      addLog(msg);
      Sentry.addBreadcrumb({ category: 'perf.demo', message: msg, level: 'info' });
      Sentry.captureMessage('Perf demo: health check OK', {
        level: 'info',
        tags: { 'perf.demo': 'health' },
        extra: { uptime: json.uptime },
      });
    } catch (e: any) {
      setHealth({ text: `✗ ${e.message}`, status: 'error' });
      addLog(`健康检查失败: ${e.message}`);
      Sentry.captureException(e);
    }
  };

  const testSlow = async () => {
    setSlow({ text: '模拟慢请求 (2s)…', status: 'loading' });
    const t0 = performance.now();
    await new Promise(r => setTimeout(r, 2000));
    const ms  = (performance.now() - t0).toFixed(0);
    const msg = `✓ 完成，耗时 ${ms}ms`;
    setSlow({ text: msg, status: 'success' });
    addLog(msg);
    Sentry.addBreadcrumb({ category: 'perf.demo', message: `Slow request: ${ms}ms`, level: 'info' });
    Sentry.captureMessage('Perf demo: slow client wait OK', {
      level: 'info',
      tags: { 'perf.demo': 'slow-client' },
      extra: { durationMs: Number(ms) },
    });
  };

  const fetchData = async () => {
    setData({ text: '获取数据…', status: 'loading' });
    try {
      const res  = await fetch('/api/health');
      const json = await res.json();
      const msg  = `✓ 数据已获取，时间戳: ${json.timestamp}`;
      setData({ text: msg, status: 'success' });
      addLog(msg);
      Sentry.addBreadcrumb({ category: 'perf.demo', message: 'Data fetched', level: 'info' });
      Sentry.captureMessage('Perf demo: fetch data OK', {
        level: 'info',
        tags: { 'perf.demo': 'fetch' },
        extra: { timestamp: json.timestamp },
      });
    } catch (e: any) {
      setData({ text: `✗ ${e.message}`, status: 'error' });
      addLog(`数据获取失败: ${e.message}`);
      Sentry.captureException(e);
    }
  };

  const actions = [
    { label: '检查健康状态', state: health, fn: checkHealth, loading: '检查中…' },
    { label: '慢请求测试 (2s)', state: slow, fn: testSlow, loading: '测试中…' },
    { label: '获取数据',     state: data, fn: fetchData, loading: '获取中…' },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">📊 性能测试</h2>
      <div className="space-y-4">
        {actions.map(({ label, state, fn, loading }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-4">
            <button
              onClick={fn}
              disabled={state.status === 'loading'}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md text-sm font-medium transition-colors"
            >
              {state.status === 'loading' ? loading : label}
            </button>
            <ResultBox text={state.text} status={state.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
