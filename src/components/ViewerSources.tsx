import { useState, useEffect } from 'react';
import { endpoint } from '../../config/endpoint';

interface Article {
  id: number;
  title: string;
  source_url: string;
  created_at: string;
}

interface ViewerSourcesProps {
  onBack?: () => void;
}

const ViewerSources: React.FC<ViewerSourcesProps> = ({ onBack }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint.ARTICLES);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const articlesArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
      setArticles(articlesArray);
    } catch (err: any) {
      console.error('Failed to fetch articles:', err);
      setError(err.message || 'Failed to fetch articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(art =>
    art.title.toLowerCase().includes(search.toLowerCase()) ||
    art.source_url.toLowerCase().includes(search.toLowerCase())
  );

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
            <h2 className="text-2xl font-bold theme-text-primary">Source Monitoring</h2>
            <p className="text-sm theme-text-secondary mt-1">Review the indexed articles and crawled publications in the RAG store</p>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles by title or URL source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151b2d] rounded-xl py-3 pl-10 pr-4 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-secondary theme-text-primary"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 absolute left-3.5 top-3.5 theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Table grid */}
        <div className="p-6 rounded-2xl border theme-card-bg theme-border min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16 space-y-3 animate-in fade-in duration-300">
              <p className="text-rose-400 text-sm font-semibold">Failed to load articles</p>
              <p className="text-xs theme-text-secondary">{error}</p>
              <button
                onClick={fetchArticles}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (!articles || articles.length === 0) ? (
            <div className="text-center py-20 space-y-2 animate-in fade-in duration-300">
              <p className="theme-text-primary text-sm font-bold">No Data Found</p>
              <p className="text-xs theme-text-secondary">No articles scraped yet. Please run scraping from Admin panel.</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center theme-text-secondary py-20 italic">
              No search results found.
            </div>
          ) : (
            <div className="overflow-hidden border rounded-xl theme-border">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="theme-bg-primary theme-border border-b text-xs font-bold uppercase tracking-wider theme-text-secondary">
                  <tr>
                    <th className="px-6 py-4">Title / Header</th>
                    <th className="px-6 py-4">Web Source Link</th>
                    <th className="px-6 py-4 w-40">Processed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {filteredArticles.map((art, index) => (
                    <tr key={index} className="theme-hover transition-colors">
                      <td className="px-6 py-4 font-semibold theme-text-primary">
                        {art.title}
                      </td>
                      <td className="px-6 py-4 theme-text-secondary">
                        <a
                          href={art.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-500 underline break-all font-medium transition-colors"
                        >
                          {art.source_url}
                        </a>
                      </td>
                      <td className="px-6 py-4 theme-text-secondary whitespace-nowrap">
                        {new Date(art.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
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

export default ViewerSources;
