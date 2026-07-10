import { useState, useEffect } from 'react';

const AdminLLM: React.FC = () => {
  const [llmUrl, setLlmUrl] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      const data = await res.json();
      setLlmUrl(data.llm_url || '');
      setLlmModel(data.llm_model || '');
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ text: 'Failed to load LLM configurations.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveLLM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!llmUrl.trim() || !llmModel.trim()) return;

    setActionLoading(true);
    setMessage(null);
    try {
      // 1. Fetch current settings first
      const currentRes = await fetch('http://localhost:5000/api/settings');
      const currentSettings = await currentRes.json();
      
      // 2. Merge details
      const updatedSettings = {
        ...currentSettings,
        llm_url: llmUrl.trim(),
        llm_model: llmModel.trim()
      };

      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const result = await res.json();
      if (result.status === 'success') {
        setMessage({ text: 'LLM settings updated successfully.', type: 'success' });
      } else {
        setMessage({ text: result.error || 'Failed to save settings.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to update LLM configuration.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestLLM = async () => {
    if (!llmUrl.trim() || !llmModel.trim()) return;

    setTestLoading(true);
    setMessage({ text: 'Testing connection to LLM...', type: 'info' });
    try {
      const res = await fetch('http://localhost:5000/api/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llm_url: llmUrl.trim(),
          llm_model: llmModel.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
      } else {
        setMessage({ text: data.message || 'LLM connection check failed.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Connection failed. Check if your local Ollama server is running and accessible.', type: 'error' });
    } finally {
      setTestLoading(false);
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
        <h2 className="text-2xl font-bold theme-text-primary">LLM Engine Configuration</h2>
        <p className="text-sm theme-text-secondary mt-1">Configure parameters for entity extraction, relationship inference, and RAG Chat</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : message.type === 'info'
            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Configuration panel */}
      <div className="p-6 rounded-2xl border theme-card-bg theme-border">
        <h3 className="text-lg font-semibold theme-text-primary mb-6">Connection Details</h3>
        <form onSubmit={handleSaveLLM} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-secondary uppercase tracking-wider block">
                Local LLM Endpoint URL
              </label>
              <input
                type="text"
                value={llmUrl}
                onChange={(e) => setLlmUrl(e.target.value)}
                placeholder="http://localhost:11434"
                disabled={actionLoading}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-primary theme-text-primary"
                required
              />
              <span className="text-[11px] theme-text-secondary">Ollama default: http://localhost:11434 or your hosted API URL</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-secondary uppercase tracking-wider block">
                Model Identifier Tag
              </label>
              <input
                type="text"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                placeholder="mistral:latest"
                disabled={actionLoading}
                className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-primary theme-text-primary"
                required
              />
              <span className="text-[11px] theme-text-secondary">Example tags: mistral:latest, llama3, qwen:7b, etc.</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t theme-border">
            <button
              type="submit"
              disabled={actionLoading || testLoading}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-95 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Saving Settings...' : 'Save Configuration'}
            </button>
            <button
              type="button"
              onClick={handleTestLLM}
              disabled={actionLoading || testLoading || !llmUrl.trim() || !llmModel.trim()}
              className="px-6 py-3 border hover:bg-indigo-500/5 rounded-xl text-sm font-semibold transition-all cursor-pointer theme-border theme-text-primary disabled:opacity-50"
            >
              {testLoading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </form>
      </div>

      <div className="p-6 rounded-2xl border theme-card-bg theme-border">
        <h3 className="text-sm font-bold uppercase tracking-wider theme-text-secondary mb-3">Model Requirements</h3>
        <p className="text-xs theme-text-secondary leading-relaxed">
          The background scraper calls the `/api/generate` endpoint forcing JSON format for entity/relation extractions. Make sure the local Ollama instance supports JSON schemas (Ollama v0.1.20+ is recommended). RAG Chat will access `/api/chat` using System instructions to synthesize answers based on retrieve knowledge chunks.
        </p>
      </div>
    </div>
    </div>
  );
};

export default AdminLLM;
