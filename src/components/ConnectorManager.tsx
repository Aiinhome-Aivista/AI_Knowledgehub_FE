import React, { useState, useEffect } from 'react';
import { endpoint } from '../../config/endpoint';

interface Connector {
  id?: string;
  url: string;
  type: 'rss' | 'webpage' | 'news' | 'wiki' | 'research';
}

const getTypeName = (type: string) => {
  switch (type) {
    case 'rss': return 'RSS Feed';
    case 'news': return 'Online Newspaper';
    case 'wiki': return 'Wikipedia';
    case 'research': return 'Research portal';
    default: return 'Webpage';
  }
};

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'rss': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'news': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'wiki': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'research': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
};

const ConnectorManager: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'rss' | 'webpage' | 'news' | 'wiki' | 'research'>('rss');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string } | null>(null);

  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchConnectors = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint.CONNECTORS);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConnectors(data);
      } else {
        setConnectors([]);
      }
    } catch (err) {
      console.error('Failed to fetch connectors:', err);
      setMessage({ text: 'Failed to load connectors configuration.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleSaveConnectors = async (updatedConnectors: Connector[], isAdd: boolean = false) => {
    setActionLoading(true);
    try {
      const res = await fetch(endpoint.CONNECTORS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConnectors)
      });
      const result = await res.json();
      if (result.status === 'success') {
        setConnectors(updatedConnectors);
        if (isAdd) {
          showToast('Connector added successfully');
        } else {
          setMessage({ text: 'Connectors updated successfully.', type: 'success' });
        }
      } else {
        setMessage({ text: result.error || 'Failed to save connectors.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Connection failed: Failed to save connectors.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddConnector = (e: React.FormEvent) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;

    // Simple URL validation
    try {
      new URL(url);
    } catch (_) {
      setMessage({ text: 'Please enter a valid URL (e.g. http://example.com).', type: 'error' });
      return;
    }

    // Check duplicate
    const isDuplicate = connectors.some(c => c.url.toLowerCase() === url.toLowerCase() && c.type === newType);
    if (isDuplicate) {
      setMessage({ text: 'This connector is already configured.', type: 'error' });
      return;
    }

    const uniqueId = `conn_${Date.now()}`;
    const newConnector: Connector = {
      id: uniqueId,
      url,
      type: newType
    };

    const updated = [...connectors, newConnector];
    handleSaveConnectors(updated, true);
    setNewUrl('');
  };

  const handleDeleteConnector = (idToDelete?: string) => {
    if (!idToDelete) return;
    const updated = connectors.filter(c => c.id !== idToDelete);
    handleSaveConnectors(updated, false);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border theme-border hover:bg-indigo-500/10 hover:text-indigo-400 transition-all theme-text-secondary cursor-pointer"
              title="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold theme-text-primary">Source Connectors</h2>
            <p className="text-sm theme-text-secondary mt-1">Configure RSS feeds and direct webpages that the background scheduler crawls</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs font-bold hover:underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Add Connector Form Card */}
        <div className="p-6 rounded-2xl border theme-card-bg theme-border">
          <h3 className="text-lg font-semibold theme-text-primary mb-4">Add Source Connector</h3>
          <form onSubmit={handleAddConnector} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Type Select */}
              <div className="w-full md:w-1/4">
                <label className="block text-xs font-bold uppercase tracking-wider theme-text-secondary mb-2">Connector Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'rss' | 'webpage' | 'news' | 'wiki' | 'research')}
                  disabled={actionLoading}
                  className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-primary theme-text-primary cursor-pointer"
                >
                  <option value="rss">RSS Feed</option>
                  <option value="news">Online Newspaper</option>
                  <option value="wiki">Wikipedia</option>
                  <option value="research">Research portal</option>
                </select>
              </div>

              {/* URL Input */}
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider theme-text-secondary mb-2">Source URL</label>
                <input
                  type="text"
                  placeholder={newType === 'rss' ? "e.g., http://feeds.bbci.co.uk/news/rss.xml" : "e.g., https://www.bbc.co.uk/news/articles/c411nxyz"}
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  disabled={actionLoading}
                  className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-primary theme-text-primary"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading || !newUrl.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-95 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Saving...' : 'Add Connector'}
              </button>
            </div>
          </form>
        </div>

        {/* List Connectors Card */}
        <div className="p-6 rounded-2xl border theme-card-bg theme-border">
          <h3 className="text-lg font-semibold theme-text-primary mb-4">Configured Connectors</h3>
          {connectors.length === 0 ? (
            <div className="text-sm theme-text-secondary italic text-center py-8">
              No connectors configured. The background scraping engine will fall back to default RSS feeds.
            </div>
          ) : (
            <div className="overflow-hidden border rounded-xl theme-border">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="theme-bg-primary theme-border border-b text-xs font-bold uppercase tracking-wider theme-text-secondary">
                  <tr>
                    <th className="px-6 py-4 w-32">Type</th>
                    <th className="px-6 py-4">URL Link</th>
                    <th className="px-6 py-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {connectors.map((conn) => (
                    <tr key={conn.id} className="theme-hover transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getTypeBadgeClass(conn.type)}`}>
                          {getTypeName(conn.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium theme-text-primary break-all">
                        {conn.url}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteConnector(conn.id)}
                          disabled={actionLoading}
                          className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove connector"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification Popup Banner */}
      {toast && toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-400/20 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectorManager;
