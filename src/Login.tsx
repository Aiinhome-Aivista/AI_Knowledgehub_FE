import { useState } from 'react';

import { ENDPOINTS } from '../config/endpoint';

interface LoginProps {
  onLogin: (role: 'admin' | 'viewer', email: string, name: string) => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack, theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        onLogin(data.role, cleanEmail, data.name || '');
      } else {
        setError(data.error || 'Invalid email or password. Access denied.');
      }
    } catch (err) {
      setError('Cannot connect to the authentication server. Please check your backend connection.');
    }
  };

  return (
    <div className={`w-full min-h-screen flex items-center justify-center relative overflow-hidden px-4 transition-colors duration-300 ${theme === 'light' ? 'bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-200' : 'bg-slate-950'}`}>
      {/* Background blobs for aesthetics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl border theme-border hover:bg-white/5 transition-all cursor-pointer theme-text-secondary hover:theme-text-primary group"
          title="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs font-semibold">Back</span>
        </button>
      </div>

      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full border bg-white/5 backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer theme-border theme-text-primary"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-900" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-md backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border transition-all duration-300 theme-card-bg theme-border shadow-indigo-500/5">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            AI Knowledge Hub
          </h1>
          <p className="text-sm mt-2 theme-text-secondary">
            Enter your credentials to access the hub
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          
          {/* Email input */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="text-xs font-semibold uppercase tracking-wider theme-text-secondary">
              Email ID / Username
            </label>
            <input
              type="text"
              placeholder="Enter email (e.g., admin@ai.com)"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-primary theme-text-primary"
              required
            />
          </div>

          {/* Password input */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="text-xs font-semibold uppercase tracking-wider theme-text-secondary">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all theme-border theme-bg-primary theme-text-primary"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold rounded-xl transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-500/20 transform hover:-translate-y-0.5 active:translate-y-0 text-sm shadow-md"
          >
            Login
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t pt-6 theme-border">
          <p className="text-[11px] theme-text-secondary">
            RAG Knowledge Hub Engine &bull; ArangoDB Graph &bull; ChromaDB Vector
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
