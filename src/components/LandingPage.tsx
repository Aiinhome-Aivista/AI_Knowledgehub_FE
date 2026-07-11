import React, { useState, useEffect } from 'react';

interface Topic {
  id: number;
  name: string;
  category: string;
  created_at: string;
}

interface SearchLog {
  query: string;
  count: number;
}

interface MostWritten {
  name: string;
  count: number;
}

interface DataCoverage {
  total_articles: number;
  total_connectors: number;
  total_topics: number;
  arango_nodes: number;
  arango_edges: number;
}

interface LandingData {
  top_keywords: Topic[];
  most_searched: SearchLog[];
  most_written: MostWritten[];
  data_coverage: DataCoverage;
}

interface LandingPageProps {
  onCardClick?: (cardType: 'articles' | 'keywords' | 'connectors') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onCardClick }) => {
  const [data, setData] = useState<LandingData | null>(null);
  const [activeTab, setActiveTab] = useState<'keywords' | 'searched' | 'written' | 'coverage'>('keywords');
  const [kwPage, setKwPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLandingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/landing-data');
      if (!res.ok) {
        throw new Error('Failed to retrieve landing stats.');
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection failed: could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingData();
  }, []);

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'person': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'organization': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'location': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'event': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full theme-bg-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm theme-text-secondary animate-pulse">Loading intelligence telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center h-full theme-bg-primary">
        <div className="max-w-md text-center space-y-4 p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
          <div className="text-red-400 font-semibold">Telemetry Retrieval Failed</div>
          <p className="text-sm theme-text-secondary">{error}</p>
          <button
            onClick={fetchLandingData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-8 theme-bg-primary">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border theme-border theme-card-bg p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-indigo-500/5">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

        <div className="space-y-2 relative z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            System Dashboard
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight theme-text-primary bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Knowledge Hub Intelligence
          </h1>
          <p className="text-sm theme-text-secondary max-w-xl">
            Real-time insights on extracted entities, semantic search metrics, and graph coverage metrics.
          </p>
        </div>

        <button
          onClick={fetchLandingData}
          className="relative z-10 flex items-center space-x-2 px-4 py-2.5 rounded-xl border theme-border theme-card-bg hover:bg-indigo-500/10 hover:text-indigo-400 transition-all font-semibold text-xs theme-text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H12M4 9h8" />
          </svg>
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex border-b theme-border space-x-1 p-1 bg-white/[0.02] backdrop-blur-md rounded-2xl max-w-2xl border theme-border">
        {(['keywords', 'searched', 'written', 'coverage'] as const).map((tab) => {
          const tabLabel = {
            keywords: 'Top Keywords Found',
            searched: 'Most Searched Items',
            written: 'Most Written About',
            coverage: 'Data Coverage'
          }[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/15'
                  : 'theme-text-secondary hover:theme-text-primary hover:bg-white/[0.02]'
                }`}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'keywords' && (() => {
          const KW_PER_PAGE = 10;
          const totalKw = data?.top_keywords.length || 0;
          const totalPages = Math.max(1, Math.ceil(totalKw / KW_PER_PAGE));
          const safePage = Math.min(kwPage, totalPages);
          const pageSlice = (data?.top_keywords || []).slice((safePage - 1) * KW_PER_PAGE, safePage * KW_PER_PAGE);
          const startIdx = (safePage - 1) * KW_PER_PAGE;
          return (
            <div className="p-6 rounded-2xl border theme-card-bg theme-border shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center border-b theme-border pb-4">
                <div>
                  <h3 className="text-lg font-bold theme-text-primary">Top Keywords Found</h3>
                  <p className="text-xs theme-text-secondary">Recent proper nouns and entities ingested from articles</p>
                </div>
                <span className="text-xs font-semibold theme-text-secondary">{totalKw} items</span>
              </div>

              {!totalKw ? (
                <div className="text-sm theme-text-secondary italic text-center py-12">No keywords ingested yet.</div>
              ) : (
                <>
                  <div className="overflow-hidden border rounded-xl theme-border">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="theme-bg-primary theme-border border-b text-xs font-bold uppercase tracking-wider theme-text-secondary">
                        <tr>
                          <th className="px-6 py-4 w-16 whitespace-nowrap">SL No.</th>
                          <th className="px-6 py-4">Keyword Name</th>
                          <th className="px-6 py-4 w-44 whitespace-nowrap">Entity Category</th>
                          <th className="px-6 py-4 w-48 whitespace-nowrap">Ingested Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y theme-border">
                        {pageSlice.map((kw, idx) => (
                          <tr key={kw.id} className="theme-hover transition-colors">
                            <td className="px-6 py-4 theme-text-secondary font-semibold">{startIdx + idx + 1}</td>
                            <td className="px-6 py-4 font-bold theme-text-primary">{kw.name}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${getCategoryBadgeClass(kw.category)}`}>
                                {kw.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 theme-text-secondary text-xs">
                              {kw.created_at ? new Date(kw.created_at).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs theme-text-secondary">
                        Showing {startIdx + 1}–{Math.min(startIdx + KW_PER_PAGE, totalKw)} of {totalKw}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setKwPage(p => Math.max(1, p - 1))}
                          disabled={safePage === 1}
                          className="px-3 py-1.5 rounded-lg border theme-border text-xs font-semibold theme-text-secondary hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >← Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                          .reduce<(number | string)[]>((acc, p, i, arr) => {
                            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, i) =>
                            p === '…' ? (
                              <span key={`e${i}`} className="px-2 text-xs theme-text-secondary">…</span>
                            ) : (
                              <button
                                key={p}
                                onClick={() => setKwPage(p as number)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${safePage === p
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                                    : 'border theme-border theme-text-secondary hover:bg-indigo-500/10 hover:text-indigo-400'
                                  }`}
                              >{p}</button>
                            )
                          )
                        }
                        <button
                          onClick={() => setKwPage(p => Math.min(totalPages, p + 1))}
                          disabled={safePage === totalPages}
                          className="px-3 py-1.5 rounded-lg border theme-border text-xs font-semibold theme-text-secondary hover:bg-indigo-500/10 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >Next →</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {activeTab === 'searched' && (
          <div className="p-6 rounded-2xl border theme-card-bg theme-border shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center border-b theme-border pb-4">
              <div>
                <h3 className="text-lg font-bold theme-text-primary">Most Searched Items</h3>
                <p className="text-xs theme-text-secondary">RAG Chat search queries sorted by total request frequency</p>
              </div>
              <span className="text-xs font-semibold theme-text-secondary">{data?.most_searched.length || 0} terms</span>
            </div>

            {!data?.most_searched.length ? (
              <div className="text-sm theme-text-secondary italic text-center py-12">No search queries recorded yet.</div>
            ) : (
              <div className="overflow-hidden border rounded-xl theme-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="theme-bg-primary theme-border border-b text-xs font-bold uppercase tracking-wider theme-text-secondary">
                    <tr>
                      <th className="px-6 py-4">Search Query</th>
                      <th className="px-6 py-4 w-48 text-right">Search Volume (Hits)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border">
                    {data.most_searched.map((search, idx) => (
                      <tr key={idx} className="theme-hover transition-colors">
                        <td className="px-6 py-4 font-semibold theme-text-primary break-all">"{search.query}"</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 font-bold rounded-lg text-xs">
                            {search.count} Hits
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'written' && (
          <div className="p-6 rounded-2xl border theme-card-bg theme-border shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center border-b theme-border pb-4">
              <div>
                <h3 className="text-lg font-bold theme-text-primary">Most Written About</h3>
                <p className="text-xs theme-text-secondary">Keywords/Topics linked to the most ingested articles</p>
              </div>
              <span className="text-xs font-semibold theme-text-secondary">{data?.most_written.length || 0} topics</span>
            </div>

            {!data?.most_written.length ? (
              <div className="text-sm theme-text-secondary italic text-center py-12">No article-topic associations yet.</div>
            ) : (
              <div className="overflow-hidden border rounded-xl theme-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="theme-bg-primary theme-border border-b text-xs font-bold uppercase tracking-wider theme-text-secondary">
                    <tr>
                      <th className="px-6 py-4">Keyword Topic</th>
                      <th className="px-6 py-4 w-48 text-right">Associated Articles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border">
                    {data.most_written.map((topic, idx) => (
                      <tr key={idx} className="theme-hover transition-colors">
                        <td className="px-6 py-4 font-bold theme-text-primary">{topic.name}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 font-bold rounded-lg text-xs">
                            {topic.count} Articles
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'coverage' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Relational Database Counts */}
            <div
              onClick={() => onCardClick?.('articles')}
              className="p-6 rounded-2xl border theme-card-bg theme-border shadow-md flex flex-col justify-between space-y-4 cursor-pointer hover:border-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-md font-bold theme-text-primary">Articles Ingested</h4>
                <p className="text-xs theme-text-secondary mt-1">Total articles crawled and indexed in MySQL base</p>
              </div>
              <div className="text-4xl font-extrabold text-blue-400">{data?.data_coverage.total_articles || 0}</div>
            </div>

            <div
              onClick={() => onCardClick?.('keywords')}
              className="p-6 rounded-2xl border theme-card-bg theme-border shadow-md flex flex-col justify-between space-y-4 cursor-pointer hover:border-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 100-2h-1a1 1 0 100 2h1zM5.05 6.464a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM5 10a1 1 0 100-2H4a1 1 0 100 2h1zM8 16v-1a4 4 0 118 0v1a2 2 0 01-2 2H10a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-md font-bold theme-text-primary">Extracted Keywords</h4>
                <p className="text-xs theme-text-secondary mt-1">Total unique topics identified and structured</p>
              </div>
              <div className="text-4xl font-extrabold text-amber-400">{data?.data_coverage.total_topics || 0}</div>
            </div>

            <div
              onClick={() => onCardClick?.('connectors')}
              className="p-6 rounded-2xl border theme-card-bg theme-border shadow-md flex flex-col justify-between space-y-4 cursor-pointer hover:border-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h4 className="text-md font-bold theme-text-primary">Active Connectors</h4>
                <p className="text-xs theme-text-secondary mt-1">Total custom RSS & web sources configured</p>
              </div>
              <div className="text-4xl font-extrabold text-emerald-400">{data?.data_coverage.total_connectors || 0}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
