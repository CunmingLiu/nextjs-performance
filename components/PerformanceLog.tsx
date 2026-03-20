'use client';

interface Props {
  logs: string[];
}

export default function PerformanceLog({ logs }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col">
      <h2 className="text-xl font-bold text-blue-700 mb-4">📋 操作日志</h2>
      <div className="flex-1 bg-gray-900 text-gray-100 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed">
        {logs.length === 0
          ? <span className="text-gray-500 italic">暂无日志…</span>
          : logs.map((log, i) => <div key={i}>{log}</div>)
        }
      </div>
    </div>
  );
}
