import React, { useState, useEffect } from 'react';
import { endpoint } from '../../config/endpoint';

interface LandingHomePageProps {
  onNavigateToLogin: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

interface TabData {
  keywords: { name: string; category: string; count: number }[];
  searches: { query: string; count: number }[];
  written: { name: string; count: number }[];
}

const LandingHomePage: React.FC<LandingHomePageProps> = ({ onNavigateToLogin, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState<'keywords' | 'searches' | 'written'>('keywords');
  const [tabData, setTabData] = useState<TabData>({ keywords: [], searches: [], written: [] });
  const [loading, setLoading] = useState(true);
  const [coverage, setCoverage] = useState({ articles: 0, topics: 0, sources: 0, nodes: 0 });

  useEffect(() => {
    const controller = new AbortController();
    // 8-second timeout — never blocks render
    const timer = setTimeout(() => controller.abort(), 8000);

    const safeFetch = async () => {
      try {
        const res = await fetch(endpoint.LANDING_DATA, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTabData({
          keywords: Array.isArray(data.top_keywords) ? data.top_keywords : [],
          searches: Array.isArray(data.most_searched) ? data.most_searched : [],
          written: Array.isArray(data.most_written) ? data.most_written : [],
        });
        const cov = data.data_coverage || {};
        setCoverage({
          articles: cov.total_articles || 0,
          topics: cov.total_topics || 0,
          sources: cov.total_connectors || 0,
          nodes: (cov.arango_nodes || 0) + (cov.arango_edges || 0),
        });
      } catch {
        // Endpoint not ready or network error — page still renders fine
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    };

    safeFetch();
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Data Connector Integration',
      desc: 'Connect RSS feeds, news portals, Wikipedia pages, research papers, and custom web sources. The engine auto-crawls portal pages to discover and ingest sub-articles seamlessly.',
      color: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
        </svg>
      ),
      title: 'Automated Graph Generation',
      desc: 'Every ingested article is automatically analyzed by a local LLM to extract proper nouns and concepts. These are then wired into a live ArangoDB knowledge graph with entities and semantic relationships.',
      color: 'from-indigo-500/20 to-indigo-600/5',
      border: 'border-indigo-500/20',
      iconColor: 'text-indigo-400',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      title: 'Wikipedia & Knowledge Extraction',
      desc: 'For every entity found in an article, the system fetches enriched Wikipedia summaries and synthesizes a comprehensive knowledge description, enriching the vector search corpus for deep retrieval.',
      color: 'from-violet-500/20 to-violet-600/5',
      border: 'border-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      title: 'AI-Powered RAG Chat',
      desc: 'Ask complex questions about any topic in the knowledge base. The system retrieves semantically relevant context from ChromaDB vector store and generates accurate, grounded answers using the local LLM.',
      color: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
  ];

  const tabs = [
    { id: 'keywords' as const, label: 'Top Keywords Found' },
    { id: 'searches' as const, label: 'Most Searched Items' },
    { id: 'written' as const, label: 'Most Written About' },
  ];

  return (
    <div className="min-h-screen flex flex-col theme-bg-primary font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b theme-border theme-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold theme-text-primary leading-tight">AI Knowledge Hub</p>
              <p className="text-[10px] theme-text-secondary leading-tight tracking-wide">Intelligent Data Intelligence</p>
            </div>
          </div>

          {/* Nav Right */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border theme-border hover:bg-white/5 transition-all cursor-pointer theme-text-secondary"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-sm font-semibold theme-text-primary border theme-border rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
            >
              Get Started →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border theme-border bg-indigo-500/5 text-xs font-semibold text-indigo-400 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Powered by Local LLM · ArangoDB · ChromaDB</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold theme-text-primary leading-tight tracking-tight">
            Your Intelligent<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Knowledge Engine
            </span>
          </h1>
          <p className="text-lg theme-text-secondary max-w-2xl mx-auto leading-relaxed">
            Ingest articles from any source, automatically extract entities, build dynamic knowledge graphs, and converse with your data using AI-powered RAG chat — all in one unified platform.
          </p>
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={onNavigateToLogin}
              className="px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl hover:opacity-90 transition-all cursor-pointer shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95"
            >
              Sign In to Dashboard →
            </button>
            <a
              href="#overview"
              className="px-7 py-3.5 text-sm font-semibold theme-text-secondary border theme-border rounded-2xl hover:bg-white/5 transition-all cursor-pointer"
            >
              Explore Features ↓
            </a>
          </div>
        </div>

        {/* Coverage stats bar */}
        <div className="relative max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Articles Ingested', value: coverage.articles, suffix: '' },
            { label: 'Topics Extracted', value: coverage.topics, suffix: '' },
            { label: 'Active Sources', value: coverage.sources, suffix: '' },
            { label: 'Graph Nodes', value: coverage.nodes, suffix: '' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border theme-border theme-card-bg p-5 text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {stat.value.toLocaleString()}{stat.suffix}
              </p>
              <p className="text-xs theme-text-secondary mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Application Overview ── */}
      <section id="overview" className="py-20 px-6 theme-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold theme-text-primary mb-3">Application Overview</h2>
            <p className="theme-text-secondary text-base max-w-2xl mx-auto">
              A fully automated pipeline from raw data ingestion to intelligent knowledge retrieval — built for scale, speed, and accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`rounded-3xl border ${f.border} bg-gradient-to-br ${f.color} p-7 flex space-x-5 group hover:scale-[1.01] transition-transform`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 border ${f.border} ${f.iconColor}`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold theme-text-primary mb-2">{f.title}</h3>
                  <p className="text-sm theme-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Data Tabs ── */}
      <section className="py-20 px-6 theme-bg-primary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold theme-text-primary mb-3">Live Knowledge Telemetry</h2>
            <p className="theme-text-secondary text-sm">Real-time data extracted from ingested articles across all connected sources.</p>
          </div>

          {/* Tab Bar */}
          <div className="flex space-x-2 p-1.5 rounded-2xl border theme-border theme-card-bg mb-8 w-fit mx-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'theme-text-secondary hover:text-indigo-400 hover:bg-white/5'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-3xl border theme-border theme-card-bg overflow-hidden">
            {loading ? (
              <div className="py-24 flex justify-center items-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs theme-text-secondary">Loading live data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Top Keywords */}
                {activeTab === 'keywords' && (
                  <div className="p-6">
                    {tabData.keywords.length === 0 ? (
                      <p className="py-16 text-center theme-text-secondary text-sm italic">No keywords indexed yet. Run a scrape to populate this data.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tabData.keywords.map((k, i) => (
                          <div key={i} className="flex items-center space-x-3 p-3 rounded-xl border theme-border hover:bg-white/[0.03] transition-colors">
                            <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold flex items-center justify-center border border-indigo-500/20">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold theme-text-primary truncate">{k.name}</p>
                              <p className="text-[10px] theme-text-secondary uppercase tracking-wider">{k.category || 'Other'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Most Searched */}
                {activeTab === 'searches' && (
                  <div className="p-6">
                    {tabData.searches.length === 0 ? (
                      <p className="py-16 text-center theme-text-secondary text-sm italic">No search queries logged yet. Use the RAG chat to generate data.</p>
                    ) : (
                      <div className="space-y-3">
                        {tabData.searches.map((s, i) => (
                          <div key={i} className="flex items-center space-x-4 p-3 rounded-xl border theme-border hover:bg-white/[0.03] transition-colors">
                            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/20 shrink-0">
                              {i + 1}
                            </span>
                            <p className="flex-1 text-sm font-medium theme-text-primary truncate">{s.query}</p>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              {s.count} hits
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Most Written About */}
                {activeTab === 'written' && (
                  <div className="p-6">
                    {tabData.written.length === 0 ? (
                      <p className="py-16 text-center theme-text-secondary text-sm italic">No article-topic mappings found yet. Run a scrape to populate this data.</p>
                    ) : (
                      <div className="space-y-3">
                        {tabData.written.map((w, i) => {
                          const max = tabData.written[0]?.count || 1;
                          const pct = Math.round((w.count / max) * 100);
                          return (
                            <div key={i} className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold theme-text-primary">{w.name}</span>
                                <span className="text-xs theme-text-secondary font-medium">{w.count} articles</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-white/5">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 theme-bg-secondary">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold theme-text-primary">Ready to Explore Your Knowledge Base?</h2>
          <p className="theme-text-secondary text-base">Sign in to access the full dashboard — add connectors, view the knowledge graph, configure the scheduler, and chat with your data.</p>
          <button
            onClick={onNavigateToLogin}
            className="inline-flex px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl hover:opacity-90 transition-all cursor-pointer shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95"
          >
            Sign In to Dashboard →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t theme-border theme-bg-primary py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[11px] theme-text-secondary">
            © {new Date().getFullYear()} AI Knowledge Hub. All rights reserved. · Built for intelligent data exploration and AI-powered knowledge retrieval.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingHomePage;
