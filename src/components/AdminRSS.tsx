import { useState, useEffect } from 'react';

const AdminRSS: React.FC = () => {
  const [rssUrls, setRssUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      const data = await res.json();
      setRssUrls(data.rss_urls || []);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ text: 'Failed to load RSS feeds configuration.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (updatedUrls: string[]) => {
    setActionLoading(true);
    try {
      // 1. Fetch latest settings
      const currentRes = await fetch('http://localhost:5000/api/settings');
      const currentSettings = await currentRes.json();
      
      // 2. Merge urls
      const updatedSettings = {
        ...currentSettings,
        rss_urls: updatedUrls
      };

      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const result = await res.json();
      if (result.status === 'success') {
        setRssUrls(updatedUrls);
        setMessage({ text: 'RSS Feeds updated successfully.', type: 'success' });
      } else {
        setMessage({ text: result.error || 'Failed to save settings.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Connection failed: Failed to save settings.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;
    
    // Simple URL validation
    try {
      new URL(url);
    } catch (_) {
      setMessage({ text: 'Please enter a valid URL (e.g. http://example.com/feed).', type: 'error' });
      return;
    }

    if (rssUrls.includes(url)) {
      setMessage({ text: 'This feed URL is already added.', type: 'error' });
      return;
    }

    const updated = [...rssUrls, url];
    handleSaveSettings(updated);
    setNewUrl('');
  };

  const handleDeleteUrl = (indexToDelete: number) => {
    if (confirm('Are you sure you want to remove this source feed?')) {
      const updated = rssUrls.filter((_, i) => i !== indexToDelete);
      handleSaveSettings(updated);
    }
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
      <div>
        <h2 className="text-2xl font-bold theme-text-primary">RSS & Website Management</h2>
        <p className="text-sm theme-text-secondary mt-1">Add or remove RSS sources that the background engine crawls</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add new URL card */}
      <div className="p-6 rounded-2xl border theme-card-bg theme-border">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">Add Feed Source</h3>
        <form onSubmit={handleAddUrl} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter RSS Feed XML URL (e.g., http://feeds.bbci.co.uk/news/rss.xml)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            disabled={actionLoading}
            className="flex-1 rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-primary theme-text-primary"
            required
          />
          <button
            type="submit"
            disabled={actionLoading || !newUrl.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-95 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? 'Saving...' : 'Add Source'}
          </button>
        </form>
      </div>

      {/* List feeds card */}
      <div className="p-6 rounded-2xl border theme-card-bg theme-border">
        <h3 className="text-lg font-semibold theme-text-primary mb-4">Configured Feed Sources</h3>
        {rssUrls.length === 0 ? (
          <div className="text-sm theme-text-secondary italic text-center py-8">
            No feed sources configured. The scheduler will not fetch any articles.
          </div>
        ) : (
          <div className="overflow-hidden border rounded-xl theme-border">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="theme-bg-primary theme-border border-b text-xs font-bold uppercase tracking-wider theme-text-secondary">
                <tr>
                  <th className="px-6 py-4">URL Feed Link</th>
                  <th className="px-6 py-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {rssUrls.map((url, index) => (
                  <tr key={index} className="theme-hover transition-colors">
                    <td className="px-6 py-4 font-medium theme-text-primary break-all">
                      {url}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUrl(index)}
                        disabled={actionLoading}
                        className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove feed"
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
    </div>
  );
};

export default AdminRSS;
