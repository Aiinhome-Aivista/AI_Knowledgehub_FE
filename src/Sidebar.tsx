import React, { useEffect, useState } from 'react';

import { ENDPOINTS } from '../config/endpoint';

interface Topic {
  name: string;
  category: string;
}

interface SidebarProps {
  onTopicSelect?: (topic: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onTopicSelect }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(ENDPOINTS.TOPICS);
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

  // Filter topics based on search query
  const filteredTopics = topics.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  // Group topics alphabetically
  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    const firstLetter = topic.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  const sortedLetters = Object.keys(groupedTopics).sort();

  return (
    <div className="w-80 h-full theme-bg-secondary backdrop-blur-2xl border-r theme-border flex flex-col shrink-0 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-5 border-b theme-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold theme-text-primary flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>Extracted Entities</span>
          </h2>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="text-[10px] px-2.5 py-1 rounded-lg border theme-border theme-hover transition-colors font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            title="Toggle category labels visibility"
          >
            {showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
        </div>
        <p className="text-xs theme-text-secondary mt-1">Knowledge graph proper nouns</p>
        
        {/* Search */}
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full theme-bg-primary border theme-border rounded-xl py-2 pl-9 pr-4 text-sm theme-text-primary placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        {loading ? (
          <div className="p-5 flex justify-center">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : search.trim() === '' ? (
          <div className="p-8 text-center theme-text-secondary text-sm flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 theme-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Type to search entities...
          </div>
        ) : sortedLetters.length === 0 ? (
          <div className="p-8 text-center theme-text-secondary text-sm">
            No topics found.
          </div>
        ) : (
          <div className="p-3 space-y-6">
            {sortedLetters.map(letter => (
              <div key={letter} className="animate-in fade-in duration-500">
                <div className="sticky top-0 theme-bg-secondary backdrop-blur py-1 z-10 px-2 mb-2">
                  <span className="text-xs font-bold text-indigo-400/80 uppercase tracking-wider">{letter}</span>
                </div>
                <div className="space-y-1">
                  {groupedTopics[letter].map((topic, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onTopicSelect && onTopicSelect(topic.name)}
                      className="group px-3 py-2.5 rounded-lg theme-hover transition-colors cursor-pointer border border-transparent hover:border-indigo-500/10 flex items-center justify-between"
                    >
                      <span className="text-sm theme-text-primary font-medium group-hover:text-indigo-500 transition-colors truncate pr-2">
                        {topic.name}
                      </span>
                      {showLabels && topic.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300/80 border border-indigo-500/20 whitespace-nowrap animate-in fade-in duration-255">
                          {topic.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
