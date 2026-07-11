import { useState, useEffect, useCallback } from 'react';
import { endpoint } from '../../config/endpoint';

interface SchedulerLog {
  id: number;
  run_at: string;
  next_run_at: string | null;
  interval_hours: number;
  status: string;
  articles_processed: number;
  nodes_added: number;
  nodes_updated: number;
  edges_added: number;
  errors: string;
  triggered_by: string;
}

interface SchedulerStatus {
  scheduler_running: boolean;
  next_run_time: string | null;
  interval_hours: number;
  last_run: {
    timestamp: string;
    status: string;
    articles_processed: string[];
    nodes_added: number;
    edges_added: number;
  } | null;
}

function formatDateLocal(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  } catch { return iso; }
}

function useCountdown(targetIso: string | null) {
  const [diff, setDiff] = useState<number>(0);

  useEffect(() => {
    if (!targetIso) { setDiff(0); return; }
    const tick = () => {
      const ms = new Date(targetIso).getTime() - Date.now();
      setDiff(Math.max(0, ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!targetIso || diff <= 0) return null;
  const totalSecs = Math.floor(diff / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    SUCCESS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    PARTIAL_FAILURE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    FAILURE: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    RUNNING: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}>
      {status}
    </span>
  );
};

const TriggerBadge = ({ by }: { by: string }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${by === 'manual' ? 'bg-purple-500/15 text-purple-400' : 'bg-sky-500/15 text-sky-400'}`}>
    {by === 'manual' ? '⚡ Manual' : '🕐 Auto'}
  </span>
);

const AdminScheduling: React.FC = () => {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [logs, setLogs] = useState<SchedulerLog[]>([]);
  const [intervalHours, setIntervalHours] = useState<number>(6);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const countdown = useCountdown(status?.next_run_time ?? null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(endpoint.SCHEDULER_STATUS);
      const data = await res.json();
      setStatus(data);
      if (data.interval_hours) setIntervalHours(data.interval_hours);
    } catch (err) {
      console.error('Failed to fetch scheduler status:', err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`${endpoint.SCHEDULER_LOGS}?limit=50`);
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (err) {
      console.error('Failed to fetch scheduler logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStatus(), fetchLogs()]).finally(() => setLoading(false));
    const statusInterval = setInterval(fetchStatus, 10000);
    const logsInterval = setInterval(fetchLogs, 30000);
    return () => { clearInterval(statusInterval); clearInterval(logsInterval); };
  }, [fetchStatus, fetchLogs]);

  const handleSaveInterval = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);
    try {
      const currentRes = await fetch(endpoint.SETTINGS);
      const currentSettings = await currentRes.json();
      const updatedSettings = { ...currentSettings, scheduler_interval_hours: intervalHours };
      const res = await fetch(endpoint.SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const result = await res.json();
      if (result.status === 'success') {
        setMessage({ text: `✓ Scheduler rescheduled to every ${intervalHours} hours. Next run updated automatically.`, type: 'success' });
        setTimeout(() => { fetchStatus(); fetchLogs(); }, 1000);
      } else {
        setMessage({ text: result.error || 'Failed to save settings.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to update scheduler settings.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerScrape = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch(endpoint.TRIGGER_SCRAPE, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setMessage({ text: '⚡ Scraping task triggered manually. Check Terminal for live progress.', type: 'success' });
        setTimeout(() => { fetchStatus(); fetchLogs(); }, 3000);
      } else {
        setMessage({ text: data.error || 'Failed to trigger scraping task.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to trigger scraping task.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isRunning = status?.scheduler_running;
  const nextRun = status?.next_run_time;
  const lastRun = status?.last_run;

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold theme-text-primary">System Scheduling</h2>
            <p className="text-sm theme-text-secondary mt-1">Configure intervals, monitor runs &amp; view full execution history</p>
          </div>
          <button
            onClick={handleTriggerScrape}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {actionLoading ? 'Executing…' : 'Trigger Now'}
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div className={`p-4 rounded-xl border text-sm flex items-start gap-2 ${message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {message.text}
            <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setMessage(null)}>✕</button>
          </div>
        )}

        {/* Status Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Engine Status */}
          <div className="p-5 rounded-2xl border theme-card-bg theme-border flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider theme-text-secondary">Engine</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className={`text-sm font-semibold ${isRunning ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isRunning ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="text-xs theme-text-secondary">APScheduler background engine</p>
          </div>

          {/* Current Interval */}
          <div className="p-5 rounded-2xl border theme-card-bg theme-border flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider theme-text-secondary">Interval</span>
            <span className="text-2xl font-extrabold text-indigo-400">{intervalHours}h</span>
            <p className="text-xs theme-text-secondary">Runs every {intervalHours} hour{intervalHours !== 1 ? 's' : ''}</p>
          </div>

          {/* Next Run */}
          <div className="p-5 rounded-2xl border theme-card-bg theme-border flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider theme-text-secondary">Next Run In</span>
            {countdown ? (
              <span className="text-lg font-bold text-amber-400 font-mono">{countdown}</span>
            ) : (
              <span className="text-sm theme-text-secondary">—</span>
            )}
            <p className="text-xs theme-text-secondary truncate" title={nextRun ?? ''}>
              {nextRun ? formatDateLocal(nextRun) : 'Not scheduled'}
            </p>
          </div>

          {/* Last Run */}
          <div className="p-5 rounded-2xl border theme-card-bg theme-border flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider theme-text-secondary">Last Run</span>
            {lastRun ? (
              <>
                <StatusBadge status={lastRun.status} />
                <p className="text-xs theme-text-secondary">{formatDateLocal(lastRun.timestamp)}</p>
              </>
            ) : (
              <span className="text-sm theme-text-secondary">No history yet</span>
            )}
          </div>
        </div>

        {/* Config + Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Interval Configuration */}
          <div className="p-6 rounded-2xl border theme-card-bg theme-border">
            <h3 className="text-base font-semibold theme-text-primary mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Interval Configuration
            </h3>
            <form onSubmit={handleSaveInterval} className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                    Execution Period
                  </label>
                  <span className="text-lg font-extrabold text-indigo-400">{intervalHours}h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-2 rounded-full"
                />
                <div className="flex justify-between text-xs theme-text-secondary mt-1">
                  <span>1h</span><span>6h</span><span>12h</span><span>24h</span>
                </div>
              </div>
              <p className="text-xs theme-text-secondary">
                Changing the interval will immediately reschedule the APScheduler job and take effect on the next run.
              </p>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Save &amp; Reschedule
              </button>
            </form>
          </div>

          {/* Last Execution Quick Stats */}
          <div className="p-6 rounded-2xl border theme-card-bg theme-border">
            <h3 className="text-base font-semibold theme-text-primary mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Last Execution Stats
            </h3>
            {lastRun ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Articles', value: lastRun.articles_processed?.length ?? 0, color: 'text-sky-400' },
                  { label: 'Nodes Added', value: lastRun.nodes_added ?? 0, color: 'text-emerald-400' },
                  { label: 'Edges Added', value: lastRun.edges_added ?? 0, color: 'text-purple-400' },
                  { label: 'Status', value: lastRun.status, color: lastRun.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/5 border theme-border">
                    <p className="text-xs theme-text-secondary">{label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-28 text-sm theme-text-secondary italic">
                No execution history available yet.
              </div>
            )}
          </div>
        </div>

        {/* ── Full Run History Table ── */}
        <div className="rounded-2xl border theme-card-bg theme-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <h3 className="text-base font-semibold theme-text-primary">Run History</h3>
              <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20 font-semibold">
                {logs.length} records
              </span>
            </div>
            <button
              onClick={() => { fetchLogs(); }}
              className="text-xs theme-text-secondary hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {logsLoading && logs.length === 0 ? (
            <div className="p-10 flex justify-center">
              <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-sm theme-text-secondary italic">
              No run history found. History is recorded in MySQL after each scheduled or manual run.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    {['#', 'Run At', 'Next Run At', 'Interval', 'Trigger', 'Status', 'Articles', 'Nodes+', 'Nodes~', 'Edges+', 'Errors'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider theme-text-secondary whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const hasErrors = log.errors && log.errors.trim().length > 0;
                    const isExpanded = expandedRow === log.id;
                    return (
                      <>
                        <tr
                          key={log.id}
                          className={`border-b theme-border transition-colors cursor-pointer ${idx % 2 === 0 ? 'hover:bg-white/[0.02]' : 'bg-white/[0.015] hover:bg-white/[0.03]'}`}
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                        >
                          <td className="px-4 py-3 theme-text-secondary font-mono text-xs">{log.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="theme-text-primary font-medium">{formatDateLocal(log.run_at)}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap theme-text-secondary text-xs">
                            {log.next_run_at ? formatDateLocal(log.next_run_at) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded text-xs font-bold text-indigo-400 bg-indigo-500/10">{log.interval_hours}h</span>
                          </td>
                          <td className="px-4 py-3">
                            <TriggerBadge by={log.triggered_by || 'scheduler'} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={log.status} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sky-400 font-semibold">{log.articles_processed}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-emerald-400 font-semibold">+{log.nodes_added}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-indigo-400 font-semibold">~{log.nodes_updated}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-purple-400 font-semibold">+{log.edges_added}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {hasErrors ? (
                              <span className="text-rose-400 font-semibold">⚠ {log.errors.split(';').length}</span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && hasErrors && (
                          <tr key={`${log.id}-expand`} className="border-b theme-border bg-rose-500/5">
                            <td colSpan={11} className="px-6 py-3">
                              <div className="text-xs text-rose-400">
                                <p className="font-semibold mb-1 uppercase tracking-wider">Errors from this run:</p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {log.errors.split(';').filter(Boolean).map((err, i) => (
                                    <li key={i} className="break-all">{err.trim()}</li>
                                  ))}
                                </ul>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminScheduling;
