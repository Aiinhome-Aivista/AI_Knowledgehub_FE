import { useEffect, useState } from 'react';

interface Topic {
  name: string;
  category: string;
}

interface ViewerKeywordsProps {
  onKeywordSelect: (keyword: string) => void;
  onBack?: () => void;
}

const ViewerKeywords: React.FC<ViewerKeywordsProps> = ({ onKeywordSelect, onBack }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/topics');
        const data = await res.json();
        if (!data.error) {
          setTopics(data);
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // Filter topics based on search query, category, and selected first letter
  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.name.toLowerCase().startsWith(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesLetter = selectedLetter === 'All' || t.name.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesCategory && matchesLetter;
  });

  // Get distinct categories
  const categories = ['All', ...Array.from(new Set(topics.map(t => t.category).filter(Boolean)))];

  // Group topics alphabetically
  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    const firstLetter = topic.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  const sortedLetters = Object.keys(groupedTopics).sort();

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
            <h2 className="text-2xl font-bold theme-text-primary">Keywords</h2>
            <p className="text-sm theme-text-secondary mt-1">Browse proper noun entities extracted from the Knowledge Base. Click a keyword to ask the RAG chat engine about it.</p>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Search */}
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search keywords starting with (e.g. 'm')..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedLetter('All'); // Clear letter filter when user typing search query
              }}
              className="w-full bg-[#151b2d] rounded-xl py-3 pl-10 pr-4 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-secondary theme-text-primary"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 absolute left-3.5 top-3.5 theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category select */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#151b2d] rounded-xl py-3 px-4 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer theme-border theme-bg-secondary theme-text-primary"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alphabet quick selector row */}
        <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border theme-card-bg theme-border justify-center">
          <button
            onClick={() => { setSelectedLetter('All'); setSearch(''); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedLetter === 'All'
                ? 'bg-indigo-600 text-white'
                : 'theme-text-secondary hover:bg-white/[0.05]'
              }`}
          >
            All
          </button>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
            // Check if any topics currently exist starting with this letter under the selected category
            const hasTopics = topics.some(t =>
              t.name.toUpperCase().startsWith(letter) &&
              (selectedCategory === 'All' || t.category === selectedCategory)
            );
            return (
              <button
                key={letter}
                disabled={!hasTopics}
                onClick={() => { setSelectedLetter(letter); setSearch(''); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedLetter === letter
                    ? 'bg-indigo-600 text-white'
                    : hasTopics
                      ? 'theme-text-primary hover:bg-indigo-500/10 hover:text-indigo-400'
                      : 'text-slate-600 cursor-not-allowed opacity-30'
                  }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Results grid */}
        <div className="p-6 rounded-2xl border theme-card-bg theme-border min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : sortedLetters.length === 0 ? (
            <div className="text-center theme-text-secondary py-20 italic">
              No keywords found matching current criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedLetters.map(letter => (
                <div key={letter} className="border-b last:border-b-0 pb-4 last:pb-0 theme-border">
                  <div className="sticky top-0 py-1 bg-inherit z-10 mb-3">
                    <span className="text-sm font-bold text-indigo-500 uppercase tracking-wider">{letter}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {groupedTopics[letter].map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => onKeywordSelect(topic.name)}
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 hover:border-indigo-500/40 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group shadow-sm hover:shadow-indigo-500/5"
                      >
                        <span className="font-medium theme-text-primary group-hover:text-indigo-400 transition-colors">
                          {topic.name}
                        </span>
                        {topic.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {topic.category}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerKeywords;
