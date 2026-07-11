import { useState, useEffect, useRef } from 'react';

const SystemTerminal: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/api/stream-logs');

    eventSource.onmessage = (event) => {
      const data = event.data;
      if (data && !data.includes("heartbeat")) {
        setLogs(prev => {
          const nextLogs = [...prev, data];
          // Limit to last 200 logs to prevent memory leaks
          if (nextLogs.length > 200) {
            nextLogs.shift();
          }
          return nextLogs;
        });
      }
    };

    eventSource.onerror = () => {
      // Reconnect handled automatically by browser EventSource
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col animate-in fade-in duration-300">
      <div className="w-full flex-1 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-[#060913] shadow-2xl">

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0b0f19]">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Back to Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <h3 className="text-xs font-mono text-slate-400 font-semibold tracking-wider uppercase">System Console Logs</h3>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="accent-indigo-500"
              />
              <span>Auto Scroll</span>
            </label>
            <button
              onClick={handleClearLogs}
              className="text-slate-400 hover:text-white hover:bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Clear Terminal
            </button>
          </div>
        </div>

        {/* Log Feed */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs flex flex-col gap-2 custom-scrollbar bg-[#070a13]">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">Listening for dynamic scraper and database triggers...</div>
          ) : (
            logs.map((log, idx) => {
              // Apply log coloring based on level tags
              let colorClass = "text-slate-300";
              if (log.includes("[ERROR]")) colorClass = "text-rose-400 font-semibold";
              else if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400 font-semibold";
              else if (log.includes("[WARN]")) colorClass = "text-amber-300";
              else if (log.includes("[SYSTEM]")) colorClass = "text-fuchsia-400";
              else if (log.includes("[DB]")) colorClass = "text-sky-400";
              else if (log.includes("[INFO]")) colorClass = "text-slate-400";

              return (
                <div key={idx} className={`${colorClass} break-words leading-relaxed select-text hover:bg-white/[0.02] py-0.5 rounded px-1`}>
                  {log}
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};

export default SystemTerminal;
