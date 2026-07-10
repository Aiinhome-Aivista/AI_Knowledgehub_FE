import React, { useState, useEffect, useRef } from 'react';

const Terminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to Server-Sent Events endpoint
    const eventSource = new EventSource('http://localhost:5000/api/stream-logs');

    eventSource.onmessage = (event) => {
      const data = event.data;
      if (data && !data.includes("heartbeat")) {
        setLogs(prev => [...prev, data]);
      }
    };

    eventSource.onerror = () => {
      // Don't flood logs on error, just silently try to reconnect which EventSource does automatically
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-80 h-full border-l border-white/10 bg-[#060913] flex flex-col overflow-hidden">
      <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#0B0F19]">
        <div className="flex gap-1.5 mr-3">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <h3 className="text-xs font-mono text-slate-400 font-semibold tracking-wider uppercase">System Terminal</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs flex flex-col gap-1.5">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">Waiting for system activity...</div>
        ) : (
          logs.map((log, idx) => {
            // Apply some basic color coding based on log level
            let colorClass = "text-slate-300";
            if (log.includes("[ERROR]")) colorClass = "text-red-400";
            else if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400";
            else if (log.includes("[WARN]")) colorClass = "text-amber-400";
            else if (log.includes("[SYSTEM]")) colorClass = "text-fuchsia-400";
            else if (log.includes("[DB]")) colorClass = "text-blue-400";
            
            return (
              <div key={idx} className={`${colorClass} break-words`}>
                {log}
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;
