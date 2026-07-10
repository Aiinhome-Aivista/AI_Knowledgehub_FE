import React, { useState } from 'react';
import { ENDPOINTS } from '../config/endpoint';
import AdminLLM from './components/AdminLLM';
import AdminRSS from './components/AdminRSS';
import AdminScheduling from './components/AdminScheduling';
import SystemTerminal from './components/SystemTerminal';
import RAGChat from './components/RAGChat';
import ViewerGraph from './components/ViewerGraph';
import ViewerKeywords from './components/ViewerKeywords';
import ViewerSources from './components/ViewerSources';
import ConnectorManager from './components/ConnectorManager';
import LandingPage from './components/LandingPage';

interface DashboardProps {
  role: 'admin' | 'viewer';
  email: string;
  name: string;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

type AdminTab = 'landing' | 'llm' | 'rss' | 'scheduler' | 'logs' | 'chat' | 'connector';
type ViewerTab = 'landing' | 'graph' | 'keywords' | 'sources' | 'chat' | 'connector';

const Dashboard: React.FC<DashboardProps> = ({ role, email, name, onLogout, theme, toggleTheme }) => {
  const [adminTab, setAdminTab] = useState<AdminTab>('landing');
  const [viewerTab, setViewerTab] = useState<ViewerTab>('landing');
  const [prevAdminTab, setPrevAdminTab] = useState<AdminTab | null>(null);
  const [prevViewerTab, setPrevViewerTab] = useState<ViewerTab | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Settings modal states
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [ingestionLogs, setIngestionLogs] = useState<any[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(false);

  const handleOpenSettings = async () => {
    setSettingsModalOpen(true);
    setLoadingSettings(true);
    try {
      const [schedRes, logsRes] = await Promise.all([
        fetch(ENDPOINTS.SCHEDULER_STATUS),
        fetch(ENDPOINTS.INGESTION_LOGS)
      ]);
      const schedData = await schedRes.json();
      const logsData = await logsRes.json();
      setSchedulerStatus(schedData);
      setIngestionLogs(logsData);
    } catch (err) {
      console.error('Failed to load settings modal data:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  // SVGs for Icons
  const Icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    settings: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.533 1.533 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.533 1.533 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    llm: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.533 1.533 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.533 1.533 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    rss: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
        <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3.5 15.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
      </svg>
    ),
    scheduler: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    logs: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2 9h12V5H4v9z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M5 7a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    chat: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
      </svg>
    ),
    graph: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 100-2h-1a1 1 0 100 2h1zM5.05 6.464a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM5 10a1 1 0 100-2H4a1 1 0 100 2h1zM8 16v-1a4 4 0 118 0v1a2 2 0 01-2 2H10a2 2 0 01-2-2z" />
      </svg>
    ),
    keywords: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    sources: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    ),
    connector: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    logout: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    )
  };

  const handleKeywordSelect = (keyword: string) => {
    setSelectedTopic(keyword);
    setViewerTab('chat');
  };

  return (
    <div className="w-full h-screen flex overflow-hidden theme-bg-primary theme-text-primary">
      {/* Navigation Sidebar */}
      <aside className={`border-r theme-border theme-bg-secondary flex flex-col justify-between shrink-0 select-none transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div>
          {/* Logo & Header */}
          <div className={`p-6 border-b theme-border flex items-center justify-between ${sidebarCollapsed ? 'flex-col space-y-4 px-2' : 'space-x-3'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
                <div className="w-full h-full bg-[#151b2d] rounded-[15px] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                    <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                  </svg>
                </div>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h2 className="text-md font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[130px]">
                    AI Knowledge Hub
                  </h2>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${role === 'admin' ? 'bg-purple-500 animate-pulse' : 'bg-indigo-500'}`}></span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider theme-text-secondary">
                      {role === 'admin' ? 'Admin Portal' : 'Viewer Portal'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg border theme-border hover:bg-white/5 transition-all text-indigo-500 cursor-pointer shrink-0"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {role === 'admin' ? (
              <>
                <button
                  onClick={() => setAdminTab('landing')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${adminTab === 'landing'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Dashboard Home" : ""}
                >
                  {Icons.dashboard}
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>
                <button
                  onClick={() => setAdminTab('llm')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${adminTab === 'llm'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "LLM Config" : ""}
                >
                  {Icons.llm}
                  {!sidebarCollapsed && <span>LLM Config</span>}
                </button>
                <button
                  onClick={() => setAdminTab('rss')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${adminTab === 'rss'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "RSS Sources" : ""}
                >
                  {Icons.rss}
                  {!sidebarCollapsed && <span>RSS Sources</span>}
                </button>
                <button
                  onClick={() => setAdminTab('scheduler')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${adminTab === 'scheduler'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Scheduler" : ""}
                >
                  {Icons.scheduler}
                  {!sidebarCollapsed && <span>Scheduler</span>}
                </button>
                <button
                  onClick={() => setAdminTab('logs')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${adminTab === 'logs'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "System Console" : ""}
                >
                  {Icons.logs}
                  {!sidebarCollapsed && <span>System Console</span>}
                </button>
                <button
                  onClick={() => setAdminTab('connector')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${adminTab === 'connector'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Source Connectors" : ""}
                >
                  {Icons.connector}
                  {!sidebarCollapsed && <span>Source Connectors</span>}
                </button>
                <button
                  onClick={() => setAdminTab('chat')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${adminTab === 'chat'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "RAG Chat" : ""}
                >
                  {Icons.chat}
                  {!sidebarCollapsed && <span>RAG Chat</span>}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setViewerTab('landing')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${viewerTab === 'landing'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Dashboard Home" : ""}
                >
                  {Icons.dashboard}
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </button>
                <button
                  onClick={() => setViewerTab('connector')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${viewerTab === 'connector'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Source Connectors" : ""}
                >
                  {Icons.connector}
                  {!sidebarCollapsed && <span>Connectors</span>}
                </button>
                <button
                  onClick={() => setViewerTab('sources')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${viewerTab === 'sources'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Source Monitoring" : ""}
                >
                  {Icons.sources}
                  {!sidebarCollapsed && <span>Data Logs</span>}
                </button>
                <button
                  onClick={() => setViewerTab('keywords')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${viewerTab === 'keywords'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Keywords Index" : ""}
                >
                  {Icons.keywords}
                  {!sidebarCollapsed && <span>K-graph Topics</span>}
                </button>
                <button
                  onClick={() => setViewerTab('chat')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3'} ${viewerTab === 'chat'
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-indigo-500 border-l-4 border-indigo-500 pl-3'
                    : 'theme-text-secondary hover:bg-white/[0.03] theme-hover border-l-4 border-transparent'
                    }`}
                  title={sidebarCollapsed ? "Ask RAG Engine" : ""}
                >
                  {Icons.chat}
                  {!sidebarCollapsed && <span>Ask RAG Engine</span>}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Footer Profile & Settings */}
        <div className="p-4 border-t theme-border">
          <div className={`flex items-center justify-between mb-4 ${sidebarCollapsed ? 'flex-col space-y-4' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                {email.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-[10px] theme-text-secondary uppercase tracking-widest font-semibold">User Account</p>
                  <p className="text-xs font-semibold theme-text-primary truncate max-w-[130px]">{email}</p>
                </div>
              )}
            </div>

            {/* Action Buttons: Settings & Theme */}
            <div className={`flex items-center space-x-1.5 shrink-0 ${sidebarCollapsed ? 'flex-col space-y-2 space-x-0' : ''}`}>
              <button
                onClick={handleOpenSettings}
                className="p-2 rounded-xl border bg-white/5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer theme-border theme-text-primary text-indigo-500"
                title="System Ingest Settings & Logs"
              >
                {Icons.settings}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border bg-white/5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer theme-border theme-text-primary"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-indigo-900" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`flex items-center justify-center space-x-2 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-98 ${sidebarCollapsed ? 'w-10 h-10 px-0' : 'w-full'}`}
            title="Logout Account"
          >
            {Icons.logout}
            {!sidebarCollapsed && <span>Logout Account</span>}
          </button>
        </div>
      </aside>

      {/* Main Contents Panel */}
      <main className="flex-1 flex flex-col overflow-hidden theme-bg-primary">
        {role === 'admin' ? (
          <div className="flex-1 h-full overflow-hidden">
            {adminTab === 'landing' && (
              <LandingPage 
                onCardClick={(type) => {
                  setPrevAdminTab('landing');
                  if (type === 'articles') setAdminTab('logs');
                  else if (type === 'keywords') setAdminTab('chat');
                  else if (type === 'connectors') setAdminTab('connector');
                }}
              />
            )}
            {adminTab === 'llm' && <AdminLLM />}
            {adminTab === 'rss' && <AdminRSS />}
            {adminTab === 'scheduler' && <AdminScheduling />}
            {adminTab === 'logs' && (
              <SystemTerminal
                onBack={prevAdminTab ? () => { setAdminTab(prevAdminTab); setPrevAdminTab(null); } : undefined}
              />
            )}
            {adminTab === 'connector' && (
              <ConnectorManager
                onBack={prevAdminTab ? () => { setAdminTab(prevAdminTab); setPrevAdminTab(null); } : undefined}
              />
            )}
            {adminTab === 'chat' && (
              <div className="flex-1 h-full overflow-hidden">
                <RAGChat name={name} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 h-full overflow-hidden flex flex-col">
            {viewerTab === 'landing' && (
              <LandingPage 
                onCardClick={(type) => {
                  setPrevViewerTab('landing');
                  if (type === 'articles') setViewerTab('sources');
                  else if (type === 'keywords') setViewerTab('keywords');
                  else if (type === 'connectors') setViewerTab('connector');
                }}
              />
            )}
            {viewerTab === 'graph' && <ViewerGraph theme={theme} />}
            {viewerTab === 'keywords' && (
              <ViewerKeywords
                onKeywordSelect={handleKeywordSelect}
                onBack={prevViewerTab ? () => { setViewerTab(prevViewerTab); setPrevViewerTab(null); } : undefined}
              />
            )}
            {viewerTab === 'sources' && (
              <ViewerSources
                onBack={prevViewerTab ? () => { setViewerTab(prevViewerTab); setPrevViewerTab(null); } : undefined}
              />
            )}
            {viewerTab === 'connector' && (
              <ConnectorManager
                onBack={prevViewerTab ? () => { setViewerTab(prevViewerTab); setPrevViewerTab(null); } : undefined}
              />
            )}
            {viewerTab === 'chat' && (
              <div className="flex-1 h-full overflow-hidden animate-in fade-in duration-300">
                <RAGChat
                  initialInput={selectedTopic}
                  onClearInitialInput={() => setSelectedTopic(undefined)}
                  name={name}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal Popup Overlay */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl border theme-border theme-card-bg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b theme-border flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  {Icons.settings}
                </div>
                <div>
                  <h3 className="text-lg font-bold theme-text-primary">System Operations & Ingestion Logs</h3>
                  <p className="text-xs theme-text-secondary">View execution schedules and detailed scraping logs</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="p-1.5 rounded-lg border theme-border hover:bg-white/5 transition-colors cursor-pointer text-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {loadingSettings ? (
                <div className="py-20 flex justify-center items-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs theme-text-secondary">Loading scheduler status & audit logs...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Operations Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Schedule configuration Card */}
                    <div className="p-5 rounded-2xl border theme-border theme-bg-primary space-y-4">
                      <h4 className="text-sm font-bold theme-text-primary flex items-center space-x-2">
                        <span>Background Scheduler Status</span>
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center py-2 border-b theme-border">
                          <span className="theme-text-secondary font-medium">Engine Status</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${schedulerStatus?.scheduler_running
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {schedulerStatus?.scheduler_running ? 'Active & Running' : 'Suspended'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b theme-border">
                          <span className="theme-text-secondary font-medium">Last Audited Execution</span>
                          <span className="theme-text-primary font-semibold">
                            {schedulerStatus?.last_run?.timestamp
                              ? new Date(schedulerStatus.last_run.timestamp).toLocaleString()
                              : 'Never Executed'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="theme-text-secondary font-medium">Next Automated Scraping</span>
                          <span className="theme-text-primary font-semibold">
                            {schedulerStatus?.jobs?.[0]?.next_run_time
                              ? new Date(schedulerStatus.jobs[0].next_run_time).toLocaleString()
                              : 'No job configured'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Last Scraping Run Card */}
                    <div className="p-5 rounded-2xl border theme-border theme-bg-primary space-y-4">
                      <h4 className="text-sm font-bold theme-text-primary">Last Ingest Summary</h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center py-2 border-b theme-border">
                          <span className="theme-text-secondary font-medium">Status</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${schedulerStatus?.last_run?.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                            {schedulerStatus?.last_run?.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b theme-border">
                          <span className="theme-text-secondary font-medium">Articles Processed</span>
                          <span className="theme-text-primary font-bold">{schedulerStatus?.last_run?.articles_processed?.length || 0} Articles</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="theme-text-secondary font-medium">Graph Changes (Nodes / Edges)</span>
                          <span className="theme-text-primary font-bold text-indigo-400">
                            +{schedulerStatus?.last_run?.nodes_added || 0} N / +{schedulerStatus?.last_run?.edges_added || 0} E
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Article Ingestion Log Table */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold theme-text-primary">Recent Ingestion History Logs</h4>
                    <div className="overflow-hidden border rounded-xl theme-border text-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="theme-bg-primary theme-border border-b font-bold uppercase tracking-wider theme-text-secondary text-[10px]">
                            <tr>
                              <th className="px-5 py-3 w-44">Timestamp</th>
                              <th className="px-5 py-3 w-28">Status</th>
                              <th className="px-5 py-3 w-28">Articles</th>
                              <th className="px-5 py-3 w-40">Graph Changes</th>
                              <th className="px-5 py-3">Logged Errors</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y theme-border">
                            {ingestionLogs.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-5 py-8 text-center theme-text-secondary italic">
                                  No audit logs found.
                                </td>
                              </tr>
                            ) : (
                              ingestionLogs.map((log, idx) => (
                                <tr key={idx} className="theme-hover transition-colors">
                                  <td className="px-5 py-3 theme-text-secondary whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-5 py-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${log.status === 'SUCCESS'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 theme-text-primary font-medium">
                                    {log.articles_processed?.length || 0} processed
                                  </td>
                                  <td className="px-5 py-3 theme-text-secondary font-medium whitespace-nowrap">
                                    +{log.nodes_added || 0} Nodes / +{log.edges_added || 0} Edges
                                  </td>
                                  <td className="px-5 py-3 font-mono text-[10px] text-rose-400 break-all max-w-[200px] truncate" title={log.errors?.join(', ') || 'None'}>
                                    {log.errors?.length > 0 ? log.errors.join(', ') : <span className="text-emerald-500">None</span>}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t theme-border flex justify-end bg-white/[0.01]">
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
